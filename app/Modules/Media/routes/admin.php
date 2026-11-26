<?php

use App\Modules\Media\Controllers\MediaController;
use App\Modules\Media\Controllers\MediaFolderController;
use App\Modules\Media\Controllers\MediaLibraryController;
use App\Modules\Media\Enums\MediaConversionEnum;
use App\Modules\Media\Models\Media;
use Illuminate\Support\Facades\Route;

Route::get('admin/media', MediaLibraryController::class)
    ->middleware(['auth', 'verified', 'can:viewAny,'.Media::class])
    ->name('media.index');

Route::get('admin/media/library', [MediaLibraryController::class, 'library'])
    ->middleware(['auth', 'verified', 'can:viewAny,'.Media::class])
    ->name('media.library');

Route::prefix('admin/media')->middleware(['auth', 'verified'])->group(function (): void {
    Route::get('stats', [MediaController::class, 'stats'])->name('media.stats');

    Route::get('folders', [MediaFolderController::class, 'index'])->name('media.folders.index');
    Route::post('folders', [MediaFolderController::class, 'store'])->name('media.folders.store');
    Route::patch('folders/{folder}', [MediaFolderController::class, 'update'])->name('media.folders.update');
    Route::delete('folders/{folder}', [MediaFolderController::class, 'destroy'])->name('media.folders.destroy');
    Route::post('folders/{folder}/move', [MediaFolderController::class, 'move'])->name('media.folders.move');

    Route::get('files', [MediaController::class, 'index'])->name('media.files.index');
    Route::post('files', [MediaController::class, 'store'])
        ->middleware('throttle:media-uploads')
        ->name('media.files.store');
    Route::get('files/{file}', [MediaController::class, 'show'])->name('media.files.show');
    Route::patch('files/{file}', [MediaController::class, 'update'])->name('media.files.update');
    Route::delete('files/{file}', [MediaController::class, 'destroy'])->name('media.files.destroy');
    Route::post('files/{file}/move', [MediaController::class, 'move'])->name('media.files.move');
    Route::post('files/{file}/visibility', [MediaController::class, 'visibility'])->name('media.files.visibility');
    Route::post('files/{file}/restore', [MediaController::class, 'restore'])
        ->withTrashed()
        ->name('media.files.restore');
    Route::post('files/{file}/purge', [MediaController::class, 'purge'])
        ->withTrashed()
        ->name('media.files.purge');
    Route::get('files/{file}/url', [MediaController::class, 'url'])->name('media.files.url');
    Route::get('files/{file}/conversions/{conversion}', [MediaController::class, 'conversion'])
        ->where('conversion', implode('|', array_column(MediaConversionEnum::cases(), 'value')))
        ->name('media.files.conversion');
    Route::get('files/{file}/download', [MediaController::class, 'download'])->name('media.files.download');
    Route::get('files/{file}/temporary', [MediaController::class, 'download'])
        ->middleware('signed')
        ->name('media.files.temporary');
    Route::get('files/{file}/references', [MediaController::class, 'references'])->name('media.files.references');
});
