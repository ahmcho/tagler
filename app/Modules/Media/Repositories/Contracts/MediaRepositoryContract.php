<?php

namespace App\Modules\Media\Repositories\Contracts;

use App\Modules\Media\Models\Media;
use Crud\Repositories\Contracts\EloquentRepositoryContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface MediaRepositoryContract extends EloquentRepositoryContract
{
    /**
     * @param  array{category?: ?string, search?: ?string, folder?: int|string|null, visibility?: ?string, uploaded_by?: ?int, created_from?: ?string, created_to?: ?string, sort?: string, trashed?: bool}  $filters
     * @return LengthAwarePaginator<int, Media>
     */
    public function paginateLibrary(array $filters, int $perPage): LengthAwarePaginator;

    /**
     * @return Collection<int, object{category: string, files: int, bytes: int}>
     */
    public function usageByCategory(): Collection;

    public function findByUuid(string $uuid): ?Media;

    public function countAttachments(Media $media): int;

    /**
     * @return Collection<int, object{mediable_type: string, mediable_id: int, collection: string, position: int}>
     */
    public function attachments(Media $media): Collection;

    /**
     * Creates a row from server-built attributes. Storage paths and checksums are not fillable.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function createFromUpload(array $attributes): Media;

    /**
     * Updates the physical location and visibility. Only the service calls this.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function relocate(Media $media, array $attributes): Media;
}
