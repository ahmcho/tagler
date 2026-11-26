<?php

namespace App\Modules\Translation\Policies;

use App\Models\User;
use App\Modules\Auth\Concerns\HasTranslatedDenialResponse;
use Illuminate\Auth\Access\Response;

class TranslationPolicy
{
    use HasTranslatedDenialResponse;

    public function viewAny(User $user): Response
    {
        return $this->check(allowed: $user->can('translations.index'));
    }

    public function update(User $user): Response
    {
        return $this->check(allowed: $user->can('translations.update'));
    }
}
