<?php

namespace App\Modules\Pages\Events;

use App\Modules\Pages\Models\PageTranslation;

/**
 * Fired on every render, public and preview, after dynamic elements resolve.
 * `$props` are the final props sent to the view. Listeners observe them and cannot change the result.
 */
final readonly class PageRendered
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
