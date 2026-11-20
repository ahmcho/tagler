<?php

namespace App\Modules\Settings\Enums;

/**
 * How a stored input value is cast and validated. Shared by settings and other input-driven pages.
 */
enum InputValueTypeEnum: int
{
    case String = 0;
    case Integer = 1;
    case Boolean = 2;
    case Json = 3;
    case File = 4;
}
