<?php

namespace App\Modules\Pages\Services;

use App\Modules\Pages\Enums\PageStatus;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Repositories\Contracts\PageRepositoryContract;
use App\Modules\Pages\Repositories\Contracts\PageTranslationRepositoryContract;
use App\Modules\Pages\Services\Contracts\PageServiceContract;
use App\Modules\Pages\Support\PageContentDocument;
use App\Modules\Pages\Support\PagePath;
use Crud\Services\BaseCrudService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

/**
 * Owns the page rules. Paths follow the parent chain in each locale. A child
 * needs a translation in every locale its parent has, and a parent cannot lose
 * a locale that a child still uses. Only one homepage exists, and it can only
 * be assigned while it is live.
 */
class PageService extends BaseCrudService implements PageServiceContract
{
    public function __construct(
        private readonly PageRepositoryContract $pageRepository,
        private readonly PageTranslationRepositoryContract $translationRepository,
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
        $page->status = PageStatus::Published;
        $page->published_at ??= Carbon::now();
        $page->save();

        return $page;
    }

    /**
     * Unpublishing keeps the homepage flag. The page is simply not live, so `/` shows a 404 until the page is published again.
     */
    public function unpublish(Page $page): Page
    {
        $page->status = PageStatus::Draft;
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
            'published_at' => $payload['published_at'] ?? null,
        ];
    }

    /**
     * Writes the translations sent for the page. A locale with a blank title or slug is removed.
     *
     * @param  array<string, array<string, mixed>>  $translations
     */
    private function syncTranslations(Page $page, ?Page $parent, array $translations): void
    {
        $active = array_filter(
            $translations,
            fn (array $translation): bool => filled($translation['title'] ?? null) && filled($translation['slug'] ?? null),
        );

        foreach ($this->translationRepository->forPage($page) as $existing) {
            if (isset($active[$existing->locale])) {
                continue;
            }

            if ($this->hasDescendantTranslation($page, $existing->locale)) {
                throw ValidationException::withMessages([
                    "translations.{$existing->locale}.slug" => __('pages.errors.locale_used_by_children', ['locale' => $existing->locale]),
                ]);
            }

            $this->translationRepository->deleteForLocale($page, $existing->locale);
        }

        foreach ($active as $locale => $translation) {
            $locale = (string) $locale;
            $path = $page->is_homepage
                ? PagePath::homepage()
                : $this->pathUnder($parent, $locale, (string) $translation['slug']);

            if ($this->translationRepository->pathIsTaken($locale, $path->value, $page->id)) {
                throw ValidationException::withMessages([
                    "translations.{$locale}.slug" => __('pages.errors.path_taken', ['path' => $path->value]),
                ]);
            }

            $attributes = [
                'title' => $translation['title'],
                'subtitle' => $translation['subtitle'] ?? null,
                'slug' => $translation['slug'],
                'path' => $path->value,
                'seo_title' => $translation['seo_title'] ?? null,
                'seo_description' => $translation['seo_description'] ?? null,
            ];

            if (is_array($translation['content'] ?? null)) {
                $attributes['content'] = $translation['content'];
            } elseif ($this->translationRepository->find($page, $locale) === null) {
                $attributes['content'] = PageContentDocument::empty();
            }

            $this->translationRepository->save($page, $locale, $attributes);
        }
    }

    /**
     * The path of a page placed under this parent, in one locale. A page with
     * no parent sits at the top level, so its path is only its slug.
     */
    private function pathUnder(?Page $parent, string $locale, string $slug): PagePath
    {
        $base = PagePath::homepage();

        if ($parent !== null) {
            $parentTranslation = $this->translationRepository->find($parent, $locale);

            if ($parentTranslation === null) {
                throw ValidationException::withMessages([
                    "translations.{$locale}.slug" => __('pages.errors.parent_not_in_locale', ['locale' => $locale]),
                ]);
            }

            $base = $this->pathOf($parentTranslation->path);
        }

        $path = $base->child($slug, $this->maxDepth());

        if ($path === null) {
            throw ValidationException::withMessages([
                "translations.{$locale}.slug" => __('pages.errors.invalid_slug'),
            ]);
        }

        return $path;
    }

    private function pathOf(string $storedPath): PagePath
    {
        return PagePath::parse($storedPath, $this->maxDepth())
            ?? throw new InvalidArgumentException("Stored path [{$storedPath}] is invalid.");
    }

    private function findParent(?int $parentId): ?Page
    {
        return $parentId === null ? null : $this->pageRepository->findOptional($parentId);
    }

    /**
     * A page cannot move under itself or under one of its own descendants.
     */
    private function assertNotUnderItself(Page $page, ?Page $parent): void
    {
        for ($ancestor = $parent; $ancestor !== null; $ancestor = $ancestor->parent) {
            if ($ancestor->is($page)) {
                throw ValidationException::withMessages([
                    'parent_id' => __('pages.errors.parent_is_descendant'),
                ]);
            }
        }
    }

    private function hasDescendantTranslation(Page $page, string $locale): bool
    {
        foreach ($this->pageRepository->childrenOf($page) as $child) {
            if ($this->translationRepository->find($child, $locale) !== null || $this->hasDescendantTranslation($child, $locale)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Child paths depend on the parent path in each locale, so a moved or
     * renamed page updates every page below it.
     */
    private function refreshDescendantPaths(Page $page): void
    {
        foreach ($this->pageRepository->childrenOf($page) as $child) {
            foreach ($this->translationRepository->forPage($child) as $translation) {
                if ($this->translationRepository->find($page, $translation->locale) === null) {
                    continue;
                }

                $translation->path = $this->pathUnder($page, $translation->locale, $translation->slug)->value;
                $translation->save();
            }

            $this->refreshDescendantPaths($child);
        }
    }

    private function maxDepth(): int
    {
        return (int) config('modules.pages.max_depth');
    }
}
