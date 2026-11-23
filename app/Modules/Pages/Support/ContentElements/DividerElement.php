<?php

namespace App\Modules\Pages\Support\ContentElements;

class DividerElement implements ContentElement
{
    public function key(): string
    {
        return 'divider';
    }

    public function label(): string
    {
        return 'Divider';
    }

    public function rules(): array
    {
        return [];
    }

    /**
     * @return array{defaults: array<string, mixed>, fields: list<array<string, mixed>>}
     */
    public function schema(): array
    {
        return [
            'defaults' => [],
            'fields' => [],
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
        return [];
    }

    public function present(array $data): array
    {
        return [];
    }
}
