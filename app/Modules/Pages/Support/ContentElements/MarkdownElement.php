<?php

namespace App\Modules\Pages\Support\ContentElements;

use Illuminate\Support\Str;

/**
 * Markdown source. Raw HTML inside the source is escaped, and unsafe link targets are refused.
 */
class MarkdownElement implements ContentElement
{
    public function key(): string
    {
        return 'markdown';
    }

    public function label(): string
    {
        return 'Markdown';
    }

    public function rules(): array
    {
        return ['source' => ['required', 'string', 'max:50000']];
    }

    /**
     * @return array{defaults: array<string, mixed>, fields: list<array<string, mixed>>}
     */
    public function schema(): array
    {
        return [
            'defaults' => ['source' => ''],
            'fields' => [
                ['name' => 'source', 'label' => 'Markdown', 'type' => 'textarea', 'required' => true],
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [];
    }

    public function requiresPermission(): ?string
    {
        return null;
    }

    public function normalize(array $data): array
    {
        return ['source' => (string) $data['source']];
    }

    public function present(array $data): array
    {
        return ['html' => Str::markdown((string) ($data['source'] ?? ''), [
            'html_input' => 'escape',
            'allow_unsafe_links' => false,
        ])];
    }
}
