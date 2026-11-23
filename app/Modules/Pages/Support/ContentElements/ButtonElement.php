<?php

namespace App\Modules\Pages\Support\ContentElements;

use App\Modules\Pages\Support\PageUrl;
use Closure;

class ButtonElement implements ContentElement
{
    public function key(): string
    {
        return 'button';
    }

    public function label(): string
    {
        return 'Button';
    }

    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:100'],
            'url' => ['required', 'string', 'max:2048', function (string $attribute, mixed $value, Closure $fail): void {
                if (! PageUrl::isSafe((string) $value)) {
                    $fail(__('pages.errors.unsafe_url'));
                }
            }],
            'target' => ['nullable', 'in:_self,_blank'],
        ];
    }

    /**
     * @return array{defaults: array<string, mixed>, fields: list<array<string, mixed>>}
     */
    public function schema(): array
    {
        return [
            'defaults' => ['label' => '', 'url' => '/', 'target' => '_self'],
            'fields' => [
                ['name' => 'label', 'label' => 'Label', 'type' => 'text', 'required' => true],
                ['name' => 'url', 'label' => 'Link', 'type' => 'url', 'required' => true],
                ['name' => 'target', 'label' => 'Opens in', 'type' => 'select', 'required' => false, 'options' => [
                    ['value' => '_self', 'label' => 'Same tab'],
                    ['value' => '_blank', 'label' => 'New tab'],
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
        return [
            'label' => trim((string) $data['label']),
            'url' => trim((string) $data['url']),
            'target' => $data['target'] ?? '_self',
        ];
    }

    public function present(array $data): array
    {
        $url = (string) ($data['url'] ?? '');

        return [
            'label' => (string) ($data['label'] ?? ''),
            'url' => PageUrl::isSafe($url) ? $url : '#',
            'target' => ($data['target'] ?? '_self') === '_blank' ? '_blank' : '_self',
        ];
    }
}
