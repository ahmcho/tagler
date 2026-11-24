<?php

namespace App\Modules\Media\Repositories\Contracts;

use App\Modules\Media\Models\MediaFolder;
use Crud\Repositories\Contracts\EloquentRepositoryContract;
use Illuminate\Support\Collection;

interface MediaFolderRepositoryContract extends EloquentRepositoryContract
{
    /**
     * Every folder in one query. The tree is built in memory.
     *
     * @return Collection<int, MediaFolder>
     */
    public function allFolders(): Collection;

    public function nameExistsUnderParent(string $name, ?int $parentId, ?int $ignoreId = null): bool;

    public function hasChildren(MediaFolder $folder): bool;

    public function hasFiles(MediaFolder $folder): bool;
}
