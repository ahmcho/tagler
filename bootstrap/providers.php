<?php

use App\Modules\Auth\Providers\AuthServiceProvider;
use App\Modules\Translation\Providers\TranslationServiceProvider;
use App\Providers\AppServiceProvider;

return [
    TranslationServiceProvider::class,
    AppServiceProvider::class,
    AuthServiceProvider::class,
];
