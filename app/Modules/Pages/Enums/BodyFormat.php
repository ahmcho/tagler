<?php

namespace App\Modules\Pages\Enums;

/**
 * How a translation's body is written. Html is sanitised on save. Markdown is stored as written
 * and rendered to HTML when the page is shown.
 */
enum BodyFormat: string
{
    case Html = 'html';
    case Markdown = 'markdown';
}
