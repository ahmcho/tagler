<?php

namespace App\Modules\Media\Requests;

use App\Modules\Media\Enums\MediaCategoryEnum;
use App\Modules\Media\Enums\MediaVisibilityEnum;
use Crud\Requests\AppFormRequest;
use Illuminate\Validation\Rule;

class MediaIndexRequest extends AppFormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category' => ['nullable', Rule::enum(MediaCategoryEnum::class)],
            'search' => ['nullable', 'string', 'max:200'],
            'folder' => ['nullable', 'string', 'regex:/^(root|\d+)$/'],
            'visibility' => ['nullable', Rule::enum(MediaVisibilityEnum::class)],
            'uploaded_by' => ['nullable', 'integer', 'exists:users,id'],
            'created_from' => ['nullable', 'date_format:Y-m-d'],
            'created_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:created_from'],
            'sort' => ['nullable', Rule::in(['created_desc', 'created_asc', 'name_asc', 'name_desc', 'size_desc', 'size_asc'])],
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
        $filters = array_merge($this->matchFilters($validated), $this->orderingFilters($validated));

        if (array_key_exists('folder', $validated)) {
            $filters['folder'] = $this->folderFilter($validated['folder']);
        }

        return $filters;
    }

    /**
     * The nullable filters that narrow the library by content, owner or date.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function matchFilters(array $validated): array
    {
        return [
            'category' => $validated['category'] ?? null,
            'search' => $validated['search'] ?? null,
            'visibility' => $validated['visibility'] ?? null,
            'uploaded_by' => $validated['uploaded_by'] ?? null,
            'created_from' => $validated['created_from'] ?? null,
            'created_to' => $validated['created_to'] ?? null,
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{sort: string, trashed: bool}
     */
    private function orderingFilters(array $validated): array
    {
        return [
            'sort' => $validated['sort'] ?? 'created_desc',
            'trashed' => (bool) ($validated['trashed'] ?? false),
        ];
    }

    /**
     * The root folder is stored as null, so it maps to null rather than to an id.
     */
    private function folderFilter(mixed $folder): ?int
    {
        return $folder === 'root' ? null : (int) $folder;
    }

    public function resultsPerPage(): int
    {
        return (int) ($this->validated('per_page') ?? 40);
    }
}
