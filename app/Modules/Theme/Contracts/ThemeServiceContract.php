<?php

namespace App\Modules\Theme\Contracts;

use App\Modules\Theme\Support\ThemeManifest;

interface ThemeServiceContract
{
    /**
     * The active theme, or null when none is set or the stored theme is missing or invalid.
     */
    public function activeTheme(): ?ThemeManifest;

    /**
     * Makes a theme the active one. Throws a validation error for an unknown slug. Clears the public page cache.
     */
    public function activate(string $slug): ThemeManifest;

    /**
     * The frontend component name for a template key. A theme component is `theme/{slug}/{key}` when the active
     * theme provides the key. Otherwise the fallback is returned.
     */
    public function componentFor(string $templateKey, string $fallback): string;
}
