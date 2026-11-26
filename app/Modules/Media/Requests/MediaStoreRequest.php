<?php

namespace App\Modules\Media\Requests;

use App\Modules\Media\Enums\MediaVisibilityEnum;
use App\Modules\Settings\Rules\ExecutableUploadRule;
use Crud\Requests\AppFormRequest;
use Illuminate\Validation\Rule;

class MediaStoreRequest extends AppFormRequest
{
    /**
     * The MIME allowlist is enforced by the service on the inspected type. This rule only
     * gives early feedback and checks the same server-side MIME value.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $mimeTypes = array_keys(config('modules.media.allowed_mime_types', []));

        if (config('modules.media.allow_svg')) {
            $mimeTypes[] = 'image/svg+xml';
        }

        return [
            'file' => [
                'bail',
                'required',
                'file',
                'max:'.config('modules.media.max_upload_kilobytes'),
                new ExecutableUploadRule,
                'mimetypes:'.implode(',', $mimeTypes),
            ],
            'title' => ['nullable', 'string', 'max:255'],
            'alt_text' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:5000'],
            'folder_id' => ['nullable', 'integer', 'exists:media_folders,id'],
            'visibility' => ['nullable', Rule::enum(MediaVisibilityEnum::class)],
        ];
    }
}
