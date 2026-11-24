<?php

namespace App\Modules\Pages\Events;

/**
 * Fired for every public page request, before the path is resolved and before
 * the cache is read. Listeners observe the request and cannot change the result.
 */
final readonly class PageResolving
{
    public function __construct(
        public string $locale,
        public string $path,
    ) {}
}
