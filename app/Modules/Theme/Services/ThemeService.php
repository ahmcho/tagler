<?php

namespace App\Modules\Theme\Services;

use App\Modules\Pages\Support\PublicPageCache;
use App\Modules\Settings\Services\Contracts\SettingServiceContract;
use App\Modules\Theme\Contracts\ThemeRegistryContract;
use App\Modules\Theme\Contracts\ThemeServiceContract;
use App\Modules\Theme\Support\ThemeManifest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * The active theme is one value in the Settings table, under the key in config `modules.theme.active_setting`.
 * It is the only source of truth for which theme serves the site.
 */
class ThemeService implements ThemeServiceContract
{
    public function __construct(
        private readonly ThemeRegistryContract $registry,
        private readonly SettingServiceContract $settings,
        private readonly PublicPageCache $publicPageCache,
    ) {}

    public function activeTheme(): ?ThemeManifest
    {
        $slug = $this->settings->string((string) config('modules.theme.active_setting'));

        if ($slug === '') {
            return null;
        }

        $theme = $this->registry->find($slug);

        if ($theme === null) {
            Log::warning('The active theme is missing or invalid. The plain views are used.', ['slug' => $slug]);
        }

        return $theme;
    }

    public function activate(string $slug): ThemeManifest
    {
        $theme = $this->registry->find($slug);

        if ($theme === null) {
            throw ValidationException::withMessages([
                'slug' => __('theme.errors.unknown_theme', ['slug' => $slug]),
            ]);
        }

        DB::transaction(fn () => $this->settings->setString((string) config('modules.theme.active_setting'), $theme->slug));

        $this->publicPageCache->flushAll();

        return $theme;
    }

    public function componentFor(string $templateKey, string $fallback): string
    {
        $theme = $this->activeTheme();

        if ($theme === null || ! $theme->provides($templateKey)) {
            return $fallback;
        }

        return "theme/{$theme->slug}/{$templateKey}";
    }
}
