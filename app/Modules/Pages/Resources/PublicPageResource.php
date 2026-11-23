<?php

namespace App\Modules\Pages\Resources;

use App\Modules\Pages\Enums\LocaleEnum;
use App\Modules\Pages\Models\PageTranslation;
use App\Modules\Pages\Support\PagePath;
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
            'canonical_url' => $this->canonicalUrl(),
            'og_locale' => $this->ogLocale(),
        ];
    }

    /**
     * The Open Graph locale, language and territory, for example en_GB. The territory comes from the locale country config.
     */
    private function ogLocale(): string
    {
        return self::ogLocaleFor($this->locale);
    }

    /**
     * The Open Graph locale for a locale code, for example en_GB. Also used for the not-found page.
     */
    public static function ogLocaleFor(string $locale): string
    {
        $country = config("modules.pages.locale_countries.{$locale}");

        return is_string($country) ? "{$locale}_{$country}" : $locale;
    }

    /**
     * The default-locale address of the page, built from APP_URL. Every locale points here, so there is one canonical
     * URL per page. It does not depend on the request host, because the props are cached. Null when the page has no
     * default-locale translation.
     */
    private function canonicalUrl(): ?string
    {
        $default = $this->page?->translationFor(LocaleEnum::default());

        if ($default === null) {
            return null;
        }

        $base = rtrim((string) config('app.url'), '/');

        return $default->path === PagePath::HOMEPAGE
            ? $base.'/'
            : $base.'/'.LocaleEnum::default().'/'.$default->path;
    }
}
