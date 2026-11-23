<?php

namespace App\Modules\Theme\Contracts;

use App\Modules\Theme\Support\ThemeManifest;

interface ThemeRegistryContract
{
    /**
     * Every valid theme on disk, keyed by slug. Invalid themes are skipped and logged.
     *
     * @return array<string, ThemeManifest>
     */
    public function all(): array;

    public function find(string $slug): ?ThemeManifest;

    /**
     * Drops the cached scan. Call it after a theme folder changes.
     */
    public function forget(): void;
}
