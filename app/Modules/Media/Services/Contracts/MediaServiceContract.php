<?php

namespace App\Modules\Media\Services\Contracts;

use App\Models\User;
use App\Modules\Media\Enums\MediaVisibilityEnum;
use App\Modules\Media\Models\Media;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

interface MediaServiceContract
{
    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, Media>
     */
    public function paginateLibrary(array $filters, int $perPage): LengthAwarePaginator;

    /**
     * @param  array{title?: ?string, alt_text?: ?string, description?: ?string, folder_id?: ?int, visibility?: ?string}  $payload
     */
    public function upload(UploadedFile $file, array $payload, User $uploader): Media;

    /**
     * @param  array{title?: ?string, alt_text?: ?string, description?: ?string}  $payload
     */
    public function update(Media $media, array $payload): Media;

    public function move(Media $media, ?int $folderId): Media;

    public function changeVisibility(Media $media, MediaVisibilityEnum $visibility): Media;

    /**
     * Moves the file to the trash. Referenced files need `$force`.
     */
    public function trash(Media $media, bool $force): void;

    public function restore(Media $media): Media;

    /**
     * Removes the row and the physical file. Referenced files need `$force`.
     */
    public function purge(Media $media, bool $force): void;

    /**
     * @return Collection<int, object{mediable_type: string, mediable_id: int, collection: string, position: int}>
     */
    public function attachments(Media $media): Collection;

    /**
     * @return array{files: int, bytes: int, categories: array<string, array{files: int, bytes: int}>}
     */
    public function usage(): array;
}
