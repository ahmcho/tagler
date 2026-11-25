<?php

namespace App\Modules\Media\Repositories;

use App\Modules\Media\Enums\MediaCategory;
use App\Modules\Media\Models\Media;
use App\Modules\Media\Repositories\Contracts\MediaRepositoryContract;
use Crud\Repositories\EloquentRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class MediaRepository extends EloquentRepository implements MediaRepositoryContract
{
    public function __construct(Media $model)
    {
        parent::__construct($model);
    }

    public function paginateLibrary(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = $this->model->newQuery()->with('uploader:id,name');

        if ($filters['trashed'] ?? false) {
            $query->onlyTrashed();
        }

        $this->applyLibraryFilters($query, $filters);
        $this->applyLibrarySort($query, (string) ($filters['sort'] ?? 'created_desc'));

        return $query->paginate($perPage);
    }

    public function usageByCategory(): Collection
    {
        return $this->model->newQuery()
            ->select(['mime_type', DB::raw('COUNT(*) as files'), DB::raw('COALESCE(SUM(size), 0) as bytes')])
            ->groupBy('mime_type')
            ->get()
            ->groupBy(fn (object $row): string => MediaCategory::fromMimeType($row->mime_type)->value)
            ->map(fn (Collection $rows, string $category): object => (object) [
                'category' => $category,
                'files' => (int) $rows->sum('files'),
                'bytes' => (int) $rows->sum('bytes'),
            ])
            ->values();
    }

    public function findByUuid(string $uuid): ?Media
    {
        return $this->model->newQuery()->where('uuid', $uuid)->first();
    }

    public function countAttachments(Media $media): int
    {
        return DB::table('mediables')->where('media_id', $media->getKey())->count();
    }

    public function attachments(Media $media): Collection
    {
        return DB::table('mediables')
            ->where('media_id', $media->getKey())
            ->orderBy('mediable_type')
            ->orderBy('mediable_id')
            ->orderBy('position')
            ->get(['mediable_type', 'mediable_id', 'collection', 'position']);
    }

    public function createFromUpload(array $attributes): Media
    {
        $media = $this->model->newInstance();
        $media->forceFill($attributes)->save();

        return $media->refresh();
    }

    public function relocate(Media $media, array $attributes): Media
    {
        $media->forceFill($attributes)->save();

        return $media->refresh();
    }

    public function updateSystemFields(Media $media, array $attributes): Media
    {
        $media->forceFill($attributes)->save();

        return $media->refresh();
    }

    public function findIncludingTrashed(int $id): ?Media
    {
        return $this->model->newQuery()->withTrashed()->whereKey($id)->first();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function applyLibraryFilters(Builder $query, array $filters): void
    {
        $this->applyCategoryFilter($query, $filters);
        $this->applySearchFilter($query, $filters);
        $this->applyFolderFilter($query, $filters);
        $this->applyVisibilityFilter($query, $filters);
        $this->applyUploaderFilter($query, $filters);
        $this->applyCreatedDateFilters($query, $filters);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function applyCategoryFilter(Builder $query, array $filters): void
    {
        if (($filters['category'] ?? null) !== null) {
            $this->applyCategory($query, MediaCategory::from($filters['category']));
        }
    }

    /**
     * Matches the term in the original name or the title, ignoring case.
     *
     * @param  array<string, mixed>  $filters
     */
    private function applySearchFilter(Builder $query, array $filters): void
    {
        if (($filters['search'] ?? null) === null) {
            return;
        }

        $term = '%'.addcslashes((string) $filters['search'], '%_\\').'%';

        $query->where(function (Builder $query) use ($term): void {
            $query->whereRaw('original_name ILIKE ?', [$term])->orWhereRaw('title ILIKE ?', [$term]);
        });
    }

    /**
     * A folder key with a null value means the root folder, which is stored as a null folder_id.
     *
     * @param  array<string, mixed>  $filters
     */
    private function applyFolderFilter(Builder $query, array $filters): void
    {
        if (! array_key_exists('folder', $filters)) {
            return;
        }

        if (($filters['folder'] ?? null) === null) {
            $query->whereNull('folder_id');

            return;
        }

        $query->where('folder_id', (int) $filters['folder']);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function applyVisibilityFilter(Builder $query, array $filters): void
    {
        if (($filters['visibility'] ?? null) !== null) {
            $query->where('visibility', $filters['visibility']);
        }
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function applyUploaderFilter(Builder $query, array $filters): void
    {
        if (($filters['uploaded_by'] ?? null) !== null) {
            $query->where('uploaded_by', (int) $filters['uploaded_by']);
        }
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function applyCreatedDateFilters(Builder $query, array $filters): void
    {
        if (($filters['created_from'] ?? null) !== null) {
            $query->whereDate('created_at', '>=', $filters['created_from']);
        }

        if (($filters['created_to'] ?? null) !== null) {
            $query->whereDate('created_at', '<=', $filters['created_to']);
        }
    }

    private function applyCategory(Builder $query, MediaCategory $category): void
    {
        match ($category) {
            MediaCategory::Pictures => $query->where('mime_type', 'like', 'image/%'),
            MediaCategory::Videos => $query->where('mime_type', 'like', 'video/%'),
            MediaCategory::Audio => $query->where('mime_type', 'like', 'audio/%'),
            MediaCategory::Documents => $query->whereIn('mime_type', MediaCategory::documentMimeTypes()),
            MediaCategory::Other => $query
                ->where('mime_type', 'not like', 'image/%')
                ->where('mime_type', 'not like', 'video/%')
                ->where('mime_type', 'not like', 'audio/%')
                ->whereNotIn('mime_type', MediaCategory::documentMimeTypes()),
        };
    }

    private function applyLibrarySort(Builder $query, string $sort): void
    {
        match ($sort) {
            'created_asc' => $query->orderBy('created_at')->orderBy('id'),
            'name_asc' => $query->orderBy('original_name')->orderBy('id'),
            'name_desc' => $query->orderByDesc('original_name')->orderByDesc('id'),
            'size_asc' => $query->orderBy('size')->orderBy('id'),
            'size_desc' => $query->orderByDesc('size')->orderByDesc('id'),
            default => $query->orderByDesc('created_at')->orderByDesc('id'),
        };
    }
}
