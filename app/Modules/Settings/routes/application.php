<?php

use App\Modules\Settings\Controllers\SettingController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware(['auth', 'verified'])->group(function () {
    Route::get('settings/application', [SettingController::class, 'index'])->name('settings.index');
    Route::put('settings/application', [SettingController::class, 'update'])->name('settings.update');
    Route::delete('settings/application/{key}/file', [SettingController::class, 'resetFile'])->name('settings.reset-file');
});
