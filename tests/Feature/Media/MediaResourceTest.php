<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Media\Enums\MediaProcessingStatusEnum;
use App\Modules\Media\Models\Media;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    (new RolesAndPermissionsSeeder)->run();
    Storage::fake('public');
    Storage::fake('local');

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Admin');
});

test('the media resource exposes the mime icon and the processing badge color', function (): void {
    $media = Media::factory()->create([
        'mime_type' => 'application/pdf',
        'extension' => 'pdf',
        'processing_status' => MediaProcessingStatusEnum::Failed,
    ]);

    $this->actingAs($this->admin)
        ->getJson(route('media.files.show', ['file' => $media->uuid]))
        ->assertOk()
        ->assertJsonPath('data.mime_icon', 'file-text')
        ->assertJsonPath('data.processing_color', 'error');
});

test('an unlisted mime type falls back to the generic file icon', function (): void {
    $media = Media::factory()->create([
        'mime_type' => 'application/x-unknown',
        'extension' => 'bin',
        'processing_status' => MediaProcessingStatusEnum::Ready,
    ]);

    $this->actingAs($this->admin)
        ->getJson(route('media.files.show', ['file' => $media->uuid]))
        ->assertOk()
        ->assertJsonPath('data.mime_icon', 'file')
        ->assertJsonPath('data.processing_color', 'success');
});
