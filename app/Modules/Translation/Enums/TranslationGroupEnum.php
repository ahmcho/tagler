<?php

namespace App\Modules\Translation\Enums;

enum TranslationGroupEnum: string
{
    case Auth = 'auth';
    case Pagination = 'pagination';
    case Passwords = 'passwords';
    case Validation = 'validation';
    case Translations = 'translations';
}
