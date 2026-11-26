<?php

namespace App\Modules\Pages\Services;

use App\Modules\Pages\Concerns\HasPageTranslations;
use App\Modules\Pages\Enums\PageStatusEnum;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Models\PageRevision;
use App\Modules\Pages\Models\PageTranslation;
use App\Modules\Pages\Repositories\Contracts\PageRepositoryContract;
use App\Modules\Pages\Repositories\Contracts\PageRevisionRepositoryContract;
use App\Modules\Pages\Repositories\Contracts\PageTranslationRepositoryContract;
use App\Modules\Pages\Services\Contracts\PageServiceContract;
use App\Modules\Pages\Support\PagePath;
use Carbon\CarbonInterface;
use Crud\Services\BaseCrudService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Owns the page rules. Paths follow the parent chain in each locale. A child
 * needs a translation in every locale its parent has, and a parent cannot lose
 * a locale that a child still uses. Only one homepage exists, and it can only
 * be assigned while it is live.
 */
class PageService extends BaseCrudService implements PageServiceContract
{
    use HasPageTranslations;

    public function __construct(
        private readonly PageRepositoryContract $pageRepository,
        private readonly PageTranslationRepositoryContract $translationRepository,
        private readonly PageRevisionRepositoryContract $revisionRepository,
    ) {
        parent::__construct($pageRepository);
    }

    public function create(array $payload): Model
    {
        return DB::transaction(function () use ($payload): Model {
            $parent = $this->findParent($payload['parent_id'] ?? null);

            /** @var Page $page */
            $page = $this->pageRepository->create($this->pageAttributes($payload, $parent));

            $this->syncTranslations($page, $parent, $payload['translations']);
            $this->recordRevision($page);

            return $page;
        });
    }

    public function update(int|Model $modelOrModelId, array $payload): Model
    {
        return DB::transaction(function () use ($modelOrModelId, $payload): Model {
            /** @var Page $page */
            $page = $this->pageRepository->findById($modelOrModelId);

            $parent = $page->is_homepage ? null : $this->findParent($payload['parent_id'] ?? null);

            $this->assertNotUnderItself($page, $parent);

            /** @var Page $page */
            $page = $this->pageRepository->update($page, $this->pageAttributes($payload, $parent));

            $this->syncTranslations($page, $parent, $payload['translations']);
            $this->refreshDescendantPaths($page);
            $this->recordRevision($page);

            return $page;
        });
    }

    public function assignHomepage(Page $page): Page
    {
        if (! $page->isLive(Carbon::now())) {
            throw ValidationException::withMessages([
                'is_homepage' => __('pages.errors.homepage_requires_live_page'),
            ]);
        }

        return DB::transaction(function () use ($page): Page {
            $this->releaseHomepage($page);

            $page->parent_id = null;
            $page->is_homepage = true;
            $page->save();

            foreach ($this->translationRepository->forPage($page) as $translation) {
                $translation->path = PagePath::HOMEPAGE;
                $translation->save();
            }

            $this->refreshDescendantPaths($page);

            return $page;
        });
    }

    /**
     * A page with children cannot be deleted. Deleting it would leave the children
     * with paths that no longer match their ancestors.
     */
    public function delete(int|Model $modelOrModelId): bool
    {
        /** @var Page $page */
        $page = $modelOrModelId instanceof Model
            ? $modelOrModelId
            : $this->pageRepository->findById($modelOrModelId);

        if ($this->pageRepository->childrenOf($page)->isNotEmpty()) {
            throw ValidationException::withMessages([
                'delete' => __('pages.errors.has_children'),
            ]);
        }

        return $this->pageRepository->deleteById($page);
    }

    public function publish(Page $page): Page
    {
        $page->status = PageStatusEnum::Published;

        if ($page->publish_date === null) {
            $now = Carbon::now();
            $page->publish_date = $now->copy()->startOfDay();
            $page->publish_time = $now->format('H:i');
        }

        $page->save();

        return $page;
    }

    /**
     * Saves the page as it is now, after an explicit create or update. Publish and homepage changes are not saves.
     */
    private function recordRevision(Page $page): void
    {
        $page->load('translations');

        $this->revisionRepository->create([
            'page_id' => $page->id,
            'user_id' => Auth::id(),
            'snapshot' => $this->snapshotOf($page),
        ]);

        $this->revisionRepository->pruneForPage($page, (int) config('modules.pages.revisions.keep'));
    }

    /**
     * The page in the same shape as a save payload, so a revision can be loaded back into the form.
     *
     * @return array<string, mixed>
     */
    private function snapshotOf(Page $page): array
    {
        return [
            'status' => $page->status,
            'parent_id' => $page->parent_id,
            'publish_date' => $page->publish_date?->toDateString(),
            'publish_time' => $page->publish_time,
            'layout' => $page->layout,
            'theme_layout' => $page->theme_layout,
            'translations' => $page->translations
                ->mapWithKeys(fn (PageTranslation $translation): array => [$translation->locale => [
                    'title' => $translation->title,
                    'subtitle' => $translation->subtitle,
                    'slug' => $translation->slug,
                    'seo_title' => $translation->seo_title,
                    'seo_description' => $translation->seo_description,
                    'body' => $translation->body,
                    'body_format' => $translation->body_format,
                ]])
                ->all(),
        ];
    }

    public function revisions(Page $page): Collection
    {
        return $this->revisionRepository->latestForPage($page, (int) config('modules.pages.revisions.keep'));
    }

    public function findRevision(Page $page, int $revisionId): ?PageRevision
    {
        return $this->revisionRepository->findForPage($page, $revisionId);
    }

    /**
     * Saves each page one by one, so model events and the activity log run for every change.
     */
    public function publishDueScheduled(CarbonInterface $now): int
    {
        $pages = $this->pageRepository->dueScheduledPages($now);

        foreach ($pages as $page) {
            $this->publish($page);
        }

        return $pages->count();
    }

    /**
     * Unpublishing keeps the homepage flag. The page is simply not live, so `/` shows a 404 until the page is published again.
     */
    public function unpublish(Page $page): Page
    {
        $page->status = PageStatusEnum::Draft;
        $page->save();

        return $page;
    }

    public function resolvePath(string $locale, ?int $parentId, string $slug): ?PagePath
    {
        try {
            return $this->pathUnder($this->findParent($parentId), $locale, $slug);
        } catch (ValidationException) {
            return null;
        }
    }

    public function parentHasLocale(?int $parentId, string $locale): bool
    {
        $parent = $this->findParent($parentId);

        return $parent === null || $this->translationRepository->find($parent, $locale) !== null;
    }

    public function pathIsTaken(string $locale, PagePath $path, ?int $ignorePageId = null): bool
    {
        return $this->translationRepository->pathIsTaken($locale, $path->value, $ignorePageId);
    }

    /**
     * Gives up the homepage flag so another page can take `/`. The old homepage
     * becomes a top-level page, and its paths are rebuilt from its slugs.
     */
    private function releaseHomepage(Page $incoming): void
    {
        $current = $this->pageRepository->findHomepage();

        if ($current === null || $current->is($incoming)) {
            return;
        }

        $current->is_homepage = false;
        $current->save();

        foreach ($this->translationRepository->forPage($current) as $translation) {
            $path = $this->pathUnder(null, $translation->locale, $translation->slug);

            if ($this->translationRepository->pathIsTaken($translation->locale, $path->value, $current->id)) {
                throw ValidationException::withMessages([
                    'is_homepage' => __('pages.errors.path_taken', ['path' => $path->value]),
                ]);
            }

            $translation->path = $path->value;
            $translation->save();
        }

        $this->refreshDescendantPaths($current);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function pageAttributes(array $payload, ?Page $parent): array
    {
        return [
            'parent_id' => $parent?->id,
            'status' => $payload['status'],
            'layout' => $payload['layout'] ?? null,
            'theme_layout' => (bool) ($payload['theme_layout'] ?? true),
            'publish_date' => $payload['publish_date'] ?? null,
            'publish_time' => $payload['publish_time'] ?? null,
        ];
    }
}
