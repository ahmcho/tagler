<?php

namespace App\Modules\Media\Services;

use App\Modules\Media\Enums\MediaVisibility;
use App\Modules\Media\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Owns every physical file operation. Paths are generated here, never taken from the client.
 */
class MediaStorageService
{
    /**
     * @return array{disk: string, path: string}
     */
    public function store(UploadedFile $file, MediaVisibility $visibility, string $uuid, string $extension): array
    {
        $disk = $this->diskFor($visibility);
        $path = sprintf(
            '%s/%s/%s/%s.%s',
            config('modules.media.path_prefix'),
            Carbon::now()->format('Y'),
            Carbon::now()->format('m'),
            $uuid,
            $extension,
        );

        $stream = fopen($file->getRealPath(), 'rb');

        try {
            if (! Storage::disk($disk)->writeStream($path, $stream)) {
                throw new RuntimeException("Could not write [{$path}] to disk [{$disk}].");
            }
        } finally {
            fclose($stream);
        }

        return ['disk' => $disk, 'path' => $path];
    }

    /**
     * Copies the file to the disk for the target visibility. The caller updates the
     * database, then calls deleteAfterCommit() for the old copy. The file keeps its path.
     *
     * @return array{disk: string, path: string}
     */
    public function copyForVisibility(Media $media, MediaVisibility $target): array
    {
        $targetDisk = $this->diskFor($target);

        if ($targetDisk === $media->disk) {
            return ['disk' => $media->disk, 'path' => $media->path];
        }

        $stream = Storage::disk($media->disk)->readStream($media->path);

        try {
            if (! Storage::disk($targetDisk)->writeStream($media->path, $stream)) {
                throw new RuntimeException("Could not copy [{$media->path}] to disk [{$targetDisk}].");
            }
        } finally {
            if (is_resource($stream)) {
                fclose($stream);
            }
        }

        return ['disk' => $targetDisk, 'path' => $media->path];
    }

    public function delete(string $disk, string $path): void
    {
        Storage::disk($disk)->delete($path);
    }

    public function exists(string $disk, string $path): bool
    {
        return Storage::disk($disk)->exists($path);
    }

    public function diskFor(MediaVisibility $visibility): string
    {
        return match ($visibility) {
            MediaVisibility::Public => config('modules.media.public_disk'),
            MediaVisibility::Private => config('modules.media.private_disk'),
        };
    }

    /**
     * Generates a unique file name so the client name never reaches the file system.
     */
    public function newUuid(): string
    {
        return (string) Str::uuid();
    }
}
