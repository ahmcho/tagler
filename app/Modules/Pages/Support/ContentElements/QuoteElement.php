<?php

namespace App\Modules\Pages\Support\ContentElements;

class QuoteElement implements ContentElement
{
    public function key(): string
    {
        return 'quote';
    }

    public function label(): string
    {
        return 'Quote';
    }

    public function rules(): array
    {
        return [
            'text' => ['required', 'string', 'max:1000'],
            'cite' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array{defaults: array<string, mixed>, fields: list<array<string, mixed>>}
     */
    public function schema(): array
    {
        return [
            'defaults' => ['text' => '', 'cite' => ''],
            'fields' => [
                ['name' => 'text', 'label' => 'Quote', 'type' => 'textarea', 'required' => true],
                ['name' => 'cite', 'label' => 'Source', 'type' => 'text', 'required' => false],
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
        return ['text' => trim((string) $data['text']), 'cite' => isset($data['cite']) ? trim((string) $data['cite']) : null];
    }

    public function present(array $data): array
    {
        return ['text' => (string) ($data['text'] ?? ''), 'cite' => $data['cite'] ?? null];
    }
}
