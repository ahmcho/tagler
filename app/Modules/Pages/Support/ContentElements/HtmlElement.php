<?php

namespace App\Modules\Pages\Support\ContentElements;

use App\Modules\Pages\Support\PageHtmlSanitizer;

/**
 * Raw HTML written by an editor. Saving needs the `pages.html` permission, and the HTML is sanitised on save and on output.
 */
class HtmlElement implements ContentElement
{
    public function __construct(private readonly PageHtmlSanitizer $sanitizer) {}

    public function key(): string
    {
        return 'html';
    }

    public function label(): string
    {
        return 'HTML block';
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
                ['name' => 'source', 'label' => 'HTML', 'type' => 'textarea', 'required' => true],
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
        return 'pages.html';
    }

    public function normalize(array $data): array
    {
        return ['source' => $this->sanitizer->sanitize((string) $data['source'])];
    }

    public function present(array $data): array
    {
        return ['html' => $this->sanitizer->sanitize((string) ($data['source'] ?? ''))];
    }
}
