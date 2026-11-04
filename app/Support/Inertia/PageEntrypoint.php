<?php

declare(strict_types=1);

namespace App\Support\Inertia;

use RuntimeException;

class PageEntrypoint
{
    /**
     * Returns the Vite entry path (relative to the project root) of an Inertia page.
     * Pages live in resources/js/pages or resources/js/modules/{module}/pages.
     *
     * @param  string  $component  The Inertia component name, e.g. "auth/login"
     *
     * @throws RuntimeException when no page or more than one page matches
     */
    public static function for(string $component): string
    {
        $matches = [
            ...glob(resource_path("js/pages/{$component}.tsx")),
            ...glob(resource_path("js/modules/*/pages/{$component}.tsx")),
        ];

        if (count($matches) !== 1) {
            throw new RuntimeException(sprintf(
                'Page "%s" matched %d files. Each page name must be unique.',
                $component,
                count($matches),
            ));
        }

        return str_replace(base_path().DIRECTORY_SEPARATOR, '', $matches[0]);
    }
}
