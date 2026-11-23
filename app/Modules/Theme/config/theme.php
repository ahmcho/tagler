<?php

return [
    /*
     * Folder that holds one directory per theme package. A theme folder name must equal its slug.
     */
    'path' => app_path('Modules/Theme/themes'),

    /*
     * The Tagler version this CMS release provides. A theme's `requires.tagler` major version must match it.
     */
    'tagler_version' => '1.0.0',

    /*
     * Settings key that stores the slug of the active theme. Read and written through the Settings module.
     */
    'active_setting' => 'active_theme',
];
