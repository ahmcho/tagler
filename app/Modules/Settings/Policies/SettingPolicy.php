<?php

namespace App\Modules\Settings\Policies;

use App\Models\User;
use App\Modules\Auth\Concerns\HasTranslatedDenialResponse;
use Illuminate\Auth\Access\Response;

class SettingPolicy
{
    use HasTranslatedDenialResponse;

    public function viewAny(User $user): Response
    {
        return $this->check(allowed: $this->canManage($user));
    }

    public function update(User $user): Response
    {
        return $this->check(allowed: $this->canManage($user));
    }

    /**
     * Admin role, plus both settings permissions.
     */
    private function canManage(User $user): bool
    {
        return $user->hasRole(config('modules.auth.admin_role_name'))
            && $user->can('settings.index')
            && $user->can('settings.update');
    }
}
