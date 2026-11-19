<?php

namespace App\Modules\Auth\Policies;

use App\Models\User;
use App\Modules\Auth\Concerns\HasTranslatedDenialResponse;
use App\Modules\Auth\Models\ActivityLog;
use Illuminate\Auth\Access\Response;

class ActivityLogPolicy
{
    use HasTranslatedDenialResponse;

    public function viewAny(User $user): Response
    {
        return $this->check(allowed: $user->can('activity-logs.index'));
    }

    public function view(User $user, ActivityLog $activityLog): Response
    {
        return $this->check(allowed: $user->can('activity-logs.index'));
    }
}
