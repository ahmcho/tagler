<?php

namespace App\Modules\Media\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Media\Enums\MediaVisibilityEnum;
use App\Modules\Media\Models\Media;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/**
 * Serves public files by uuid, so the storage path never appears in a URL. Private files are never
 * served here: they need a signed link or an authorized admin route.
 */
class MediaPublicController extends Controller
{
    public function show(Media $file): HttpResponse
    {
        abort_unless($file->visibility === MediaVisibilityEnum::Public, Response::HTTP_NOT_FOUND);

        return Storage::disk($file->disk)->response($file->path, $file->original_name, [
            'Content-Type' => $file->mime_type,
            'Cache-Control' => 'public, max-age=3600',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Security-Policy' => "default-src 'none'; sandbox",
        ], 'inline');
    }

    public function conversion(Media $file, string $conversion): HttpResponse
    {
        abort_unless($file->visibility === MediaVisibilityEnum::Public, Response::HTTP_NOT_FOUND);

        $data = $file->metadata['conversions'][$conversion] ?? null;

        abort_if($data === null, Response::HTTP_NOT_FOUND);

        return Storage::disk($file->disk)->response($data['path'], null, [
            'Content-Type' => $data['mime_type'],
            'Cache-Control' => 'public, max-age=3600',
            'X-Content-Type-Options' => 'nosniff',
        ], 'inline');
    }
}
