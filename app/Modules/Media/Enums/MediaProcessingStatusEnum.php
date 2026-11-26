<?php

namespace App\Modules\Media\Enums;

enum MediaProcessingStatusEnum: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Ready = 'ready';
    case Failed = 'failed';
}
