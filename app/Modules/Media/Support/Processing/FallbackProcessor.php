<?php

namespace App\Modules\Media\Support\Processing;

use App\Modules\Media\Models\Media;

/**
 * Handles every file type without specific processing, for example PDF and video.
 * Those types become ready without metadata until a dedicated processor exists.
 */
class FallbackProcessor implements MediaProcessorContract
{
    public function supports(Media $media): bool
    {
        return true;
    }

    public function process(Media $media): array
    {
        return [];
    }
}
