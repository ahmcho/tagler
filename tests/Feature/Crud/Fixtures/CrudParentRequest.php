<?php

namespace Tests\Feature\Crud\Fixtures;

use Crud\Requests\AppFormRequest;

class CrudParentRequest extends AppFormRequest
{
    protected ?string $sortBy = '-id';

    protected array $expandable = ['children'];

    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string'],
            'status' => ['nullable', 'integer'],
        ];
    }

    protected function sortable(): array
    {
        return ['name'];
    }

    protected function customSortable(): array
    {
        return ['recent'];
    }
}
