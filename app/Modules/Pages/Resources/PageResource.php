<?php

namespace App\Modules\Pages\Resources;

use App\Modules\Pages\Enums\LocaleEnum;
use App\Modules\Pages\Models\Page;
use App\Modules\Settings\Support\LocalDateFormatter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin list row. The title and path come from the default locale. `locales` lists every locale the page has.
 *
 * @mixin Page
 */
class PageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $defaultTranslation = $this->translationFor(LocaleEnum::default());
        $isLive = $this->isLive(LocalDateFormatter::now());

        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'title' => $defaultTranslation?->title,
            'path' => $defaultTranslation?->path,
            'public_url' => $defaultTranslation?->publicUrl(),
            'status' => $this->status,
            'is_homepage' => $this->is_homepage,
            'is_live' => $isLive,
            'locales' => $this->translations->pluck('locale')->values(),
            'layout' => $this->layout,
            'theme_layout' => $this->theme_layout,
            'publish_date' => $this->publish_date?->format('Y-m-d'),
            'publish_time' => $this->publish_time,
            'updated_at' => $this->updated_at?->format('Y-m-d H:i'),
            'can' => [
                'update' => $request->user()?->can('update', $this->resource) ?? false,
                'delete' => $request->user()?->can('delete', $this->resource) ?? false,
                'publish' => $request->user()?->can('publish', $this->resource) ?? false,
                'setHomepage' => ($request->user()?->can('setHomepage', $this->resource) ?? false) && $isLive,
            ],
        ];
    }
}
