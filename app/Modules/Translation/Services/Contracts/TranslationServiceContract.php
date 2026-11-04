<?php

namespace App\Modules\Translation\Services\Contracts;

use Crud\Services\Contracts\BaseCrudServiceContract;

interface TranslationServiceContract extends BaseCrudServiceContract
{
    /**
     * Per-locale value map for one group+key pair. Locales without a row are null.
     *
     * @return array<string, string|null>
     */
    public function getTranslationsForKey(string $group, string $key): array;

    /**
     * @param  array<string, string|null>  $valuesByLocale
     */
    public function saveTranslationsForKey(string $group, string $key, array $valuesByLocale): void;

    /**
     * @return array<int, string>
     */
    public function getDistinctTables(string $lang): array;
}
