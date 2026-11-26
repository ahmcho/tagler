<?php

namespace App\Modules\Media\Jobs;

use App\Modules\Media\Enums\MediaProcessingStatusEnum;
use App\Modules\Media\Repositories\Contracts\MediaRepositoryContract;
use App\Modules\Media\Services\MediaProcessingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Idempotent: a file that is already ready, or was trashed, is skipped.
 */
class ProcessMedia implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [30, 120, 600];

    public function __construct(
        public readonly int $mediaId,
    ) {}

    public function handle(MediaRepositoryContract $repository, MediaProcessingService $service): void
    {
        $media = $repository->findIncludingTrashed($this->mediaId);

        if ($media === null || $media->trashed() || $media->processing_status === MediaProcessingStatusEnum::Ready) {
            return;
        }

        $service->process($media);
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Media processing failed.', ['media_id' => $this->mediaId, 'error' => $exception->getMessage()]);

        $repository = app(MediaRepositoryContract::class);
        $media = $repository->findIncludingTrashed($this->mediaId);

        if ($media !== null) {
            app(MediaProcessingService::class)->markFailed($media);
        }
    }
}
