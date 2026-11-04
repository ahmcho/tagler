<?php

namespace Tests\Feature\Crud\Fixtures;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrudParent extends Model
{
    protected $table = 'crud_parents';

    protected $guarded = [];

    /**
     * @return HasMany<CrudChild, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(CrudChild::class, 'crud_parent_id');
    }
}
