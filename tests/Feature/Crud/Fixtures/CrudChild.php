<?php

namespace Tests\Feature\Crud\Fixtures;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
#[Table(name: 'crud_children')]
#[WithoutTimestamps]
class CrudChild extends Model {}
