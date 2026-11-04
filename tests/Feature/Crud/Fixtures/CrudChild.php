<?php

namespace Tests\Feature\Crud\Fixtures;

use Illuminate\Database\Eloquent\Model;

class CrudChild extends Model
{
    protected $table = 'crud_children';

    public $timestamps = false;

    protected $guarded = [];
}
