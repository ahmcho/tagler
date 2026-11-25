<?php

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
     * Flag country code for each locale, shown next to the language in the admin.
     */
    'locale_countries' => [
        'az' => 'AZ',
        'en' => 'GB',
        'ru' => 'RU',
    ],

    /*
     * Child pages listed under a page, sorted by title.
     */
    'children' => [
        'limit' => 20,
    ],

    /*
     * Revisions kept for each page. Each explicit save adds one. The oldest are deleted first.
     */
    'revisions' => [
        'keep' => (int) env('PAGES_REVISIONS_KEEP', 50),
    ],

    /*
     * Preview links. Each one works for the given number of minutes.
     */
    'preview' => [
        'minutes' => (int) env('PAGES_PREVIEW_MINUTES', 30),
    ],
];
