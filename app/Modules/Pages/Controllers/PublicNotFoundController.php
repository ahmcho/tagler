<?php

namespace App\Modules\Pages\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Pages\Enums\LocaleEnum;
use App\Modules\Pages\Resources\PublicPageResource;
use App\Modules\Pages\Services\PageComponentResolver;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * The 404 page for visitors. It uses the `public` root view. Its props have the same shape as a public page, so the
 * default theme's not-found template and the plain fallback both receive a `page`, no body and no children.
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

        $locale = (string) $request->segment(1);

        if (LocaleEnum::isSupported($locale)) {
            app()->setLocale($locale);
        }

        $locale = app()->getLocale();

        return Inertia::render(app(PageComponentResolver::class)->notFound(), [
            'page' => [
                'locale' => $locale,
                'title' => __('pages.public.not_found_title'),
                'subtitle' => null,
                'path' => '',
                'layout' => null,
                'seo_title' => null,
                'seo_description' => null,
                'canonical_url' => null,
                'og_locale' => PublicPageResource::ogLocaleFor($locale),
            ],
            'body' => null,
            'children' => [],
        ])
            ->toResponse($request)
            ->setStatusCode(404);
    }
}
