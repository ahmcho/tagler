<?php

namespace App\Modules\Media\Services;

use App\Modules\Media\Enums\MediaVisibilityEnum;
use App\Modules\Media\Models\Media;
use Illuminate\Http\UploadedFile;
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
    public function store(UploadedFile $file, MediaVisibilityEnum $visibility, string $uuid, string $extension): array
    {
        $disk = $this->diskFor($visibility);
        $path = sprintf(
            '%s/%s.%s',
            config('modules.media.path_prefix'),
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
     * The original and every generated conversion. They all move together on a visibility change.
     *
     * @return list<string>
     */
    public function pathsFor(Media $media): array
    {
        $conversionPaths = array_column($media->metadata['conversions'] ?? [], 'path');

        return [$media->path, ...array_values($conversionPaths)];
    }

    /**
     * Copies the original and its conversions to the disk for the target visibility. The paths do not
     * change. The caller updates the database, then deletes the old copies.
     *
     * @return array{disk: string, path: string}
     */
    public function copyForVisibility(Media $media, MediaVisibilityEnum $target): array
    {
        $targetDisk = $this->diskFor($target);

        if ($targetDisk === $media->disk) {
            return ['disk' => $media->disk, 'path' => $media->path];
        }

        foreach ($this->pathsFor($media) as $path) {
            $stream = Storage::disk($media->disk)->readStream($path);

            try {
                if (! Storage::disk($targetDisk)->writeStream($path, $stream)) {
                    throw new RuntimeException("Could not copy [{$path}] to disk [{$targetDisk}].");
                }
            } finally {
                if (is_resource($stream)) {
                    fclose($stream);
                }
            }
        }

        return ['disk' => $targetDisk, 'path' => $media->path];
    }

    /**
     * @param  list<string>  $paths
     */
    public function deleteAll(string $disk, array $paths): void
    {
        foreach ($paths as $path) {
            Storage::disk($disk)->delete($path);
        }
    }

    public function delete(string $disk, string $path): void
    {
        Storage::disk($disk)->delete($path);
    }

    public function exists(string $disk, string $path): bool
    {
        return Storage::disk($disk)->exists($path);
    }

    public function diskFor(MediaVisibilityEnum $visibility): string
    {
        return match ($visibility) {
            MediaVisibilityEnum::Public => config('modules.media.public_disk'),
            MediaVisibilityEnum::Private => config('modules.media.private_disk'),
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
