<?php

namespace App\Modules\Pages\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Requests\PageRequest;
use App\Modules\Pages\Resources\PageResource;
use App\Modules\Pages\Services\Contracts\PageServiceContract;
use App\Modules\Pages\Support\ContentElementRegistry;
use App\Modules\Pages\Support\ContentElements\ContentElement;
use App\Modules\Pages\Support\PageContentDocument;
use App\Modules\Pages\Support\PageLocales;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function __construct(
        private readonly PageServiceContract $service,
        private readonly PageLocales $locales,
    ) {
        $this->authorizeResource(Page::class, 'page');
    }

    /**
     * The custom actions use the same policy checks as the resource actions. The
     * `can` middleware runs before each method, so the methods do not check again.
     *
     * @return array<string, string>
     */
    protected function resourceAbilityMap(): array
    {
        return array_merge(parent::resourceAbilityMap(), [
            'publish' => 'publish',
            'unpublish' => 'publish',
            'setHomepage' => 'setHomepage',
        ]);
    }

    public function index(PageRequest $request): Response
    {
        $paginator = $this->service->getAllPaginated(
            requestParser: $request->parser(),
            columns: ['*'],
            relations: ['translations'],
        );

        return Inertia::render('pages/index', [
            'pages' => [
                'data' => PageResource::collection($paginator->items())->resolve(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
            ],
            'filters' => (object) $request->only(['sort', 'direction']),
            'locales' => $this->localeOptions(),
            'defaultLocale' => $this->locales->default(),
            'status' => session('status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('pages/create', [
            'model' => $this->formModel(null),
            'parents' => $this->parentOptions(null),
            'locales' => $this->localeOptions(),
            'defaultLocale' => $this->locales->default(),
            ...$this->editorProps(),
        ]);
    }

    public function store(PageRequest $request): RedirectResponse
    {
        $this->service->create($request->validated());

        return redirect()->route('pages.index')->with('status', __('pages.messages.created'));
    }

    public function edit(Page $page): Response
    {
        return Inertia::render('pages/edit', [
            'model' => $this->formModel($page->load('translations')),
            'parents' => $this->parentOptions($page),
            'locales' => $this->localeOptions(),
            'defaultLocale' => $this->locales->default(),
            ...$this->editorProps(),
        ]);
    }

    public function update(PageRequest $request, Page $page): RedirectResponse
    {
        $this->service->update($page, $request->validated());

        return redirect()->route('pages.index')->with('status', __('pages.messages.updated'));
    }

    public function destroy(Page $page): RedirectResponse
    {
        $this->service->delete($page);

        return redirect()->route('pages.index')->with('status', __('pages.messages.deleted'));
    }

    public function publish(Page $page): RedirectResponse
    {
        $this->service->publish($page);

        return back()->with('status', __('pages.messages.published'));
    }

    public function unpublish(Page $page): RedirectResponse
    {
        $this->service->unpublish($page);

        return back()->with('status', __('pages.messages.unpublished'));
    }

    public function setHomepage(Page $page): RedirectResponse
    {
        $this->service->assignHomepage($page);

        return back()->with('status', __('pages.messages.homepage_assigned'));
    }

    /**
     * The form model. Every supported locale gets an entry, blank when the page has no translation there.
     *
     * @return array<string, mixed>
     */
    private function formModel(?Page $page): array
    {
        $translations = [];

        foreach ($this->locales->codes() as $locale) {
            $translation = $page?->translationFor($locale);

            $translations[$locale] = [
                'title' => $translation?->title ?? '',
                'subtitle' => $translation?->subtitle ?? '',
                'slug' => $translation?->slug ?? '',
                'seo_title' => $translation?->seo_title ?? '',
                'seo_description' => $translation?->seo_description ?? '',
                'content' => $translation?->content ?? PageContentDocument::empty(),
            ];
        }

        return [
            'id' => $page?->id,
            'parent_id' => $page?->parent_id,
            'status' => $page?->status->value ?? 'draft',
            'published_at' => $page?->published_at?->format('Y-m-d\TH:i'),
            'layout' => $page?->layout ?? '',
            'translations' => $translations,
        ];
    }

    /**
     * What the section editor needs: layouts, element types with their fields, and whether the editor may write raw HTML.
     *
     * @return array{layouts: list<array{key: string, label: string}>, elementTypes: list<array<string, mixed>>, canUseHtml: bool}
     */
    private function editorProps(): array
    {
        return [
            'layouts' => collect(config('modules.pages.layouts', []))
                ->map(fn (string $label, string $key): array => ['key' => $key, 'label' => $label])
                ->values()
                ->all(),
            'elementTypes' => collect(app(ContentElementRegistry::class)->all())
                ->map(fn (ContentElement $element): array => [
                    'type' => $element->key(),
                    'label' => $element->label(),
                    'requiresPermission' => $element->requiresPermission(),
                    'schema' => $element->schema(),
                ])
                ->values()
                ->all(),
            'canUseHtml' => (bool) auth()->user()?->can('pages.html'),
        ];
    }

    /**
     * @return list<array{code: string, name: string, country: string|null}>
     */
    private function localeOptions(): array
    {
        return array_map(
            fn (array $locale): array => [
                'code' => $locale['code'],
                'name' => $locale['name'],
                'country' => config("modules.pages.locale_countries.{$locale['code']}"),
            ],
            config('app.supported_locales', []),
        );
    }

    /**
     * Pages that can be chosen as a parent, named by their default-locale title. A page never lists itself.
     *
     * @return list<array{id: int, title: string, path: string}>
     */
    private function parentOptions(?Page $page): array
    {
        $defaultLocale = $this->locales->default();

        return Page::query()
            ->with('translations')
            ->when($page !== null, fn ($query) => $query->whereKeyNot($page->id))
            ->get()
            ->map(fn (Page $candidate): array => [
                'id' => $candidate->id,
                'title' => $candidate->translationFor($defaultLocale)?->title ?? '#'.$candidate->id,
                'path' => $candidate->translationFor($defaultLocale)?->path ?? '',
            ])
            ->values()
            ->all();
    }
}
