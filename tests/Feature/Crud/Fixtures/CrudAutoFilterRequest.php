<?php

namespace Tests\Feature\Crud\Fixtures;

use Crud\Requests\AppFormRequest;

class CrudAutoFilterRequest extends AppFormRequest
{
    protected array $customFilters = ['code'];

    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string'],
            'title' => 'nullable|string',
            'status' => ['nullable', 'integer'],
            'code' => ['nullable', 'string'],
        ];
    }
}
