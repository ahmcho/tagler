<?php

use App\Modules\Theme\Controllers\ThemeController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware(['auth', 'verified'])->group(function (): void {
    Route::get('themes', [ThemeController::class, 'index'])
        ->middleware('can:themes.index')
        ->name('themes.index');

    Route::post('themes/{slug}/activate', [ThemeController::class, 'activate'])
        ->where('slug', '[a-z][a-z0-9-]{1,39}')
        ->middleware('can:themes.activate')
        ->name('themes.activate');
});
