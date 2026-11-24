<?php

namespace App\Modules\Pages\Events;

use App\Modules\Pages\Models\PageTranslation;

/**
 * Fired on every render, public and preview, before dynamic elements resolve.
 * `$props` is the cached page props. Listeners observe them and cannot change the result.
 */
final readonly class PageRendering
{
    /**
     * @param  array<string, mixed>  $props
     */
    public function __construct(
        public PageTranslation $translation,
        public array $props,
        public bool $isPreview,
    ) {}
}
