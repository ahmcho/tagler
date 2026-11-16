<?php

namespace App\Modules\Auth\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Spatie\Permission\Models\Permission as SpatiePermission;

#[Fillable(['name', 'guard_name', 'description'])]
class Permission extends SpatiePermission {}
