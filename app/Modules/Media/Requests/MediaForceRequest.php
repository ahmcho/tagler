<?php

namespace App\Modules\Media\Requests;

use Crud\Requests\AppFormRequest;

class MediaForceRequest extends AppFormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'force' => ['nullable', 'boolean'],
        ];
    }
}
