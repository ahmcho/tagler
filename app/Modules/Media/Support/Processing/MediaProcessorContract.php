<?php

namespace App\Modules\Media\Support\Processing;

use App\Modules\Media\Models\Media;

interface MediaProcessorContract
{
    public function supports(Media $media): bool;

    /**
     * Reads the stored file and returns metadata to merge into the record.
     * It must not change the original file.
     *
     * @return array<string, mixed>
     */
    public function process(Media $media): array;
}
