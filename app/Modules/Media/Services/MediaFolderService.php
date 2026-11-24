<?php

namespace App\Modules\Media\Services;

use App\Models\User;
use App\Modules\Media\Models\MediaFolder;
use App\Modules\Media\Repositories\Contracts\MediaFolderRepositoryContract;
use App\Modules\Media\Services\Contracts\MediaFolderServiceContract;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class MediaFolderService implements MediaFolderServiceContract
{
    public function __construct(
        private readonly MediaFolderRepositoryContract $repository,
    ) {}

    public function allFolders(): Collection
    {
        return $this->repository->allFolders();
    }

    public function create(string $name, ?int $parentId, User $creator): MediaFolder
    {
        $this->assertNameAvailable($name, $parentId);

        return $this->repository->create([
            'name' => $name,
            'parent_id' => $parentId,
            'created_by' => $creator->getKey(),
        ]);
    }

    public function rename(MediaFolder $folder, string $name): MediaFolder
    {
        $this->assertNameAvailable($name, $folder->parent_id, $folder->getKey());

        return $this->repository->update($folder, ['name' => $name]);
    }

    public function move(MediaFolder $folder, ?int $parentId): MediaFolder
    {
        if ($parentId === $folder->getKey()) {
            $this->fail('parent_id', __('media.errors.folder_into_itself'));
        }

        if ($parentId !== null) {
            $this->assertNotDescendant($folder, $parentId);
        }

        $this->assertNameAvailable($folder->name, $parentId, $folder->getKey());

        return $this->repository->update($folder, ['parent_id' => $parentId]);
    }

    public function delete(MediaFolder $folder): void
    {
        if ($this->repository->hasChildren($folder)) {
            $this->fail('folder', __('media.errors.folder_has_subfolders'));
        }

        if ($this->repository->hasFiles($folder)) {
            $this->fail('folder', __('media.errors.folder_has_files'));
        }

        $this->repository->deleteById($folder);
    }

    private function assertNameAvailable(string $name, ?int $parentId, ?int $ignoreId = null): void
    {
        if ($this->repository->nameExistsUnderParent($name, $parentId, $ignoreId)) {
            $this->fail('name', __('media.errors.folder_name_taken'));
        }
    }

    /**
     * Walks up from the target parent. Moving a folder under itself or under one of its
     * descendants would create a cycle.
     */
    private function assertNotDescendant(MediaFolder $folder, int $parentId): void
    {
        $ancestorId = $parentId;

        while ($ancestorId !== null) {
            if ($ancestorId === $folder->getKey()) {
                $this->fail('parent_id', __('media.errors.folder_into_descendant'));
            }

            $ancestorId = $this->repository->findById($ancestorId)->parent_id;
        }
    }

    private function fail(string $key, string $message): never
    {
        throw ValidationException::withMessages([$key => $message]);
    }
}
