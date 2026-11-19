<?php

namespace App\Http\Middleware;

use App\Modules\Auth\Enums\ModelStatusEnum;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Signs out a user who was deactivated while still holding a session (or a
 * remember-me cookie). The login check covers new sign-ins only.
 */
class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user !== null && $user->status !== ModelStatusEnum::Active) {
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors(['email' => __('translations.auth.inactive')]);
        }

        return $next($request);
    }
}
