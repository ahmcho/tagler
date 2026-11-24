<?php

namespace App\Modules\Media\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Renders the media manager shell. The library itself loads from the JSON endpoints.
 */
class MediaLibraryController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('media/index', [
            'upload' => [
                'maxKilobytes' => (int) config('modules.media.max_upload_kilobytes'),
                'accept' => $this->acceptedMimeTypes(),
            ],
            'quotaBytes' => config('modules.media.storage_quota_bytes'),
        ]);
    }

    /**
     * @return list<string>
     */
    private function acceptedMimeTypes(): array
    {
        $mimeTypes = array_keys(config('modules.media.allowed_mime_types', []));

        if (config('modules.media.allow_svg')) {
            $mimeTypes[] = 'image/svg+xml';
        }

        return $mimeTypes;
    }
}
