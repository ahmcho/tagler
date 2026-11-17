<?php

namespace App\Modules\Auth\Models;

use App\Modules\Auth\Concerns\HasActivityLogs;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Spatie\Permission\Models\Role as SpatieRole;

#[Fillable(['name', 'guard_name'])]
class Role extends SpatieRole
{
    use HasActivityLogs;
}
