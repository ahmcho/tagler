<?php

namespace App\Modules\Auth\Support;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LogoutResponse;

/**
 * Sends a user who logged out to the admin login page.
 */
class AdminLogoutResponse implements LogoutResponse
{
    public function toResponse($request): RedirectResponse
    {
        return redirect()->route('login');
    }
}
