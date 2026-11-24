<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Auth\Models\Role;
use App\Modules\Media\Enums\MediaVisibility;
use App\Modules\Media\Models\Media;
use App\Modules\Media\Repositories\Contracts\MediaRepositoryContract;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

beforeEach(function (): void {
    (new RolesAndPermissionsSeeder)->run();

    Storage::fake('public');
    Storage::fake('local');

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Admin');
});

test('an upload stores the file under a generated name and keeps the original name in the database', function (): void {
    $response = $this->actingAs($this->admin)->postJson(route('media.files.store'), [
        'file' => UploadedFile::fake()->image('Summer Photo.jpg', 200, 100),
        'title' => 'Summer',
        'visibility' => 'public',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Summer Photo.jpg')
        ->assertJsonPath('data.category', 'pictures')
        ->assertJsonPath('data.visibility', 'public')
        ->assertJsonMissingPath('data.path')
        ->assertJsonMissingPath('data.disk');

    $media = Media::query()->firstOrFail();

    expect($media->path)->not->toContain('Summer')
        ->and($media->file_name)->toBe($media->uuid.'.jpg')
        ->and($media->disk)->toBe('public')
        ->and($media->checksum)->toHaveLength(64)
        ->and($media->uploaded_by)->toBe($this->admin->id);

    Storage::disk('public')->assertExists($media->path);
});

test('the stored checksum is the SHA-256 of the file bytes', function (): void {
    $file = UploadedFile::fake()->image('photo.png', 40, 40);
    $expected = hash_file('sha256', $file->getRealPath());

    $this->actingAs($this->admin)->postJson(route('media.files.store'), ['file' => $file])->assertCreated();

    expect(Media::query()->firstOrFail()->checksum)->toBe($expected);
});

test('a private upload is stored on the private disk', function (): void {
    $this->actingAs($this->admin)->postJson(route('media.files.store'), [
        'file' => UploadedFile::fake()->create('report.pdf', 10, 'application/pdf'),
    ])->assertCreated()->assertJsonPath('data.visibility', 'private');

    $media = Media::query()->firstOrFail();

    expect($media->disk)->toBe('local')
        ->and($media->mime_type)->toBe('application/pdf');
    Storage::disk('local')->assertExists($media->path);
});

test('a file whose real type is not allowed is rejected even with an allowed extension', function (): void {
    $executable = "\x7FELF\x02\x01\x01\x00".str_repeat("\0", 64);
    $path = tempnam(sys_get_temp_dir(), 'media');
    file_put_contents($path, $executable);

    $response = $this->actingAs($this->admin)->postJson(route('media.files.store'), [
        'file' => new UploadedFile($path, 'photo.jpg', 'image/jpeg', null, true),
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrorFor('file');
    expect(Media::query()->count())->toBe(0);
});

test('a file over the configured size limit is rejected', function (): void {
    config(['modules.media.max_upload_kilobytes' => 1]);

    $this->actingAs($this->admin)->postJson(route('media.files.store'), [
        'file' => UploadedFile::fake()->create('big.pdf', 5, 'application/pdf'),
    ])->assertUnprocessable()->assertJsonValidationErrorFor('file');
});

test('SVG is rejected unless the configuration allows it', function (): void {
    $this->actingAs($this->admin)->postJson(route('media.files.store'), [
        'file' => UploadedFile::fake()->createWithContent('logo.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
    ])->assertUnprocessable()->assertJsonValidationErrorFor('file');
});

test('a database failure after the file is written removes the stored file', function (): void {
    $this->mock(MediaRepositoryContract::class, function ($mock): void {
        $mock->shouldReceive('createFromUpload')->once()->andThrow(new RuntimeException('database down'));
    });

    $this->actingAs($this->admin)->postJson(route('media.files.store'), [
        'file' => UploadedFile::fake()->image('lost.jpg', 20, 20),
    ]);

    expect(Storage::disk('local')->allFiles())->toBe([])
        ->and(Storage::disk('public')->allFiles())->toBe([]);
});

test('a user without the upload permission cannot upload', function (): void {
    Role::create(['name' => 'Viewer', 'guard_name' => 'web'])->givePermissionTo('media.index');
    $viewer = User::factory()->create();
    $viewer->assignRole('Viewer');

    $this->actingAs($viewer)->postJson(route('media.files.store'), [
        'file' => UploadedFile::fake()->image('photo.jpg', 20, 20),
    ])->assertForbidden();

    expect(Media::query()->count())->toBe(0);
});

test('changing visibility moves the file to the disk for the new visibility', function (): void {
    $this->actingAs($this->admin)->postJson(route('media.files.store'), [
        'file' => UploadedFile::fake()->image('photo.jpg', 20, 20),
        'visibility' => 'private',
    ])->assertCreated();

    $media = Media::query()->firstOrFail();
    $oldPath = $media->path;

    $this->actingAs($this->admin)
        ->postJson(route('media.files.visibility', $media), ['visibility' => 'public'])
        ->assertOk()
        ->assertJsonPath('data.visibility', 'public')
        ->assertJsonPath('data.url', fn (string $url): bool => str_contains($url, $oldPath));

    $media->refresh();

    expect($media->visibility)->toBe(MediaVisibility::Public)
        ->and($media->disk)->toBe('public');
    Storage::disk('public')->assertExists($oldPath);
    Storage::disk('local')->assertMissing($oldPath);
});

test('private files get a signed temporary URL and public files get a permanent one', function (): void {
    $private = Media::factory()->create(['disk' => 'local', 'path' => 'media/p.jpg']);
    $public = Media::factory()->public()->create(['disk' => 'public', 'path' => 'media/q.jpg']);

    $this->actingAs($this->admin)->getJson(route('media.files.url', $private))
        ->assertOk()->assertJsonPath('temporary', true)
        ->assertJsonStructure(['url']);

    $this->actingAs($this->admin)->getJson(route('media.files.url', $public))
        ->assertOk()->assertJsonPath('temporary', false)
        ->assertJsonPath('url', fn (string $url): bool => str_contains($url, 'media/q.jpg'));
});

test('the signed download link works without a session only while the signature is valid', function (): void {
    Storage::disk('local')->put('media/secret.pdf', 'pdf-bytes');
    $media = Media::factory()->pdf()->create(['disk' => 'local', 'path' => 'media/secret.pdf']);

    $url = URL::temporarySignedRoute('media.files.temporary', now()->addMinutes(5), ['file' => $media->uuid]);

    $this->actingAs($this->admin)->get($url)
        ->assertOk()
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('Cache-Control', 'no-store, private');

    $this->actingAs($this->admin)->get(str_replace('signature=', 'signature=bad', $url))
        ->assertForbidden();
});

test('a private file is not downloadable by a user without the index permission', function (): void {
    Storage::disk('local')->put('media/x.pdf', 'pdf');
    $media = Media::factory()->pdf()->create(['disk' => 'local', 'path' => 'media/x.pdf']);

    $outsider = User::factory()->create();

    $this->actingAs($outsider)->get(route('media.files.download', $media))->assertForbidden();
});
