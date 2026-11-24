<?php

namespace App\Modules\Media\Services;

use App\Modules\Media\Enums\MediaVisibility;
use App\Modules\Media\Models\Media;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

/**
 * The only place that builds media URLs. Controllers and resources call this service.
 */
class MediaUrlService
{
    /**
     * Permanent URL for public files. Null for private files.
     */
    public function publicUrl(Media $media): ?string
    {
        if ($media->visibility !== MediaVisibility::Public) {
            return null;
        }

        return Storage::disk($media->disk)->url($media->path);
    }

    /**
     * A URL that works for a limited time. Public files return their permanent URL.
     * Private files use the storage driver's temporary URL when it has one, and a
     * signed route to the authorized download action otherwise.
     */
    public function temporaryUrl(Media $media): string
    {
        if ($media->visibility === MediaVisibility::Public) {
            return $this->publicUrl($media);
        }

        $minutes = (int) config('modules.media.temporary_url_minutes');
        $disk = Storage::disk($media->disk);

        if ($disk->providesTemporaryUrls()) {
            return $disk->temporaryUrl($media->path, Carbon::now()->addMinutes($minutes));
        }

        return URL::temporarySignedRoute(
            'media.files.temporary',
            Carbon::now()->addMinutes($minutes),
            ['file' => $media->uuid],
        );
    }
}
