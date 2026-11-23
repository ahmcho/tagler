<?php

namespace App\Modules\Pages\Support\ContentElements;

use App\Modules\Pages\Support\PageHtmlSanitizer;

/**
 * A rich text paragraph. The editor writes HTML, which is sanitised on save and on output.
 */
class ParagraphElement implements ContentElement
{
    public function __construct(private readonly PageHtmlSanitizer $sanitizer) {}

    public function key(): string
    {
        return 'paragraph';
    }

    public function label(): string
    {
        return 'Paragraph';
    }

    public function rules(): array
    {
        return ['html' => ['required', 'string', 'max:50000']];
    }

    /**
     * @return array{defaults: array<string, mixed>, fields: list<array<string, mixed>>}
     */
    public function schema(): array
    {
        return [
            'defaults' => ['html' => ''],
            'fields' => [
                ['name' => 'html', 'label' => 'Text', 'type' => 'rich', 'required' => true],
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return ['html.required' => __('pages.errors.paragraph_required')];
    }

    public function requiresPermission(): ?string
    {
        return null;
    }

    public function normalize(array $data): array
    {
        return ['html' => $this->sanitizer->sanitize((string) $data['html'])];
    }

    public function present(array $data): array
    {
        return ['html' => $this->sanitizer->sanitize((string) ($data['html'] ?? ''))];
    }
}
