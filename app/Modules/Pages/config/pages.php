<?php

use App\Modules\Pages\Support\ContentElements\ButtonElement;
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
     * Limits for one locale's content document.
     */
    'limits' => [
        'max_sections' => 200,
        'max_elements_per_section' => 100,
        'max_document_bytes' => 512 * 1024,
    ],
];
