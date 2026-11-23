<?php

namespace App\Modules\Pages\Support\ContentElements;

class HeadingElement implements ContentElement
{
    public function key(): string
    {
        return 'heading';
    }

    public function label(): string
    {
        return 'Heading';
    }

    public function rules(): array
    {
        return [
            'text' => ['required', 'string', 'max:255'],
            'level' => ['required', 'integer', 'between:1,6'],
        ];
    }

    /**
     * @return array{defaults: array<string, mixed>, fields: list<array<string, mixed>>}
     */
    public function schema(): array
    {
        return [
            'defaults' => ['text' => '', 'level' => 2],
            'fields' => [
                ['name' => 'text', 'label' => 'Text', 'type' => 'text', 'required' => true],
                ['name' => 'level', 'label' => 'Level', 'type' => 'select', 'required' => true, 'options' => [
                    ['value' => 1, 'label' => 'Heading 1'],
                    ['value' => 2, 'label' => 'Heading 2'],
                    ['value' => 3, 'label' => 'Heading 3'],
                    ['value' => 4, 'label' => 'Heading 4'],
                    ['value' => 5, 'label' => 'Heading 5'],
                    ['value' => 6, 'label' => 'Heading 6'],
                ]],
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'level.required' => __('pages.errors.heading_level_required'),
            'level.integer' => __('pages.errors.heading_level_whole'),
            'level.between' => __('pages.errors.heading_level_range'),
        ];
    }

    public function requiresPermission(): ?string
    {
        return null;
    }

    public function normalize(array $data): array
    {
        return ['text' => trim((string) $data['text']), 'level' => (int) $data['level']];
    }

    public function present(array $data): array
    {
        return ['text' => (string) ($data['text'] ?? ''), 'level' => (int) ($data['level'] ?? 2)];
    }
}
