<?php

namespace App\Modules\Pages\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Pages\Enums\LocaleEnum;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Models\PageRevision;
use App\Modules\Pages\Requests\PageRequest;
use App\Modules\Pages\Resources\PageResource;
use App\Modules\Pages\Services\Contracts\PageServiceContract;
use App\Modules\Pages\Support\ContentElementRegistry;
use App\Modules\Pages\Support\ContentElements\ContentElement;
use App\Modules\Pages\Support\PageContentDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class PageController extends Controller
{
    /** @var list<string> */
    private const array TRANSLATION_FIELDS = ['title', 'subtitle', 'slug', 'seo_title', 'seo_description', 'content'];

    public function __construct(
        private readonly PageServiceContract $service,
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
            'preview' => 'update',
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
            'defaultLocale' => LocaleEnum::default(),
            'status' => session('status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('pages/create', [
            'model' => $this->formModel(null, $this->pageValues(null)),
            'parents' => $this->parentOptions(null),
            'locales' => $this->localeOptions(),
            'defaultLocale' => LocaleEnum::default(),
            ...$this->editorProps(),
        ]);
    }

    public function store(PageRequest $request): RedirectResponse
    {
        $this->service->create($request->validated());

        return redirect()->route('pages.index')->with('status', __('pages.messages.created'));
    }

    /**
     * With `?revision=` the form opens filled from that revision. Nothing is saved until the user clicks Save,
     * so the normal validation and the new revision apply.
     */
    public function edit(Request $request, Page $page): Response
    {
        $revision = $this->requestedRevision($request, $page);
        $page->load('translations');

        return Inertia::render('pages/edit', [
            'model' => $this->formModel($page, $revision === null
                ? $this->pageValues($page)
                : $this->snapshotValues($revision->snapshot)),
            'parents' => $this->parentOptions($page),
            'locales' => $this->localeOptions(),
            'defaultLocale' => LocaleEnum::default(),
            'revisions' => $this->revisionOptions($page),
            'loadedRevision' => $revision === null ? null : [
                'id' => $revision->id,
                'created_at' => $revision->created_at->format('Y-m-d H:i'),
            ],
            ...$this->editorProps(),
        ]);
    }

    /**
     * The revision named in the request. It must belong to this page, or the request gets a 404.
     */
    private function requestedRevision(Request $request, Page $page): ?PageRevision
    {
        if (! $request->filled('revision')) {
            return null;
        }

        $revision = $this->service->findRevision($page, $request->integer('revision'));

        abort_if($revision === null, HttpResponse::HTTP_NOT_FOUND);

        return $revision;
    }

    /**
     * @return array<int, array{id: int, created_at: string, user: string|null}>
     */
    private function revisionOptions(Page $page): array
    {
        return $this->service->revisions($page)
            ->map(fn (PageRevision $revision): array => [
                'id' => $revision->id,
                'created_at' => $revision->created_at->format('Y-m-d H:i'),
                'user' => $revision->user?->name,
            ])
            ->values()
            ->all();
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

    /**
     * Redirects to a fresh signed preview link for one locale. The link expires after the configured minutes.
     */
    public function preview(Page $page, string $locale): RedirectResponse
    {
        $page->load('translations');

        abort_if($page->translationFor($locale) === null, HttpResponse::HTTP_NOT_FOUND);

        return redirect()->to(URL::temporarySignedRoute(
            'pages.preview.show',
            now()->addMinutes((int) config('modules.pages.preview.minutes')),
            ['page' => $page, 'locale' => $locale],
        ));
    }

    public function setHomepage(Page $page): RedirectResponse
    {
        $this->service->assignHomepage($page);

        return back()->with('status', __('pages.messages.homepage_assigned'));
    }

    /**
     * The form values of a saved page.
     *
     * @return array{parent_id: int|null, status: string, published_at: string|null, layout: string, theme_layout: bool, translations: array<string, array<string, mixed>|null>}
     */
    private function pageValues(?Page $page): array
    {
        return [
            'parent_id' => $page?->parent_id,
            'status' => $page?->status->value ?? 'draft',
            'published_at' => $page?->published_at?->format('Y-m-d\TH:i'),
            'layout' => $page->layout ?? '',
            'theme_layout' => $page === null || $page->theme_layout,
            'translations' => collect(LocaleEnum::codes())
                ->mapWithKeys(fn (string $locale): array => [$locale => $page?->translationFor($locale)?->only(self::TRANSLATION_FIELDS)])
                ->all(),
        ];
    }

    /**
     * The form values stored in a revision, in the same shape as `pageValues()`.
     *
     * @param  array<string, mixed>  $snapshot
     * @return array{parent_id: int|null, status: string, published_at: string|null, layout: string, theme_layout: bool, translations: array<string, array<string, mixed>|null>}
     */
    private function snapshotValues(array $snapshot): array
    {
        return [
            'parent_id' => $snapshot['parent_id'] ?? null,
            'status' => (string) ($snapshot['status'] ?? 'draft'),
            'published_at' => isset($snapshot['published_at']) ? Carbon::parse($snapshot['published_at'])->format('Y-m-d\TH:i') : null,
            'layout' => (string) ($snapshot['layout'] ?? ''),
            'theme_layout' => (bool) ($snapshot['theme_layout'] ?? true),
            'translations' => $snapshot['translations'] ?? [],
        ];
    }

    /**
     * The form model. Every supported locale gets an entry, blank when the page has no translation there.
     *
     * @param  array{parent_id: int|null, status: string, published_at: string|null, layout: string, theme_layout: bool, translations: array<string, array<string, mixed>|null>}  $values
     * @return array<string, mixed>
     */
    private function formModel(?Page $page, array $values): array
    {
        $translations = [];

        foreach (LocaleEnum::codes() as $locale) {
            $translation = $values['translations'][$locale] ?? null;

            $translations[$locale] = [
                'title' => $translation['title'] ?? '',
                'subtitle' => $translation['subtitle'] ?? '',
                'slug' => $translation['slug'] ?? '',
                'seo_title' => $translation['seo_title'] ?? '',
                'seo_description' => $translation['seo_description'] ?? '',
                'content' => $translation['content'] ?? PageContentDocument::empty(),
            ];
        }

        return [
            'id' => $page?->id,
            'parent_id' => $values['parent_id'],
            'status' => $values['status'],
            'published_at' => $values['published_at'],
            'layout' => $values['layout'],
            'theme_layout' => $values['theme_layout'],
            'translations' => $translations,
        ];
    }

    /**
     * What the section editor needs: layouts, backgrounds, element types with their fields, and whether the editor may write raw HTML.
     *
     * @return array{layouts: array<int, array{key: string, label: string}>, backgrounds: array<int, array{key: string, label: string}>, elementTypes: array<int, array<string, mixed>>, canUseHtml: bool}
     */
    private function editorProps(): array
    {
        return [
            'layouts' => collect((array) config('modules.pages.layouts', []))
                ->map(fn (string $label, string $key): array => ['key' => $key, 'label' => $label])
                ->values()
                ->all(),
            'backgrounds' => collect((array) config('modules.pages.backgrounds', []))
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
     * @return array<int, array{code: string, name: string, country: string|null}>
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
     * @return array<int, array{id: int, title: string, path: string}>
     */
    private function parentOptions(?Page $page): array
    {
        $defaultLocale = LocaleEnum::default();

        return Page::query()
            ->with('translations')
            ->when($page, fn ($query, Page $current) => $query->whereKeyNot($current->id))
            ->get()
            ->map(fn (Page $candidate): array => [
                'id' => $candidate->id,
                'title' => $candidate->translationFor($defaultLocale)->title ?? '#'.$candidate->id,
                'path' => $candidate->translationFor($defaultLocale)->path ?? '',
            ])
            ->values()
            ->all();
    }
}
