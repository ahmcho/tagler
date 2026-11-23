<?php

use App\Modules\Pages\Controllers\PublicNotFoundController;
use App\Modules\Pages\Controllers\PublicPageController;
use App\Modules\Pages\Support\PageLocales;
use Illuminate\Support\Facades\Route;

$localeCodes = implode('|', app(PageLocales::class)->codes());

Route::get('/', PublicPageController::class)->name('home');

Route::get('{locale}/{path?}', PublicPageController::class)
    ->where(['locale' => $localeCodes, 'path' => '.*'])
    ->name('pages.localized');

Route::fallback(PublicNotFoundController::class);
