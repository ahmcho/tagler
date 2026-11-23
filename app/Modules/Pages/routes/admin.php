<?php

use App\Modules\Pages\Controllers\PageController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware(['auth', 'verified'])->group(function () {
    Route::resource('pages', PageController::class)
        ->names('pages')
        ->parameters(['pages' => 'page'])
        ->except(['show']);

    Route::post('pages/{page}/publish', [PageController::class, 'publish'])->name('pages.publish');
    Route::post('pages/{page}/unpublish', [PageController::class, 'unpublish'])->name('pages.unpublish');
    Route::post('pages/{page}/homepage', [PageController::class, 'setHomepage'])->name('pages.homepage');
});
