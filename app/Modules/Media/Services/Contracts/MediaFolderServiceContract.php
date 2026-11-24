<?php

namespace App\Modules\Media\Services\Contracts;

use App\Models\User;
use App\Modules\Media\Models\MediaFolder;
use Illuminate\Support\Collection;

interface MediaFolderServiceContract
{
    /**
     * @return Collection<int, MediaFolder>
     */
    public function allFolders(): Collection;

    public function create(string $name, ?int $parentId, User $creator): MediaFolder;

    public function rename(MediaFolder $folder, string $name): MediaFolder;

    public function move(MediaFolder $folder, ?int $parentId): MediaFolder;

    public function delete(MediaFolder $folder): void;
}
