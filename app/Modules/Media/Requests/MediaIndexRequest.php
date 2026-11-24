<?php

namespace App\Modules\Media\Requests;

use App\Modules\Media\Enums\MediaCategory;
use App\Modules\Media\Enums\MediaVisibility;
use Crud\Requests\AppFormRequest;
use Illuminate\Validation\Rule;

class MediaIndexRequest extends AppFormRequest
{
    public const array SORTS = ['created_desc', 'created_asc', 'name_asc', 'name_desc', 'size_desc', 'size_asc'];

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category' => ['nullable', Rule::enum(MediaCategory::class)],
            'search' => ['nullable', 'string', 'max:200'],
            'folder' => ['nullable', 'string', 'regex:/^(root|\d+)$/'],
            'visibility' => ['nullable', Rule::enum(MediaVisibility::class)],
            'uploaded_by' => ['nullable', 'integer', 'exists:users,id'],
            'created_from' => ['nullable', 'date_format:Y-m-d'],
            'created_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:created_from'],
            'sort' => ['nullable', Rule::in(self::SORTS)],
            'trashed' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'between:1,100'],
        ];
    }

    /**
     * Filters for the repository. The folder key is present only when a folder was requested,
     * and null means the root folder.
     *
     * @return array<string, mixed>
     */
    public function filters(): array
    {
        $validated = $this->validated();
        $filters = [
            'category' => $validated['category'] ?? null,
            'search' => $validated['search'] ?? null,
            'visibility' => $validated['visibility'] ?? null,
            'uploaded_by' => $validated['uploaded_by'] ?? null,
            'created_from' => $validated['created_from'] ?? null,
            'created_to' => $validated['created_to'] ?? null,
            'sort' => $validated['sort'] ?? 'created_desc',
            'trashed' => (bool) ($validated['trashed'] ?? false),
        ];

        if (array_key_exists('folder', $validated)) {
            $filters['folder'] = $validated['folder'] === 'root' ? null : (int) $validated['folder'];
        }

        return $filters;
    }

    public function resultsPerPage(): int
    {
        return (int) ($this->validated('per_page') ?? 40);
    }
}
