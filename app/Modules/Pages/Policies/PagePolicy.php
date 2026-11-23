<?php

namespace App\Modules\Pages\Policies;

use App\Models\User;
use App\Modules\Auth\Concerns\HasTranslatedDenialResponse;
use App\Modules\Pages\Models\Page;
use Illuminate\Auth\Access\Response;

class PagePolicy
{
    use HasTranslatedDenialResponse;

    public function viewAny(User $user): Response
    {
        return $this->check(allowed: $user->can('pages.index'));
    }

    public function create(User $user): Response
    {
        return $this->check(allowed: $user->can('pages.store'));
    }

    public function update(User $user, Page $page): Response
    {
        return $this->check(allowed: $user->can('pages.update'));
    }

    public function delete(User $user, Page $page): Response
    {
        return $this->check(allowed: $user->can('pages.destroy'));
    }

    public function publish(User $user, Page $page): Response
    {
        return $this->check(allowed: $user->can('pages.publish'));
    }

    public function setHomepage(User $user, Page $page): Response
    {
        return $this->check(allowed: $user->can('pages.homepage'));
    }
}
