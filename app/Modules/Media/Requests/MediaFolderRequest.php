<?php

namespace App\Modules\Media\Requests;

use Crud\Requests\AppFormRequest;

class MediaFolderRequest extends AppFormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120', 'not_regex:/[\/\\\\]/'],
            'parent_id' => ['nullable', 'integer', 'exists:media_folders,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('name'))) {
            $this->merge(['name' => trim($this->input('name'))]);
        }
    }
}
