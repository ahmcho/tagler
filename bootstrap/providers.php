<?php

use App\Modules\Auth\Providers\AuthServiceProvider;
use App\Providers\AppServiceProvider;
use App\Providers\TranslationServiceProvider;

return [
    TranslationServiceProvider::class,
    AppServiceProvider::class,
    AuthServiceProvider::class,
];
