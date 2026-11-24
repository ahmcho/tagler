<?php

namespace App\Modules\Media\Requests;

use Crud\Requests\AppFormRequest;

class MediaMoveRequest extends AppFormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'folder_id' => ['nullable', 'integer', 'exists:media_folders,id'],
        ];
    }
}
