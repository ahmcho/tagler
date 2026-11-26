<?php

use App\Modules\Media\Controllers\MediaPublicController;
use App\Modules\Media\Enums\MediaConversionEnum;
use Illuminate\Support\Facades\Route;

Route::get('media/{file}', [MediaPublicController::class, 'show'])->name('media.public');

Route::get('media/{file}/conversions/{conversion}', [MediaPublicController::class, 'conversion'])
    ->where('conversion', implode('|', array_column(MediaConversionEnum::cases(), 'value')))
    ->name('media.public.conversion');
