<?php

namespace App\Modules\Translation\Requests;

use Crud\Requests\AppFormRequest;

class ResetTranslationsRequest extends AppFormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'ids' => 'required|array|min:1|max:200',
            'ids.*' => 'integer|distinct|exists:translations,id',
        ];
    }
}
