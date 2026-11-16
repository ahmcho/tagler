<?php

namespace App\Modules\Auth\Concerns;

use Illuminate\Auth\Access\Response;

/**
 * Allows the action when the check passes, otherwise denies it with the common translated message.
 */
trait HasTranslatedDenialResponse
{
    private function check(bool $allowed): Response
    {
        return $allowed
            ? Response::allow()
            : Response::deny(message: __('translations.common.forbidden'));
    }
}
