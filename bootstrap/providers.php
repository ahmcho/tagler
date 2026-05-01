<?php

use App\Providers\AppServiceProvider;
use App\Providers\FortifyServiceProvider;
use App\Providers\TranslationServiceProvider;

return [
    TranslationServiceProvider::class,
    AppServiceProvider::class,
    FortifyServiceProvider::class,
];
