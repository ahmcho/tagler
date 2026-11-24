<?php

namespace App\Modules\Media\Policies;

use App\Models\User;
use App\Modules\Auth\Concerns\HasTranslatedDenialResponse;
use App\Modules\Media\Models\Media;
use Illuminate\Auth\Access\Response;

class MediaPolicy
{
    use HasTranslatedDenialResponse;

    public function viewAny(User $user): Response
    {
        return $this->check(allowed: $user->can('media.index'));
    }

    public function view(User $user, Media $media): Response
    {
        return $this->check(allowed: $user->can('media.index'));
    }

    public function create(User $user): Response
    {
        return $this->check(allowed: $user->can('media.store'));
    }

    public function update(User $user, Media $media): Response
    {
        return $this->check(allowed: $user->can('media.update'));
    }

    public function visibility(User $user, Media $media): Response
    {
        return $this->check(allowed: $user->can('media.visibility'));
    }

    public function delete(User $user, Media $media): Response
    {
        return $this->check(allowed: $user->can('media.destroy'));
    }

    public function restore(User $user, Media $media): Response
    {
        return $this->check(allowed: $user->can('media.destroy'));
    }

    public function forceDelete(User $user, Media $media): Response
    {
        return $this->check(allowed: $user->can('media.purge'));
    }
}
