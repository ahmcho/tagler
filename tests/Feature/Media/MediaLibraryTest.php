<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Media\Enums\MediaCategoryEnum;
use App\Modules\Media\Models\Media;
use App\Modules\Media\Models\MediaFolder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    (new RolesAndPermissionsSeeder)->run();
    Storage::fake('public');
    Storage::fake('local');

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Admin');
});

test('the library filters by category derived from the verified MIME type', function (): void {
    Media::factory()->create(['original_name' => 'a.jpg', 'mime_type' => 'image/jpeg']);
    Media::factory()->create(['original_name' => 'b.mp4', 'mime_type' => 'video/mp4', 'extension' => 'mp4']);
    Media::factory()->create(['original_name' => 'c.pdf', 'mime_type' => 'application/pdf', 'extension' => 'pdf']);
    Media::factory()->create(['original_name' => 'd.zip', 'mime_type' => 'application/zip', 'extension' => 'zip']);

    foreach (['pictures' => 'a.jpg', 'videos' => 'b.mp4', 'documents' => 'c.pdf', 'other' => 'd.zip'] as $category => $name) {
        $this->actingAs($this->admin)
            ->getJson(route('media.files.index', ['category' => $category]))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', $name);
    }
});

test('search matches the original name and the title', function (): void {
    Media::factory()->create(['original_name' => 'summer-sale.jpg', 'title' => null]);
    Media::factory()->create(['original_name' => 'x.jpg', 'title' => 'Summer hero']);
    Media::factory()->create(['original_name' => 'winter.jpg', 'title' => null]);

    $this->actingAs($this->admin)
        ->getJson(route('media.files.index', ['search' => 'summer']))
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('the folder filter returns one folder and the root returns unfiled files', function (): void {
    $folder = MediaFolder::factory()->create(['name' => 'Campaign']);
    Media::factory()->create(['folder_id' => $folder->id, 'original_name' => 'in.jpg']);
    Media::factory()->create(['folder_id' => null, 'original_name' => 'root.jpg']);

    $this->actingAs($this->admin)
        ->getJson(route('media.files.index', ['folder' => $folder->id]))
        ->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'in.jpg');

    $this->actingAs($this->admin)
        ->getJson(route('media.files.index', ['folder' => 'root']))
        ->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'root.jpg');
});

test('filters combine and the list is paginated', function (): void {
    Media::factory()->count(5)->public()->create(['mime_type' => 'image/png', 'extension' => 'png']);
    Media::factory()->count(3)->create(['mime_type' => 'image/png', 'extension' => 'png']);

    $this->actingAs($this->admin)
        ->getJson(route('media.files.index', ['category' => 'pictures', 'visibility' => 'public', 'per_page' => 2]))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.total', 5)
        ->assertJsonPath('meta.last_page', 3);
});

test('sorting by size and name follows the requested direction', function (): void {
    Media::factory()->create(['original_name' => 'b.jpg', 'size' => 10]);
    Media::factory()->create(['original_name' => 'a.jpg', 'size' => 30]);
    Media::factory()->create(['original_name' => 'c.jpg', 'size' => 20]);

    $this->actingAs($this->admin)->getJson(route('media.files.index', ['sort' => 'size_desc']))
        ->assertJsonPath('data.0.name', 'a.jpg')->assertJsonPath('data.2.name', 'b.jpg');

    $this->actingAs($this->admin)->getJson(route('media.files.index', ['sort' => 'name_asc']))
        ->assertJsonPath('data.0.name', 'a.jpg')->assertJsonPath('data.2.name', 'c.jpg');
});

test('the list never exposes the disk, path or checksum', function (): void {
    Media::factory()->create();

    $this->actingAs($this->admin)->getJson(route('media.files.index'))
        ->assertOk()
        ->assertJsonPath('data.0.download_url', fn (string $url): bool => str_ends_with($url, '/download'))
        ->assertJsonMissingPath('data.0.path')
        ->assertJsonMissingPath('data.0.disk')
        ->assertJsonMissingPath('data.0.checksum');
});

test('a referenced file cannot be trashed without force', function (): void {
    $media = Media::factory()->create();
    DB::table('mediables')->insert([
        'media_id' => $media->id,
        'mediable_type' => 'page',
        'mediable_id' => 1,
        'collection' => 'featured_image',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->actingAs($this->admin)->deleteJson(route('media.files.destroy', $media))
        ->assertStatus(409)
        ->assertJsonPath('references', 1);

    expect($media->fresh()->trashed())->toBeFalse();

    $this->actingAs($this->admin)->deleteJson(route('media.files.destroy', $media), ['force' => true])
        ->assertNoContent();

    expect($media->fresh()->trashed())->toBeTrue();
});

test('a trashed file can be restored and then purged with its physical file', function (): void {
    Storage::disk('local')->put('media/gone.pdf', 'bytes');
    $media = Media::factory()->pdf()->create(['disk' => 'local', 'path' => 'media/gone.pdf']);

    $this->actingAs($this->admin)->deleteJson(route('media.files.destroy', $media))->assertNoContent();
    $this->actingAs($this->admin)->postJson(route('media.files.restore', $media))->assertOk();
    expect($media->fresh()->trashed())->toBeFalse();

    $this->actingAs($this->admin)->deleteJson(route('media.files.destroy', $media))->assertNoContent();
    $this->actingAs($this->admin)->postJson(route('media.files.purge', $media))->assertNoContent();

    expect(Media::withTrashed()->whereKey($media->id)->exists())->toBeFalse();
    Storage::disk('local')->assertMissing('media/gone.pdf');
});

test('purging an image also removes its generated conversions', function (): void {
    Storage::disk('local')->put('media/img/a.jpg', 'original');
    Storage::disk('local')->put('media/img/a-thumbnail.jpg', 'thumb');
    $media = Media::factory()->create([
        'disk' => 'local',
        'path' => 'media/img/a.jpg',
        'metadata' => ['conversions' => ['thumbnail' => ['path' => 'media/img/a-thumbnail.jpg', 'mime_type' => 'image/jpeg', 'width' => 1, 'height' => 1]]],
    ]);

    $this->actingAs($this->admin)->deleteJson(route('media.files.destroy', $media))->assertNoContent();
    $this->actingAs($this->admin)->postJson(route('media.files.purge', $media))->assertNoContent();

    Storage::disk('local')->assertMissing('media/img/a.jpg');
    Storage::disk('local')->assertMissing('media/img/a-thumbnail.jpg');
});

test('moving a file changes only its logical folder and keeps the stored path', function (): void {
    $folder = MediaFolder::factory()->create();
    $media = Media::factory()->create(['path' => 'media/keep.jpg']);

    $this->actingAs($this->admin)->postJson(route('media.files.move', $media), ['folder_id' => $folder->id])
        ->assertOk()->assertJsonPath('data.folder_id', $folder->id);

    expect($media->fresh()->path)->toBe('media/keep.jpg');
});

test('metadata can be edited but the file name cannot', function (): void {
    $media = Media::factory()->create(['original_name' => 'before.jpg']);

    $this->actingAs($this->admin)->patchJson(route('media.files.update', $media), [
        'title' => 'Hero',
        'alt_text' => 'A hero image',
        'original_name' => 'hacked.exe',
    ])->assertOk()->assertJsonPath('data.title', 'Hero')->assertJsonPath('data.name', 'before.jpg');
});

test('the stats endpoint returns totals per category and the configured quota', function (): void {
    config(['modules.media.storage_quota_bytes' => 1000]);
    Media::factory()->create(['size' => 100, 'mime_type' => 'image/jpeg']);
    Media::factory()->create(['size' => 50, 'mime_type' => 'image/png']);
    Media::factory()->create(['size' => 20, 'mime_type' => 'application/pdf']);

    $this->actingAs($this->admin)->getJson(route('media.stats'))
        ->assertOk()
        ->assertJsonPath('data.files', 3)
        ->assertJsonPath('data.bytes', 170)
        ->assertJsonPath('data.categories.pictures.files', 2)
        ->assertJsonPath('data.categories.documents.bytes', 20)
        ->assertJsonPath('data.quota_bytes', 1000);
});

test('a user without the index permission cannot browse the library', function (): void {
    $outsider = User::factory()->create();

    $this->actingAs($outsider)->getJson(route('media.files.index'))->assertForbidden();
});

test('category enum maps each documented MIME family', function (): void {
    expect(MediaCategoryEnum::fromMimeType('image/webp'))->toBe(MediaCategoryEnum::Pictures)
        ->and(MediaCategoryEnum::fromMimeType('audio/ogg'))->toBe(MediaCategoryEnum::Audio)
        ->and(MediaCategoryEnum::fromMimeType('text/plain'))->toBe(MediaCategoryEnum::Documents)
        ->and(MediaCategoryEnum::fromMimeType('application/octet-stream'))->toBe(MediaCategoryEnum::Other);
});

test('the trash filter returns only trashed files when sent as 1', function (): void {
    Media::factory()->create(['original_name' => 'live.jpg']);
    Media::factory()->create(['original_name' => 'gone.jpg'])->delete();

    $this->actingAs($this->admin)
        ->getJson(route('media.files.index', ['trashed' => 1]))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'gone.jpg');
});

test('the library filters by visibility, uploader and creation date range', function (): void {
    $uploader = User::factory()->create();
    Media::factory()->public()->create(['original_name' => 'shared.jpg', 'uploaded_by' => $uploader->id, 'created_at' => '2026-03-10 12:00:00']);
    Media::factory()->create(['original_name' => 'private-early.jpg', 'uploaded_by' => $uploader->id, 'created_at' => '2026-01-05 09:00:00']);
    Media::factory()->public()->create(['original_name' => 'public-late.jpg', 'created_at' => '2026-06-01 09:00:00']);

    $this->actingAs($this->admin)
        ->getJson(route('media.files.index', ['visibility' => 'public']))
        ->assertJsonCount(2, 'data');

    $this->actingAs($this->admin)
        ->getJson(route('media.files.index', ['uploaded_by' => $uploader->id]))
        ->assertJsonCount(2, 'data');

    $this->actingAs($this->admin)
        ->getJson(route('media.files.index', ['created_from' => '2026-02-01', 'created_to' => '2026-04-30']))
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'shared.jpg');
});
