<?php

namespace App\Modules\Media\Policies;

use App\Models\User;
use App\Modules\Auth\Concerns\HasTranslatedDenialResponse;
use App\Modules\Media\Models\MediaFolder;
use Illuminate\Auth\Access\Response;

class MediaFolderPolicy
{
    use HasTranslatedDenialResponse;

    public function viewAny(User $user): Response
    {
        return $this->check(allowed: $user->can('media.index'));
    }

    public function create(User $user): Response
    {
        return $this->check(allowed: $user->can('media.folders'));
    }

    public function update(User $user, MediaFolder $folder): Response
    {
        return $this->check(allowed: $user->can('media.folders'));
    }

    public function delete(User $user, MediaFolder $folder): Response
    {
        return $this->check(allowed: $user->can('media.folders'));
    }
}
