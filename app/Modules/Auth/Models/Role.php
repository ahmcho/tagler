<?php

namespace App\Modules\Auth\Models;

use App\Modules\Auth\Concerns\HasActivityLogs;
use App\Modules\Settings\Concerns\HasLocalDates;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Spatie\Permission\Models\Role as SpatieRole;

#[Fillable(['name', 'guard_name'])]
class Role extends SpatieRole
{
    use HasActivityLogs, HasLocalDates;
}
