<?php

namespace App\Modules\Auth\Models;

use App\Modules\Settings\Concerns\HasLocalDates;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Spatie\Permission\Models\Permission as SpatiePermission;

/**
 * @property string|null $description
 */
#[Fillable(['name', 'guard_name', 'description'])]
class Permission extends SpatiePermission
{
    use HasLocalDates;
}
