<?php

namespace App\Modules\Pages\Enums;

/**
 * Publication state of a page. A page is public only when it is Published or
 * Scheduled and its publish date has passed (see `Page::isLive()`).
 */
enum PageStatusEnum: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Scheduled = 'scheduled';
}
