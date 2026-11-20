<?php

use App\Modules\Auth\Providers\AuthServiceProvider;
use App\Modules\Settings\Providers\SettingsServiceProvider;
use App\Modules\Translation\Providers\TranslationServiceProvider;
use App\Providers\AppServiceProvider;
use App\Providers\TypeScriptTransformerServiceProvider;

return [
    TranslationServiceProvider::class,
    AppServiceProvider::class,
    AuthServiceProvider::class,
    SettingsServiceProvider::class,
    TypeScriptTransformerServiceProvider::class,
];
