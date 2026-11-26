<?php

namespace App\Modules\Media\Services;

use App\Modules\Media\Enums\MediaVisibilityEnum;
use App\Modules\Media\Models\Media;
use App\Modules\Settings\Enums\SettingKeyEnum;
use App\Modules\Settings\Services\Contracts\SettingServiceContract;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

/**
 * The only place that builds media URLs. Controllers and resources call this service.
 *
 * Public files are served by uuid routes, so the storage path never appears in a URL.
 */
class MediaUrlService
{
    public function __construct(private readonly SettingServiceContract $settings) {}

    /**
     * Permanent absolute URL for public files. Null for private files.
     */
    public function publicUrl(Media $media): ?string
    {
        if ($media->visibility !== MediaVisibilityEnum::Public) {
            return null;
        }

        return route('media.public', ['file' => $media->uuid]);
    }

    /**
     * URL of a generated conversion (for example `thumbnail`). Public files use the public
     * uuid route. Private files use the authorized route, which the browser can load with the
     * session cookie.
     */
    public function conversionUrl(Media $media, string $conversion): ?string
    {
        if (($media->metadata['conversions'][$conversion]['path'] ?? null) === null) {
            return null;
        }

        if ($media->visibility === MediaVisibilityEnum::Public) {
            return route('media.public.conversion', ['file' => $media->uuid, 'conversion' => $conversion]);
        }

        return route('media.files.conversion', ['file' => $media->uuid, 'conversion' => $conversion]);
    }

    /**
     * A URL that expires. Public files return their permanent URL. Private files use a signed
     * uuid route whose lifetime is the file's own TTL, or the global setting when the file has none.
     * The disk's own temporary URL is never used: it would show the storage path.
     */
    public function temporaryUrl(Media $media): string
    {
        if ($media->visibility === MediaVisibilityEnum::Public) {
            return $this->publicUrl($media);
        }

        return URL::temporarySignedRoute(
            'media.files.temporary',
            Carbon::now()->addMinutes($this->linkTtlMinutes($media)),
            ['file' => $media->uuid],
        );
    }

    /**
     * The file's own TTL when it has one, otherwise the global setting.
     */
    public function linkTtlMinutes(Media $media): int
    {
        return $media->link_ttl_minutes ?? $this->settings->integer(SettingKeyEnum::MediaLinkTtlMinutes, 15);
    }
}
