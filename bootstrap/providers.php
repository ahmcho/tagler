<?php

use App\Modules\Auth\Providers\AuthServiceProvider;
use App\Modules\Media\Providers\MediaServiceProvider;
use App\Modules\Pages\Providers\PagesServiceProvider;
use App\Modules\Settings\Providers\SettingsServiceProvider;
use App\Modules\Theme\Providers\ThemeServiceProvider;
use App\Modules\Translation\Providers\TranslationServiceProvider;
use App\Providers\AppServiceProvider;
use App\Providers\TypeScriptTransformerServiceProvider;

return [
    TranslationServiceProvider::class,
    AppServiceProvider::class,
    AuthServiceProvider::class,
    SettingsServiceProvider::class,
    MediaServiceProvider::class,
    PagesServiceProvider::class,
    ThemeServiceProvider::class,
    TypeScriptTransformerServiceProvider::class,
];
