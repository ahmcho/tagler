<?php

use App\Modules\Pages\Controllers\PagePreviewController;
use App\Modules\Pages\Controllers\PublicNotFoundController;
use App\Modules\Pages\Controllers\PublicPageController;
use App\Modules\Pages\Enums\LocaleEnum;
use Illuminate\Support\Facades\Route;

$localeCodes = implode('|', LocaleEnum::codes());

Route::get('/', PublicPageController::class)->name('home');

Route::get('preview/pages/{page}/{locale}', PagePreviewController::class)
    ->where(['locale' => $localeCodes])
    ->middleware('signed')
    ->name('pages.preview.show');

Route::get('{locale}/{path?}', PublicPageController::class)
    ->where(['locale' => $localeCodes, 'path' => '.*'])
    ->name('pages.localized');

Route::fallback(PublicNotFoundController::class);
