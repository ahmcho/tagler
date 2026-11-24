<?php

use App\Modules\Pages\Support\ContentElements\ButtonElement;
use App\Modules\Pages\Support\ContentElements\ChildPagesElement;
use App\Modules\Pages\Support\ContentElements\DividerElement;
use App\Modules\Pages\Support\ContentElements\HeadingElement;
use App\Modules\Pages\Support\ContentElements\HtmlElement;
use App\Modules\Pages\Support\ContentElements\MarkdownElement;
use App\Modules\Pages\Support\ContentElements\ParagraphElement;
use App\Modules\Pages\Support\ContentElements\QuoteElement;
use App\Modules\Pages\Support\ContentElements\SpacerElement;

return [
    /*
     * First path segments that a page may never use. Admin routes live under
     * /admin, and these names belong to the application and the web server.
     */
    'reserved_paths' => ['admin', 'api', 'storage', 'build', 'up', 'livewire', 'sanctum', 'broadcasting'],

    /*
     * Maximum number of segments in a page path, for example a/b/c is three.
     */
    'max_depth' => 10,

    /*
     * Section layout keys. The theme maps each key to a view or component.
     * A section with a key that is not listed here is not rendered.
     */
    'layouts' => [
        'full-width' => 'Full width',
        'centered' => 'Centered container',
        'two-columns' => 'Two columns',
    ],

    /*
     * Section background keys. The theme maps each key to colours. A section
     * without a background uses `none`.
     */
    'backgrounds' => [
        'none' => 'None',
        'light' => 'Light',
        'dark' => 'Dark',
        'primary' => 'Primary',
    ],

    /*
     * Flag country code for each locale, shown next to the language in the admin.
     */
    'locale_countries' => [
        'az' => 'AZ',
        'en' => 'GB',
        'ru' => 'RU',
    ],

    /*
     * Content element classes, one per type key. Only trusted classes listed here can run.
     */
    'elements' => [
        HeadingElement::class,
        ParagraphElement::class,
        MarkdownElement::class,
        HtmlElement::class,
        ButtonElement::class,
        SpacerElement::class,
        DividerElement::class,
        QuoteElement::class,
    ],

    /*
     * Functional components: content element classes that resolve live data on every request. Each one is
     * also a content element, so it is registered with the elements above. Only trusted classes listed here can run.
     */
    'components' => [
        ChildPagesElement::class,
    ],

    /*
     * Revisions kept for each page. Each explicit save adds one. The oldest are deleted first.
     */
    'revisions' => [
        'keep' => (int) env('PAGES_REVISIONS_KEEP', 50),
    ],

    /*
     * Public page cache. Entries are removed when a page changes, so the TTL is only a safety net.
     */
    'cache' => [
        'ttl' => (int) env('PAGES_CACHE_TTL', 3600),
    ],

    /*
     * Preview links. Each one works for the given number of minutes.
     */
    'preview' => [
        'minutes' => (int) env('PAGES_PREVIEW_MINUTES', 30),
    ],

    /*
     * Limits for one locale's content document.
     */
    'limits' => [
        'max_sections' => 200,
        'max_elements_per_section' => 100,
        'max_document_bytes' => 512 * 1024,
    ],
];
