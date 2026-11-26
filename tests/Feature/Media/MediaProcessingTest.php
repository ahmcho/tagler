<?php

use App\Models\User;
use App\Modules\Auth\Database\Seeders\RolesAndPermissionsSeeder;
use App\Modules\Media\Enums\MediaProcessingStatusEnum;
use App\Modules\Media\Jobs\ProcessMedia;
use App\Modules\Media\Models\Media;
use App\Modules\Media\Repositories\Contracts\MediaRepositoryContract;
use App\Modules\Media\Services\MediaProcessingService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    (new RolesAndPermissionsSeeder)->run();
    Storage::fake('public');
    Storage::fake('local');

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Admin');
});

test('an uploaded image becomes ready with dimensions and resized copies, and the original is kept', function (): void {
    $this->actingAs($this->admin)->postJson(route('media.files.store'), [
        'file' => UploadedFile::fake()->image('wide.jpg', 800, 400),
        'visibility' => 'public',
    ])->assertCreated();

    $media = Media::query()->firstOrFail()->refresh();

    expect($media->processing_status)->toBe(MediaProcessingStatusEnum::Ready)
        ->and($media->metadata['width'])->toBe(800)
        ->and($media->metadata['height'])->toBe(400)
        ->and($media->metadata['conversions'])->toHaveKeys(['thumbnail', 'medium', 'large'])
        ->and($media->metadata['conversions']['thumbnail']['width'])->toBe(150)
        ->and($media->metadata['conversions']['thumbnail']['height'])->toBe(75)
        ->and($media->metadata['conversions']['large']['width'])->toBe(800);

    Storage::disk('public')->assertExists($media->path);
    Storage::disk('public')->assertExists($media->metadata['conversions']['thumbnail']['path']);
});

test('a file with no specific processor becomes ready without metadata', function (): void {
    $this->actingAs($this->admin)->postJson(route('media.files.store'), [
        'file' => UploadedFile::fake()->create('report.pdf', 10, 'application/pdf'),
    ])->assertCreated();

    $media = Media::query()->firstOrFail()->refresh();

    expect($media->processing_status)->toBe(MediaProcessingStatusEnum::Ready)
        ->and($media->metadata)->toBe([]);
});

test('an upload dispatches the processing job after the file is stored', function (): void {
    Queue::fake();

    $this->actingAs($this->admin)->postJson(route('media.files.store'), [
        'file' => UploadedFile::fake()->image('a.png', 20, 20),
    ])->assertCreated();

    Queue::assertPushed(ProcessMedia::class, fn (ProcessMedia $job): bool => $job->mediaId === Media::query()->value('id'));
});

test('a private thumbnail is served only to users who can view the file', function (): void {
    $this->actingAs($this->admin)->postJson(route('media.files.store'), [
        'file' => UploadedFile::fake()->image('private.jpg', 300, 300),
    ])->assertCreated();

    $media = Media::query()->firstOrFail();

    $this->actingAs($this->admin)->getJson(route('media.files.show', $media))
        ->assertJsonPath('data.thumbnail_url', fn (string $url): bool => str_contains($url, '/conversions/thumbnail'));

    $this->actingAs($this->admin)
        ->get(route('media.files.conversion', [$media, 'thumbnail']))
        ->assertOk()
        ->assertHeader('Content-Type', 'image/jpeg')
        ->assertHeader('X-Content-Type-Options', 'nosniff');

    $outsider = User::factory()->create();
    $this->actingAs($outsider)->get(route('media.files.conversion', [$media, 'thumbnail']))->assertForbidden();
});

test('an unknown conversion name is not found', function (): void {
    $media = Media::factory()->create(['metadata' => []]);

    $this->actingAs($this->admin)->get('/admin/media/files/'.$media->uuid.'/conversions/huge')->assertNotFound();
});

test('processing a ready file again changes nothing', function (): void {
    $media = Media::factory()->create([
        'metadata' => ['width' => 10, 'height' => 10],
        'processing_status' => MediaProcessingStatusEnum::Ready,
    ]);

    (new ProcessMedia($media->id))->handle(app(MediaRepositoryContract::class), app(MediaProcessingService::class));

    expect($media->fresh()->metadata)->toBe(['width' => 10, 'height' => 10]);
});

test('a file that cannot be decoded fails, keeps the original, and records a generic error', function (): void {
    $bytes = "\xFF\xD8\xFF\xE0".str_repeat('x', 200);
    Storage::disk('local')->put('media/broken.jpg', $bytes);

    $media = Media::factory()->create([
        'disk' => 'local',
        'path' => 'media/broken.jpg',
        'mime_type' => 'image/jpeg',
        'extension' => 'jpg',
        'processing_status' => MediaProcessingStatusEnum::Pending,
    ]);

    $job = new ProcessMedia($media->id);

    expect(fn () => $job->handle(app(MediaRepositoryContract::class), app(MediaProcessingService::class)))
        ->toThrow(RuntimeException::class);

    $job->failed(new RuntimeException('decode failed'));

    $media->refresh();

    expect($media->processing_status)->toBe(MediaProcessingStatusEnum::Failed)
        ->and($media->processing_error)->toBe('Processing failed. Try again later.')
        ->and($media->processing_error)->not->toContain('media/broken.jpg');
    Storage::disk('local')->assertExists('media/broken.jpg');
});

test('a trashed file is skipped by the processing job', function (): void {
    $media = Media::factory()->create(['processing_status' => MediaProcessingStatusEnum::Pending]);
    $media->delete();

    (new ProcessMedia($media->id))->handle(app(MediaRepositoryContract::class), app(MediaProcessingService::class));

    expect($media->fresh()->processing_status)->toBe(MediaProcessingStatusEnum::Pending);
});
