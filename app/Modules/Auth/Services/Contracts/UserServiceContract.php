<?php

namespace App\Modules\Auth\Services\Contracts;

use Crud\Services\Contracts\BaseCrudServiceContract;
use Illuminate\Database\Eloquent\Model;

interface UserServiceContract extends BaseCrudServiceContract
{
    /**
     * @param  array<string, mixed>  $payload  Validated input: name, email, password and role ids
     */
    public function create(array $payload): Model;

    /**
     * Password is optional on update: an empty value keeps the current password.
     *
     * @param  array<string, mixed>  $payload  Validated input: name, email, optional password, role ids
     */
    public function update(int|Model $modelOrModelId, array $payload): Model;
}
