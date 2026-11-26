<?php

namespace App\Modules\Media\Services;

use App\Modules\Media\Enums\MediaProcessingStatusEnum;
use App\Modules\Media\Models\Media;
use App\Modules\Media\Repositories\Contracts\MediaRepositoryContract;
use App\Modules\Media\Support\Processing\MediaProcessorContract;

class MediaProcessingService
{
    public function __construct(
        private readonly MediaRepositoryContract $repository,
    ) {}

    /**
     * Runs the first processor that supports the file. The original file is never changed.
     */
    public function process(Media $media): void
    {
        $this->repository->updateSystemFields($media, [
            'processing_status' => MediaProcessingStatusEnum::Processing,
            'processing_error' => null,
        ]);

        $metadata = $this->processorFor($media)->process($media);

        $this->repository->updateSystemFields($media, [
            'processing_status' => MediaProcessingStatusEnum::Ready,
            'metadata' => array_merge($media->metadata ?? [], $metadata),
        ]);
    }

    /**
     * Records a failure with a generic message. Paths and driver errors stay in the log.
     */
    public function markFailed(Media $media): void
    {
        $this->repository->updateSystemFields($media, [
            'processing_status' => MediaProcessingStatusEnum::Failed,
            'processing_error' => 'Processing failed. Try again later.',
        ]);
    }

    private function processorFor(Media $media): MediaProcessorContract
    {
        foreach (config('modules.media.processors', []) as $class) {
            $processor = app($class);

            if ($processor->supports($media)) {
                return $processor;
            }
        }

        throw new \LogicException('No media processor supports this file.');
    }
}
