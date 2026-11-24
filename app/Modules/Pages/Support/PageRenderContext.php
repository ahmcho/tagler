<?php

namespace App\Modules\Pages\Support;

use App\Modules\Pages\Models\PageTranslation;

/**
 * What a dynamic element needs to resolve its output: the translation being shown
 * (its `page` relation must be set) and whether the request is a preview.
 */
final readonly class PageRenderContext
{
    public function __construct(
        public PageTranslation $translation,
        public bool $isPreview,
    ) {}
}
