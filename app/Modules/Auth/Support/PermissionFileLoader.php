<?php

namespace App\Modules\Auth\Support;

use InvalidArgumentException;

/**
 * Reads permission files from the given directories. Each file returns a list of
 * ['name' => string, 'description' => string] arrays. A later entry with the same name replaces an earlier one.
 */
class PermissionFileLoader
{
    /**
     * @param  array<int, string>  $directories
     * @return array<int, array{name: string, description: string}>
     *
     * @throws InvalidArgumentException when a file does not return a valid permission list
     */
    public function load(array $directories): array
    {
        $permissions = [];

        foreach ($directories as $directory) {
            foreach (glob($directory.'/*.php') ?: [] as $file) {
                foreach ($this->readFile($file) as $permission) {
                    $permissions[$permission['name']] = $permission;
                }
            }
        }

        return array_values($permissions);
    }

    /**
     * The project root folder and every module's permission folder.
     *
     * @return array<int, string>
     */
    public function defaultDirectories(): array
    {
        return [
            database_path('seeders/privileges/permissions'),
            ...glob(app_path('Modules/*/Database/Seeders/privileges/permissions'), GLOB_ONLYDIR) ?: [],
        ];
    }

    /**
     * @return array<int, array{name: string, description: string}>
     *
     * @throws InvalidArgumentException
     */
    private function readFile(string $file): array
    {
        $entries = require $file;

        if (! is_array($entries)) {
            throw new InvalidArgumentException("Permission file [{$file}] must return an array.");
        }

        $permissions = [];

        foreach ($entries as $entry) {
            if (! is_array($entry) || ! is_string($entry['name'] ?? null) || $entry['name'] === '') {
                throw new InvalidArgumentException("Permission file [{$file}] has an entry without a name.");
            }

            if (! is_string($entry['description'] ?? null)) {
                throw new InvalidArgumentException("Permission [{$entry['name']}] in [{$file}] has no description.");
            }

            $permissions[] = ['name' => $entry['name'], 'description' => $entry['description']];
        }

        return $permissions;
    }
}
