<?php

namespace App\Modules\Auth\Requests;

use App\Modules\Auth\Concerns\FiltersQuery;
use Crud\Requests\AppFormRequest;
use Illuminate\Validation\Rule;

class ActivityLogRequest extends AppFormRequest
{
    use FiltersQuery;

    protected ?string $sortBy = '-created_at';

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'event' => ['nullable', Rule::in(['created', 'updated', 'deleted'])],
            'subject_type' => ['nullable', 'string', 'max:255'],
            'subject_id' => ['nullable', 'integer'],
            'causer_id' => ['nullable', 'integer'],
        ];
    }

    /**
     * @return array<int, string>
     */
    protected function sortable(): array
    {
        return ['event', 'subject_type', 'created_at'];
    }
}
