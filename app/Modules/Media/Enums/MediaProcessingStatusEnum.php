<?php

namespace App\Modules\Media\Enums;

enum MediaProcessingStatusEnum: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Ready = 'ready';
    case Failed = 'failed';

    /**
     * Returns the badge color for this processing status.
     */
    public function color(): string
    {
        return match ($this) {
            self::Pending => 'gray',
            self::Processing => 'warning',
            self::Ready => 'success',
            self::Failed => 'error',
        };
    }
}
