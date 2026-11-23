<?php

namespace App\Modules\Pages\Resources;

use App\Modules\Pages\Models\PageTranslation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * What a visitor may see for one locale. The `page` relation must be set to read the layout.
 *
 * @mixin PageTranslation
 */
class PublicPageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'locale' => $this->locale,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'path' => $this->path,
            'layout' => $this->page?->layout,
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
        ];
    }
}
