<?php

namespace App\Modules\Pages\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Pages\Concerns\HasPageFormValues;
use App\Modules\Pages\Enums\LocaleEnum;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Models\PageRevision;
use App\Modules\Pages\Requests\PageRequest;
use App\Modules\Pages\Resources\PageResource;
use App\Modules\Pages\Services\Contracts\PageServiceContract;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class PageController extends Controller
{
    use HasPageFormValues;

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
            'filters' => (object) [...$request->filters(), ...$request->only(['sort', 'direction'])],
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
}
