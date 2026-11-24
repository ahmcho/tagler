<?php

namespace App\Modules\Pages\Support\ContentElements;

use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Repositories\Contracts\PageRepositoryContract;
use App\Modules\Pages\Support\PageRenderContext;
use Illuminate\Support\Carbon;

/**
 * Lists the live child pages of the page in the current locale. Pages without a
 * translation in that locale are left out, as the public site does.
 */
class ChildPagesElement implements DynamicContentElement
{
    private const array LIMITS = [5, 10, 20];

    private const array ORDERS = ['title', 'updated'];

    public function __construct(private readonly PageRepositoryContract $pages) {}

    public function key(): string
    {
        return 'child-pages';
    }

    public function label(): string
    {
        return 'Child pages';
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:150'],
            'limit' => ['required', 'integer', 'in:'.implode(',', self::LIMITS)],
            'order' => ['required', 'string', 'in:'.implode(',', self::ORDERS)],
        ];
    }

    public function schema(): array
    {
        return [
            'defaults' => ['title' => '', 'limit' => 10, 'order' => 'title'],
            'fields' => [
                ['name' => 'title', 'label' => 'Heading', 'type' => 'text', 'required' => false],
                ['name' => 'limit', 'label' => 'Number of pages', 'type' => 'select', 'required' => true, 'options' => array_map(
                    fn (int $limit): array => ['value' => $limit, 'label' => (string) $limit],
                    self::LIMITS,
                )],
                ['name' => 'order', 'label' => 'Order', 'type' => 'select', 'required' => true, 'options' => [
                    ['value' => 'title', 'label' => 'Title'],
                    ['value' => 'updated', 'label' => 'Last updated'],
                ]],
            ],
        ];
    }

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
            'title' => trim((string) ($data['title'] ?? '')),
            'limit' => (int) $data['limit'],
            'order' => (string) $data['order'],
        ];
    }

    public function present(array $data): array
    {
        return [
            'title' => (string) ($data['title'] ?? ''),
            'limit' => (int) ($data['limit'] ?? 10),
            'order' => (string) ($data['order'] ?? 'title'),
        ];
    }

    public function resolve(array $data, PageRenderContext $context): array
    {
        $locale = $context->translation->locale;
        $page = $context->translation->page;

        if (! $page instanceof Page) {
            return ['items' => []];
        }

        $children = $this->pages->liveChildrenOf($page, $locale, Carbon::now());

        $children = $data['order'] === 'updated'
            ? $children->sortByDesc('updated_at')
            : $children->sortBy(fn (Page $child): string => (string) $child->translationFor($locale)?->title, SORT_NATURAL | SORT_FLAG_CASE);

        $items = $children
            ->take((int) $data['limit'])
            ->map(fn (Page $child): array => [
                'title' => (string) $child->translationFor($locale)?->title,
                'url' => $this->urlFor($child->translationFor($locale)?->path ?? '', $locale),
            ])
            ->values()
            ->all();

        return ['items' => $items];
    }

    /**
     * Every page except the homepage has its locale in the URL, in every locale, including the default.
     */
    private function urlFor(string $path, string $locale): string
    {
        return '/'.$locale.'/'.$path;
    }
}
