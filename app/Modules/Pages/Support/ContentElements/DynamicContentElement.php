<?php

namespace App\Modules\Pages\Support\ContentElements;

use App\Modules\Pages\Support\PageRenderContext;

/**
 * A content element whose output depends on data outside the page, such as a
 * list of child pages. Its stored data is cache-safe config only: `present()`
 * never reads live data. `resolve()` runs on every request, after the page
 * cache is read, and returns extra props that are merged into the element data.
 */
interface DynamicContentElement extends ContentElement
{
    /**
     * @param  array<string, mixed>  $data  The presented config of the element.
     * @return array<string, mixed>
     */
    public function resolve(array $data, PageRenderContext $context): array;
}
