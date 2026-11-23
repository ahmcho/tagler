<?php

namespace Tests\Support;

use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Models\PageTranslation;

/**
 * Builds a page with one translation for tests. Pass `path` in the translation for a nested page.
 */
final class PageFixtures
{
    /**
     * @param  array<string, mixed>  $attributes  Page columns, for example `parent_id` or `is_homepage`.
     * @param  array<string, mixed>  $translation  Translation columns, for example `slug`, `path` or `locale`.
     */
    public static function create(array $attributes = [], array $translation = []): Page
    {
        $page = Page::factory()->create($attributes);

        PageTranslation::factory()->create([
            ...$translation,
            'page_id' => $page->id,
        ]);

        return $page->load('translations');
    }

    /**
     * A valid store or update payload. Each locale starts blank, and the default locale gets a title and slug.
     *
     * @param  array<string, mixed>  $fields  Page columns
     * @param  array<string, array<string, mixed>>  $translations  Locale => translation fields
     * @return array<string, mixed>
     */
    public static function payload(array $fields = [], array $translations = []): array
    {
        $default = config('app.locale');
        $locales = array_column(config('app.supported_locales'), 'code');

        $blank = array_fill_keys($locales, ['title' => null, 'subtitle' => null, 'slug' => null, 'seo_title' => null, 'seo_description' => null, 'content' => null]);
        $blank[$default] = ['title' => 'About', 'slug' => 'about'];

        foreach ($translations as $locale => $fieldsForLocale) {
            $blank[$locale] = array_merge($blank[$locale] ?? [], $fieldsForLocale);
        }

        return array_merge(['status' => 'published', 'parent_id' => null, 'translations' => $blank], $fields);
    }
}
