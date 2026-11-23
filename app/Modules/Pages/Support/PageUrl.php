<?php

namespace App\Modules\Pages\Support;

/**
 * Decides which link targets a page may contain. Relative paths, anchors, http,
 * https and mailto are allowed. Every other scheme, such as javascript:, is refused.
 */
final class PageUrl
{
    public static function isSafe(string $url): bool
    {
        $url = trim($url);

        if ($url === '' || preg_match('/[\x00-\x20\x7F]/', $url) === 1) {
            return false;
        }

        if (str_starts_with($url, '//')) {
            return false;
        }

        if (str_starts_with($url, '/') || str_starts_with($url, '#')) {
            return true;
        }

        $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));

        return in_array($scheme, ['http', 'https', 'mailto'], true);
    }
}
