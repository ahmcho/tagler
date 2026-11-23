<?php

namespace App\Modules\Theme\Exceptions;

use RuntimeException;

/**
 * A theme folder whose manifest is missing, malformed, or not compatible with this CMS.
 */
class InvalidThemeException extends RuntimeException {}
