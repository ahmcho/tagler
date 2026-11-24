<?php

namespace App\Modules\Pages\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Services\PageComponentResolver;
use App\Modules\Pages\Services\PageRenderer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/**
 * Shows the saved version of a page, whatever its status and publish time. The signed link on the route
 * is the only access check. The response is never indexed and never cached.
 */
class PagePreviewController extends Controller
{
    public function __invoke(Request $request, Page $page, string $locale, PageRenderer $renderer, PageComponentResolver $components): HttpResponse
    {
        $page->load('translations');

        $translation = $page->translationFor($locale);

        abort_if($translation === null, HttpResponse::HTTP_NOT_FOUND);

        app()->setLocale($locale);

        $translation->setRelation('page', $page);

        Inertia::setRootView('public');

        $props = $renderer->finalize($translation, $renderer->props($translation), true);

        $response = Inertia::render($components->forPage($page), $props)->toResponse($request);

        $response->headers->set('X-Robots-Tag', 'noindex, nofollow');
        $response->headers->set('Cache-Control', 'no-store, private');

        return $response;
    }
}
