<?php

namespace App\Modules\Media\Requests;

use Crud\Requests\AppFormRequest;

class MediaUpdateRequest extends AppFormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'alt_text' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
