<?php

namespace App\Modules\Auth\Requests;

use App\Modules\Auth\Concerns\FiltersQuery;
use Crud\Requests\AppFormRequest;

class PermissionIndexRequest extends AppFormRequest
{
    use FiltersQuery;

    protected ?string $sortBy = 'name';

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => 'string|nullable',
            'description' => 'string|nullable',
        ];
    }

    /**
     * @return array<int, string>
     */
    protected function sortable(): array
    {
        return ['id', 'name', 'description', 'created_at'];
    }
}
