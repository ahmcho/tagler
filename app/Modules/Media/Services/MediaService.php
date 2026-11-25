<?php

namespace App\Modules\Media\Services;

use App\Models\User;
use App\Modules\Media\Enums\MediaProcessingStatus;
use App\Modules\Media\Enums\MediaVisibility;
use App\Modules\Media\Exceptions\MediaInUseException;
use App\Modules\Media\Jobs\ProcessMedia;
use App\Modules\Media\Models\Media;
use App\Modules\Media\Repositories\Contracts\MediaRepositoryContract;
use App\Modules\Media\Services\Contracts\MediaServiceContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class MediaService implements MediaServiceContract
{
    public function __construct(
        private readonly MediaRepositoryContract $repository,
        private readonly MediaStorageService $storage,
    ) {}

    public function paginateLibrary(array $filters, int $perPage): LengthAwarePaginator
    {
        return $this->repository->paginateLibrary($filters, $perPage);
    }

    public function upload(UploadedFile $file, array $payload, User $uploader): Media
    {
        $mimeType = (string) $file->getMimeType();
        $extension = $this->extensionFor($mimeType);
        $visibility = MediaVisibility::from($payload['visibility'] ?? config('modules.media.default_visibility'));
        $uuid = $this->storage->newUuid();
        $checksum = hash_file('sha256', $file->getRealPath());

        $stored = $this->storage->store($file, $visibility, $uuid, $extension);

        $media = $this->persistUpload($stored, [
            'uuid' => $uuid,
            'disk' => $stored['disk'],
            'path' => $stored['path'],
            'original_name' => $this->cleanOriginalName($file->getClientOriginalName()),
            'file_name' => $uuid.'.'.$extension,
            'mime_type' => $mimeType,
            'extension' => $extension,
            'size' => $file->getSize(),
            'checksum' => $checksum,
            ...$this->metadataAttributes($payload),
            'visibility' => $visibility,
            'processing_status' => MediaProcessingStatus::Pending,
            'uploaded_by' => $uploader->getKey(),
        ]);

        ProcessMedia::dispatch($media->getKey());

        return $media;
    }

    /**
     * Saves the file row. When the save fails, the stored file is deleted and the error is rethrown.
     *
     * @param  array{disk: string, path: string}  $stored
     * @param  array<string, mixed>  $attributes
     */
    private function persistUpload(array $stored, array $attributes): Media
    {
        try {
            return DB::transaction(fn (): Media => $this->repository->createFromUpload($attributes));
        } catch (Throwable $exception) {
            $this->storage->delete($stored['disk'], $stored['path']);

            throw $exception;
        }
    }

    /**
     * The optional library fields of an upload. Each one defaults to null.
     *
     * @param  array<string, mixed>  $payload
     * @return array{folder_id: mixed, title: mixed, alt_text: mixed, description: mixed}
     */
    private function metadataAttributes(array $payload): array
    {
        return [
            'folder_id' => $payload['folder_id'] ?? null,
            'title' => $payload['title'] ?? null,
            'alt_text' => $payload['alt_text'] ?? null,
            'description' => $payload['description'] ?? null,
        ];
    }

    public function update(Media $media, array $payload): Media
    {
        return $this->repository->update($media, $payload);
    }

    public function move(Media $media, ?int $folderId): Media
    {
        return $this->repository->relocate($media, ['folder_id' => $folderId]);
    }

    public function changeVisibility(Media $media, MediaVisibility $visibility): Media
    {
        if ($media->visibility === $visibility) {
            return $media;
        }

        $previousDisk = $media->disk;
        $paths = $this->storage->pathsFor($media);
        $target = $this->storage->copyForVisibility($media, $visibility);

        try {
            $updated = $this->repository->relocate($media, [
                'visibility' => $visibility,
                'disk' => $target['disk'],
                'path' => $target['path'],
            ]);
        } catch (Throwable $exception) {
            if ($target['disk'] !== $previousDisk) {
                $this->storage->deleteAll($target['disk'], $paths);
            }

            throw $exception;
        }

        if ($target['disk'] !== $previousDisk) {
            $this->storage->deleteAll($previousDisk, $paths);
        }

        return $updated;
    }

    public function trash(Media $media, bool $force): void
    {
        $this->guardReferences($media, $force);

        $this->repository->deleteById($media);
    }

    public function restore(Media $media): Media
    {
        $this->repository->restoreById($media->getKey());

        return $media->refresh();
    }

    public function purge(Media $media, bool $force): void
    {
        $this->guardReferences($media, $force);

        $disk = $media->disk;
        $paths = $this->storage->pathsFor($media);

        DB::transaction(fn () => $this->repository->permanentlyDeleteById($media->getKey()));

        $this->storage->deleteAll($disk, $paths);
    }

    public function attachments(Media $media): Collection
    {
        return $this->repository->attachments($media);
    }

    public function usage(): array
    {
        $rows = $this->repository->usageByCategory();

        return [
            'files' => (int) $rows->sum('files'),
            'bytes' => (int) $rows->sum('bytes'),
            'categories' => $rows
                ->mapWithKeys(fn (object $row): array => [$row->category => [
                    'files' => $row->files,
                    'bytes' => $row->bytes,
                ]])
                ->all(),
        ];
    }

    private function guardReferences(Media $media, bool $force): void
    {
        $references = $this->repository->countAttachments($media);

        if ($references > 0 && ! $force) {
            throw new MediaInUseException($references);
        }
    }

    private function extensionFor(string $mimeType): string
    {
        $allowed = config('modules.media.allowed_mime_types', []);

        if (isset($allowed[$mimeType])) {
            return $allowed[$mimeType];
        }

        if ($mimeType === 'image/svg+xml' && config('modules.media.allow_svg')) {
            return 'svg';
        }

        throw ValidationException::withMessages([
            'file' => __('media.errors.unsupported_type'),
        ]);
    }

    private function cleanOriginalName(string $name): string
    {
        $base = str_replace(["\0", '\\', '/'], '', basename($name));

        return mb_substr($base !== '' ? $base : 'file', 0, 255);
    }
}
