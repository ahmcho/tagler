<?php

namespace App\Modules\Pages\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Pages\Services\PageComponentResolver;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * A plain 404 for visitors. It uses the `public` root view, so no admin styles load.
 */
class PublicNotFoundController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return self::response($request);
    }

    public static function response(Request $request): Response
    {
        Inertia::setRootView('public');

        return Inertia::render(app(PageComponentResolver::class)->notFound())
            ->toResponse($request)
            ->setStatusCode(404);
    }
}
