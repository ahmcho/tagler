<?php

use App\Modules\Translation\Controllers\TranslationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'password.confirm'])->group(function () {
    Route::get('settings/translations', [TranslationController::class, 'index'])->name('translations.index');
    Route::get('settings/translations/{group}/{key}/edit', [TranslationController::class, 'edit'])->name('translations.edit');
    Route::put('settings/translations/{group}/{key}', [TranslationController::class, 'update'])->name('translations.update');
});
