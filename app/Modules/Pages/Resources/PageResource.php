<?php

namespace App\Modules\Pages\Resources;

use App\Modules\Pages\Enums\LocaleEnum;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Support\PagePath;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

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
        $isLive = $this->isLive(Carbon::now());

        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'title' => $defaultTranslation?->title,
            'path' => $defaultTranslation?->path,
            'public_url' => $defaultTranslation === null ? null : $this->publicUrl($defaultTranslation->path),
            'status' => $this->status->value,
            'is_homepage' => $this->is_homepage,
            'is_live' => $isLive,
            'locales' => $this->translations->pluck('locale')->values(),
            'layout' => $this->layout,
            'published_at' => $this->published_at?->format('Y-m-d H:i'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i'),
            'can' => [
                'update' => $request->user()?->can('update', $this->resource) ?? false,
                'delete' => $request->user()?->can('delete', $this->resource) ?? false,
                'publish' => $request->user()?->can('publish', $this->resource) ?? false,
                'setHomepage' => ($request->user()?->can('setHomepage', $this->resource) ?? false) && $isLive,
            ],
        ];
    }

    /**
     * The URL a visitor uses for this page in the default locale. The homepage has no path segment.
     */
    private function publicUrl(string $path): string
    {
        $locale = LocaleEnum::default();

        return $path === PagePath::HOMEPAGE ? "/{$locale}" : "/{$locale}/{$path}";
    }
}
