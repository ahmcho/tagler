<?php

namespace App\Modules\Pages\Support;

/**
 * The locales pages can be written in. The codes come from `app.supported_locales`.
 * The default locale is `app.locale`, used for the root URL `/`.
 */
final class PageLocales
{
    /**
     * @return list<string>
     */
    public function codes(): array
    {
        return array_column(config('app.supported_locales', []), 'code');
    }

    public function default(): string
    {
        return (string) config('app.locale');
    }

    public function isSupported(string $locale): bool
    {
        return in_array($locale, $this->codes(), true);
    }
}
