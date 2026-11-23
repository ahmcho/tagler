<?php

namespace App\Modules\Pages\Support\ContentElements;

class SpacerElement implements ContentElement
{
    public function key(): string
    {
        return 'spacer';
    }

    public function label(): string
    {
        return 'Spacer';
    }

    public function rules(): array
    {
        return ['height' => ['required', 'in:sm,md,lg']];
    }

    /**
     * @return array{defaults: array<string, mixed>, fields: list<array<string, mixed>>}
     */
    public function schema(): array
    {
        return [
            'defaults' => ['height' => 'md'],
            'fields' => [
                ['name' => 'height', 'label' => 'Height', 'type' => 'select', 'required' => true, 'options' => [
                    ['value' => 'sm', 'label' => 'Small'],
                    ['value' => 'md', 'label' => 'Medium'],
                    ['value' => 'lg', 'label' => 'Large'],
                ]],
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
        return ['height' => (string) $data['height']];
    }

    public function present(array $data): array
    {
        return ['height' => in_array($data['height'] ?? null, ['sm', 'md', 'lg'], true) ? $data['height'] : 'md'];
    }
}
