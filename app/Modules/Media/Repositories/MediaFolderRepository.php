<?php

namespace App\Modules\Media\Repositories;

use App\Modules\Media\Models\MediaFolder;
use App\Modules\Media\Repositories\Contracts\MediaFolderRepositoryContract;
use Crud\Repositories\EloquentRepository;
use Illuminate\Support\Collection;

class MediaFolderRepository extends EloquentRepository implements MediaFolderRepositoryContract
{
    public function __construct(MediaFolder $model)
    {
        parent::__construct($model);
    }

    public function allFolders(): Collection
    {
        return $this->model->newQuery()->withCount('files')->withSum('files', 'size')->orderBy('name')->get();
    }

    public function nameExistsUnderParent(string $name, ?int $parentId, ?int $ignoreId = null): bool
    {
        return $this->model->newQuery()
            ->when($parentId === null, fn ($query) => $query->whereNull('parent_id'), fn ($query) => $query->where('parent_id', $parentId))
            ->whereRaw('LOWER(name) = LOWER(?)', [$name])
            ->when($ignoreId !== null, fn ($query) => $query->whereKeyNot($ignoreId))
            ->exists();
    }

    public function hasChildren(MediaFolder $folder): bool
    {
        return $folder->children()->exists();
    }

    public function hasFiles(MediaFolder $folder): bool
    {
        return $folder->files()->withTrashed()->exists();
    }
}
