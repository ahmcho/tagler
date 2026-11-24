<?php

namespace App\Modules\Media\Requests;

use Crud\Requests\AppFormRequest;

class MediaFolderMoveRequest extends AppFormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'parent_id' => ['nullable', 'integer', 'exists:media_folders,id'],
        ];
    }
}
