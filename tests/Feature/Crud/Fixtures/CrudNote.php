<?php

namespace Tests\Feature\Crud\Fixtures;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Unguarded]
#[Table(name: 'crud_notes')]
class CrudNote extends Model
{
    use SoftDeletes;
}
