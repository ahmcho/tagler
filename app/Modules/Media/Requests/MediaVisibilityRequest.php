<?php

namespace App\Modules\Media\Requests;

use App\Modules\Media\Enums\MediaVisibilityEnum;
use Crud\Requests\AppFormRequest;
use Illuminate\Validation\Rule;

class MediaVisibilityRequest extends AppFormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'visibility' => ['required', Rule::enum(MediaVisibilityEnum::class)],
        ];
    }
}
