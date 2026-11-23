<?php

namespace App\Modules\Pages\Services;

use App\Modules\Pages\Models\PageTranslation;
use App\Modules\Pages\Resources\PublicPageResource;
use App\Modules\Pages\Support\ContentElementRegistry;
use App\Modules\Pages\Support\PageContentDocument;
use Illuminate\Support\Facades\Log;

/**
 * Turns a translation's content document into the section props the public
 * view renders. Disabled sections, unknown layouts and unknown element types
 * are skipped. A skipped item is logged and never breaks the page.
 */
class PageRenderer
{
    public function __construct(private readonly ContentElementRegistry $registry) {}

    /**
     * The props of the public page view: the page header data and the rendered sections.
     * The translation's `page` relation must be loaded.
     *
     * @return array{page: array<string, mixed>, sections: list<array<string, mixed>>}
     */
    public function props(PageTranslation $translation): array
    {
        return [
            'page' => PublicPageResource::make($translation)->resolve(),
            'sections' => $this->sections($translation),
        ];
    }

    /**
     * @return list<array{id: string, layout: string, settings: array<string, mixed>, elements: list<array{id: string, type: string, data: array<string, mixed>}>}>
     */
    public function sections(PageTranslation $translation): array
    {
        $document = $translation->content ?? PageContentDocument::empty();
        $layouts = config('modules.pages.layouts', []);
        $sections = [];

        foreach ($document['sections'] ?? [] as $section) {
            if (($section['enabled'] ?? true) !== true) {
                continue;
            }

            $layout = (string) ($section['layout'] ?? '');

            if (! array_key_exists($layout, $layouts)) {
                Log::warning('Page section skipped: unknown layout.', ['translation_id' => $translation->id, 'layout' => $layout]);

                continue;
            }

            $sections[] = [
                'id' => (string) ($section['id'] ?? ''),
                'layout' => $layout,
                'settings' => is_array($section['settings'] ?? null) ? $section['settings'] : [],
                'elements' => $this->elements($translation, $section['elements'] ?? []),
            ];
        }

        return $sections;
    }

    /**
     * @param  array<int, mixed>  $elements
     * @return list<array{id: string, type: string, data: array<string, mixed>}>
     */
    private function elements(PageTranslation $translation, array $elements): array
    {
        $rendered = [];

        foreach ($elements as $element) {
            $type = (string) ($element['type'] ?? '');
            $handler = $this->registry->resolve($type);

            if ($handler === null) {
                Log::info('Page element skipped: unknown type.', ['translation_id' => $translation->id, 'type' => $type]);

                continue;
            }

            $rendered[] = [
                'id' => (string) ($element['id'] ?? ''),
                'type' => $type,
                'data' => $handler->present(is_array($element['data'] ?? null) ? $element['data'] : []),
            ];
        }

        return $rendered;
    }
}
