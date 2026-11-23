<?php

namespace Tests\Support;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * Writes theme packages into a temporary folder for tests. The manifest is written as given, so tests can break it on purpose.
 */
final class ThemeFixtures
{
    /**
     * A new empty theme root, to be passed to `modules.theme.path`. Call `remove()` when the test ends.
     */
    public static function root(): string
    {
        $root = storage_path('framework/testing/themes-'.Str::lower(Str::random(10)));

        File::makeDirectory($root, 0755, true);

        return $root;
    }

    /**
     * @return array<string, mixed>
     */
    public static function manifest(string $slug, array $overrides = []): array
    {
        return array_replace([
            'schema_version' => 1,
            'name' => 'Theme '.$slug,
            'slug' => $slug,
            'version' => '1.0.0',
            'requires' => ['tagler' => '^1.0', 'php' => '^8.4'],
            'frontend' => ['framework' => 'react', 'entry' => 'resources/js/index.tsx'],
            'templates' => ['home' => 'home'],
        ], $overrides);
    }

    /**
     * Writes one theme folder. Pass null as the manifest to leave out theme.json.
     *
     * @param  array<string, mixed>|null  $manifest
     */
    public static function write(string $root, string $folder, ?array $manifest, bool $entry = true, bool $templates = true): void
    {
        $path = $root.'/'.$folder;

        File::makeDirectory($path.'/resources/js/templates', 0755, true);

        if ($manifest !== null) {
            File::put($path.'/theme.json', json_encode($manifest, JSON_PRETTY_PRINT));
        }

        if ($entry) {
            File::put($path.'/resources/js/index.tsx', "export const templates = {};\n");
        }

        if ($templates) {
            foreach (array_values((array) ($manifest['templates'] ?? [])) as $file) {
                File::put($path.'/resources/js/templates/'.$file.'.tsx', "export default function T() { return null; }\n");
            }
        }
    }

    /**
     * Copies the bundled default theme into a root, so a test root can hold it next to other themes.
     */
    public static function copyDefault(string $root): void
    {
        File::copyDirectory(app_path('Modules/Theme/themes/default'), $root.'/default');
    }

    public static function remove(string $root): void
    {
        File::deleteDirectory($root);
    }
}
