<?php

namespace App\Modules\Pages\Concerns;

use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Support\PageHtmlSanitizer;
use App\Modules\Pages\Support\PagePath;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

/**
 * Writes translations and keeps their paths in each locale. Used by PageService.
 */
trait HasPageTranslations
{
    /**
     * Writes the translations sent for the page. A locale with a blank title or slug is removed.
     *
     * @param  array<string, array<string, mixed>>  $translations
     */
    private function syncTranslations(Page $page, ?Page $parent, array $translations): void
    {
        $active = $this->activeTranslations($translations);

        $this->deleteInactiveTranslations($page, $active);

        foreach ($active as $locale => $translation) {
            $this->saveTranslation($page, $parent, (string) $locale, $translation);
        }
    }

    /**
     * A translation is active when it has both a title and a slug.
     *
     * @param  array<string, array<string, mixed>>  $translations
     * @return array<string, array<string, mixed>>
     */
    private function activeTranslations(array $translations): array
    {
        return array_filter(
            $translations,
            fn (array $translation): bool => filled($translation['title'] ?? null) && filled($translation['slug'] ?? null),
        );
    }

    /**
     * @param  array<string, array<string, mixed>>  $active
     */
    private function deleteInactiveTranslations(Page $page, array $active): void
    {
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
    }

    /**
     * @param  array<string, mixed>  $translation
     */
    private function saveTranslation(Page $page, ?Page $parent, string $locale, array $translation): void
    {
        $path = $this->translationPath($page, $parent, $locale, $translation);

        if ($this->translationRepository->pathIsTaken($locale, $path->value, $page->id)) {
            throw ValidationException::withMessages([
                "translations.{$locale}.slug" => __('pages.errors.path_taken', ['path' => $path->value]),
            ]);
        }

        $this->translationRepository->save($page, $locale, $this->translationAttributes($translation, $path));
    }

    /**
     * The homepage always sits at the root path. Other pages get a path under their parent.
     *
     * @param  array<string, mixed>  $translation
     */
    private function translationPath(Page $page, ?Page $parent, string $locale, array $translation): PagePath
    {
        return $page->is_homepage
            ? PagePath::homepage()
            : $this->pathUnder($parent, $locale, (string) $translation['slug']);
    }

    /**
     * @param  array<string, mixed>  $translation
     * @return array<string, mixed>
     */
    private function translationAttributes(array $translation, PagePath $path): array
    {
        return [
            'title' => $translation['title'],
            'subtitle' => $translation['subtitle'] ?? null,
            'slug' => $translation['slug'],
            'path' => $path->value,
            'seo_title' => $translation['seo_title'] ?? null,
            'seo_description' => $translation['seo_description'] ?? null,
            'body' => $this->cleanBody($translation['body'] ?? null),
        ];
    }

    /**
     * The body is HTML from the editor. It is sanitised before it is stored, so the public page renders it as is.
     */
    private function cleanBody(?string $body): ?string
    {
        return filled($body) ? app(PageHtmlSanitizer::class)->sanitize($body) : null;
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
