<?php

namespace App\Modules\Auth\Policies;

use App\Models\User;
use App\Modules\Auth\Concerns\HasPermissionCheck;
use App\Modules\Auth\Concerns\HasTranslatedDenialResponse;
use Illuminate\Auth\Access\Response;

class ActivityLogPolicy
{
    use HasPermissionCheck, HasTranslatedDenialResponse;

    public function viewAny(User $user): Response
    {
        return $this->check(allowed: $this->holdsPermission($user, 'activity-logs.index'));
    }
}
