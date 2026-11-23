<?php

namespace App\Modules\Theme\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Theme\Contracts\ThemeRegistryContract;
use App\Modules\Theme\Contracts\ThemeServiceContract;
use App\Modules\Theme\Support\ThemeManifest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ThemeController extends Controller
{
    public function __construct(
        private readonly ThemeRegistryContract $registry,
        private readonly ThemeServiceContract $themes,
    ) {}

    public function index(): Response
    {
        $active = $this->themes->activeTheme();

        return Inertia::render('themes/index', [
            'themes' => collect($this->registry->all())
                ->map(fn (ThemeManifest $theme): array => [
                    'slug' => $theme->slug,
                    'name' => $theme->name,
                    'version' => $theme->version,
                    'description' => $theme->description,
                    'author' => $theme->author,
                    'templates' => array_keys($theme->templates),
                    'active' => $active?->slug === $theme->slug,
                ])
                ->values()
                ->all(),
            'status' => session('status'),
        ]);
    }

    public function activate(string $slug): RedirectResponse
    {
        $theme = $this->themes->activate($slug);

        return redirect()->route('themes.index')->with('status', __('theme.messages.activated', ['name' => $theme->name]));
    }
}
