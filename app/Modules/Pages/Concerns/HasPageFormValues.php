<?php

namespace App\Modules\Pages\Concerns;

use App\Modules\Pages\Enums\LocaleEnum;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Support\ContentElementRegistry;
use App\Modules\Pages\Support\ContentElements\ContentElement;
use App\Modules\Pages\Support\PageContentDocument;
use Illuminate\Support\Carbon;

/**
 * Builds the form values and the editor props for the page form.
 */
trait HasPageFormValues
{
    /**
     * The form values of a saved page.
     *
     * @return array{parent_id: int|null, status: string, publish_date: string|null, publish_time: string|null, layout: string, theme_layout: bool, translations: array<string, array<string, mixed>|null>}
     */
    private function pageValues(?Page $page): array
    {
        return [
            'parent_id' => $page?->parent_id,
            'status' => $page?->status->value ?? 'draft',
            'publish_date' => $page?->publish_date?->format('Y-m-d'),
            'publish_time' => $page?->publish_time,
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
     * @return array{parent_id: int|null, status: string, publish_date: string|null, publish_time: string|null, layout: string, theme_layout: bool, translations: array<string, array<string, mixed>|null>}
     */
    private function snapshotValues(array $snapshot): array
    {
        [$publishDate, $publishTime] = $this->publishPartsOf($snapshot);

        return [
            'parent_id' => $snapshot['parent_id'] ?? null,
            'status' => (string) ($snapshot['status'] ?? 'draft'),
            'publish_date' => $publishDate,
            'publish_time' => $publishTime,
            'layout' => (string) ($snapshot['layout'] ?? ''),
            'theme_layout' => (bool) ($snapshot['theme_layout'] ?? true),
            'translations' => $snapshot['translations'] ?? [],
        ];
    }

    /**
     * Revisions saved before the date and time split hold `published_at` instead.
     *
     * @param  array<string, mixed>  $snapshot
     * @return array{0: string|null, 1: string|null}
     */
    private function publishPartsOf(array $snapshot): array
    {
        if (array_key_exists('publish_date', $snapshot)) {
            return [$snapshot['publish_date'], $snapshot['publish_time'] ?? null];
        }

        if (! isset($snapshot['published_at'])) {
            return [null, null];
        }

        $publishAt = Carbon::parse($snapshot['published_at']);

        return [$publishAt->toDateString(), $publishAt->format('H:i')];
    }

    /**
     * The form model. Every supported locale gets an entry, blank when the page has no translation there.
     *
     * @param  array{parent_id: int|null, status: string, publish_date: string|null, publish_time: string|null, layout: string, theme_layout: bool, translations: array<string, array<string, mixed>|null>}  $values
     * @return array<string, mixed>
     */
    private function formModel(?Page $page, array $values): array
    {
        $translations = [];

        foreach (LocaleEnum::codes() as $locale) {
            $translations[$locale] = $this->formTranslation($values['translations'][$locale] ?? null);
        }

        return [
            'id' => $page?->id,
            'parent_id' => $values['parent_id'],
            'status' => $values['status'],
            'publish_date' => $values['publish_date'],
            'publish_time' => $values['publish_time'],
            'layout' => $values['layout'],
            'theme_layout' => $values['theme_layout'],
            'translations' => $translations,
        ];
    }

    /**
     * One locale's form fields. A field the translation does not hold gets its blank value.
     *
     * @param  array<string, mixed>|null  $translation
     * @return array<string, mixed>
     */
    private function formTranslation(?array $translation): array
    {
        $fields = [];

        foreach ($this->blankTranslationFields() as $field => $blankValue) {
            $fields[$field] = $translation[$field] ?? $blankValue;
        }

        return $fields;
    }

    /**
     * The form field names of a translation, each with the value shown when the page has none.
     *
     * @return array<string, mixed>
     */
    private function blankTranslationFields(): array
    {
        return [
            'title' => '',
            'subtitle' => '',
            'slug' => '',
            'seo_title' => '',
            'seo_description' => '',
            'content' => PageContentDocument::empty(),
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
