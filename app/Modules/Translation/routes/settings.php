<?php

use App\Modules\Translation\Controllers\TranslationController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware(['auth', 'verified'])->group(function () {
    Route::get('translations', [TranslationController::class, 'index'])->name('translations.index');
    Route::get('translations/{group}/{key}/edit', [TranslationController::class, 'edit'])->name('translations.edit');
    Route::put('translations/{group}/{key}', [TranslationController::class, 'update'])->name('translations.update');
    Route::post('translations/reset', [TranslationController::class, 'reset'])->name('translations.reset');
});
