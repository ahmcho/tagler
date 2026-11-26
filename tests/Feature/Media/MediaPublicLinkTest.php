<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Media\Models\Media;
use App\Modules\Settings\Enums\SettingKeyEnum;
use App\Modules\Settings\Services\Contracts\SettingServiceContract;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

beforeEach(function (): void {
    (new RolesAndPermissionsSeeder)->run();

    Storage::fake('public');
    Storage::fake('local');

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Admin');
});

afterEach(function (): void {
    Carbon::setTestNow();
});

test('a public file is served by its uuid without a login and the URL shows no storage path', function (): void {
    Storage::disk('public')->put('media/photo.jpg', 'jpeg-bytes');
    $media = Media::factory()->public()->create([
        'disk' => 'public',
        'path' => 'media/photo.jpg',
        'mime_type' => 'image/jpeg',
    ]);

    $url = route('media.public', ['file' => $media->uuid]);

    expect($url)->toEndWith('/media/'.$media->uuid);

    $this->get($url)
        ->assertOk()
        ->assertHeader('Content-Type', 'image/jpeg')
        ->assertHeader('X-Content-Type-Options', 'nosniff');
});

test('a private file is never served by the public route', function (): void {
    Storage::disk('local')->put('media/secret.pdf', 'pdf-bytes');
    $media = Media::factory()->pdf()->create(['disk' => 'local', 'path' => 'media/secret.pdf']);

    $this->get(route('media.public', ['file' => $media->uuid]))->assertNotFound();
});

test('a trashed public file is not served', function (): void {
    Storage::disk('public')->put('media/gone.jpg', 'jpeg-bytes');
    $media = Media::factory()->public()->create(['disk' => 'public', 'path' => 'media/gone.jpg']);
    $media->delete();

    $this->get(route('media.public', ['file' => $media->uuid]))->assertNotFound();
});

test('a public thumbnail is served by uuid and a private one is not', function (): void {
    Storage::disk('public')->put('media/hero-thumb.jpg', 'thumb-bytes');
    Storage::disk('local')->put('media/secret-thumb.jpg', 'thumb-bytes');

    $public = Media::factory()->public()->create([
        'disk' => 'public',
        'path' => 'media/hero.jpg',
        'metadata' => ['conversions' => ['thumbnail' => ['path' => 'media/hero-thumb.jpg', 'mime_type' => 'image/jpeg']]],
    ]);
    $private = Media::factory()->create([
        'disk' => 'local',
        'path' => 'media/secret.jpg',
        'metadata' => ['conversions' => ['thumbnail' => ['path' => 'media/secret-thumb.jpg', 'mime_type' => 'image/jpeg']]],
    ]);

    $this->get(route('media.public.conversion', ['file' => $public->uuid, 'conversion' => 'thumbnail']))
        ->assertOk();
    $this->get(route('media.public.conversion', ['file' => $private->uuid, 'conversion' => 'thumbnail']))
        ->assertNotFound();
});

test('an upload is stored under its uuid without year and month folders', function (): void {
    $this->actingAs($this->admin)->postJson(route('media.files.store'), [
        'file' => UploadedFile::fake()->image('summer.jpg', 20, 20),
        'visibility' => 'public',
    ])->assertCreated();

    $media = Media::query()->firstOrFail();

    expect($media->path)->toMatch('#^media/'.$media->uuid.'\.[a-z]+$#');
});

test('a private file link expires after the file lifetime when the file has one', function (): void {
    Carbon::setTestNow('2026-11-26 10:00:00');

    $media = Media::factory()->create(['disk' => 'local', 'path' => 'media/a.pdf', 'link_ttl_minutes' => 45]);

    $url = $this->actingAs($this->admin)->getJson(route('media.files.url', $media))
        ->assertOk()
        ->assertJsonPath('temporary', true)
        ->json('url');

    parse_str((string) parse_url($url, PHP_URL_QUERY), $query);

    expect((int) $query['expires'])->toBe(Carbon::now()->addMinutes(45)->timestamp);
});

test('a private file link uses the global setting when the file has no lifetime', function (): void {
    Carbon::setTestNow('2026-11-26 10:00:00');

    app(SettingServiceContract::class)->setMany(['media_link_ttl_minutes' => 45]);

    $media = Media::factory()->create(['disk' => 'local', 'path' => 'media/b.pdf', 'link_ttl_minutes' => null]);

    $url = $this->actingAs($this->admin)->getJson(route('media.files.url', $media))
        ->assertOk()
        ->json('url');

    parse_str((string) parse_url($url, PHP_URL_QUERY), $query);

    expect((int) $query['expires'])->toBe(Carbon::now()->addMinutes(45)->timestamp);
});

test('the global link lifetime defaults to 15 minutes', function (): void {
    Carbon::setTestNow('2026-11-26 10:00:00');

    $media = Media::factory()->create(['disk' => 'local', 'path' => 'media/c.pdf', 'link_ttl_minutes' => null]);

    $url = $this->actingAs($this->admin)->getJson(route('media.files.url', $media))->json('url');

    parse_str((string) parse_url($url, PHP_URL_QUERY), $query);

    expect((int) $query['expires'])->toBe(Carbon::now()->addMinutes(15)->timestamp);
});

test('a public file URL never depends on the link lifetime', function (): void {
    $media = Media::factory()->public()->create(['disk' => 'public', 'path' => 'media/d.jpg', 'link_ttl_minutes' => 5]);

    $this->actingAs($this->admin)->getJson(route('media.files.url', $media))
        ->assertOk()
        ->assertJsonPath('temporary', false)
        ->assertJsonPath('url', route('media.public', ['file' => $media->uuid]));
});

test('the link lifetime accepts only whole numbers of at least 1 and can be cleared', function (): void {
    $media = Media::factory()->create(['disk' => 'local', 'path' => 'media/e.pdf', 'link_ttl_minutes' => null]);

    foreach (['0', 'abc', '2.5', '-3'] as $invalid) {
        $this->actingAs($this->admin)
            ->patchJson(route('media.files.update', $media), ['link_ttl_minutes' => $invalid])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('link_ttl_minutes');
    }

    $this->actingAs($this->admin)
        ->patchJson(route('media.files.update', $media), ['link_ttl_minutes' => 30])
        ->assertOk()
        ->assertJsonPath('data.link_ttl_minutes', 30);

    expect($media->refresh()->link_ttl_minutes)->toBe(30);

    $this->actingAs($this->admin)
        ->patchJson(route('media.files.update', $media), ['link_ttl_minutes' => null])
        ->assertOk()
        ->assertJsonPath('data.link_ttl_minutes', null);

    expect($media->refresh()->link_ttl_minutes)->toBeNull();
});

test('the global link lifetime setting validates as a whole number of at least 1', function (): void {
    $rules = ['value' => SettingKeyEnum::MediaLinkTtlMinutes->rules()];

    expect(Validator::make(['value' => '45'], $rules)->passes())->toBeTrue()
        ->and(Validator::make(['value' => '0'], $rules)->fails())->toBeTrue()
        ->and(Validator::make(['value' => 'abc'], $rules)->fails())->toBeTrue();
});
