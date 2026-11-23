<?php

namespace Tests\Feature\Crud\Fixtures;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
#[Table(name: 'crud_parents')]
class CrudParent extends Model
{
    /**
     * @return HasMany<CrudChild, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(CrudChild::class, 'crud_parent_id');
    }
}
