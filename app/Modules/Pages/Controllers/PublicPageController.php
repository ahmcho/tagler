<?php

namespace App\Modules\Pages\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Pages\Enums\LocaleEnum;
use App\Modules\Pages\Resources\PublicPageResource;
use App\Modules\Pages\Services\PageChildrenResolver;
use App\Modules\Pages\Services\PageComponentResolver;
use App\Modules\Pages\Services\PageResolver;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * Serves public pages. `/` is the default-locale homepage. `/{locale}` and
 * `/{locale}/{path}` serve one locale. Routes are in routes/public.php.
 * Public responses use the plain `public` root view, which loads no admin styles.
 */
class PublicPageController extends Controller
{
    public function __invoke(
        Request $request,
        PageResolver $resolver,
        PageChildrenResolver $children,
        PageComponentResolver $components,
    ): Response {
        Inertia::setRootView('public');

        $locale = (string) ($request->route('locale') ?? LocaleEnum::default());
        $path = (string) ($request->route('path') ?? '');

        $page = $resolver->resolve($locale, $path);

        if ($page === null) {
            return PublicNotFoundController::response($request);
        }

        app()->setLocale($locale);

        $translation = $page->translationFor($locale);

        if ($translation === null) {
            return PublicNotFoundController::response($request);
        }

        $translation->setRelation('page', $page);

        return Inertia::render($components->forPage($page), [
            'page' => PublicPageResource::make($translation)->resolve(),
            'body' => $translation->body,
            'children' => $children->forTranslation($translation),
        ])->toResponse($request);
    }
}
