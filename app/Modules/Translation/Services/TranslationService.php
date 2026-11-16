<?php

namespace App\Modules\Translation\Services;

use App\Modules\Translation\Models\Translation;
use App\Modules\Translation\Repositories\Contracts\TranslationRepositoryContract;
use App\Modules\Translation\Services\Contracts\TranslationServiceContract;
use App\Modules\Translation\Support\FileTranslations;
use Crud\Services\BaseCrudService;
use Illuminate\Support\Facades\DB;

class TranslationService extends BaseCrudService implements TranslationServiceContract
{
    public function __construct(
        TranslationRepositoryContract $repository,
        private readonly FileTranslations $fileTranslations,
    ) {
        parent::__construct($repository);
    }

    public function getTranslationsForKey(string $group, string $key): array
    {
        $rows = $this->repository->findAllLocalesFor(group: $group, key: $key);

        $values = [];

        foreach (config('app.supported_locales') as $locale) {
            $values[$locale['code']] = $rows->firstWhere('lang', $locale['code'])?->value;
        }

        return $values;
    }

    public function getDistinctTables(string $lang): array
    {
        return $this->repository->findDistinctTables(lang: $lang);
    }

    public function resetToFileDefaults(array $ids): array
    {
        $pairs = $this->repository->findByIds(ids: $ids)
            ->map(fn (Translation $translation): array => ['group' => $translation->group, 'key' => $translation->key])
            ->unique(fn (array $pair): string => $pair['group'].'|'.$pair['key']);

        $counts = ['reset' => 0, 'skipped' => 0];

        DB::transaction(function () use ($pairs, &$counts): void {
            foreach ($pairs as $pair) {
                $localesReset = 0;

                foreach (config('app.supported_locales') as $locale) {
                    $code = $locale['code'];
                    $fileValue = $this->fileTranslations->defaultFor(locale: $code, group: $pair['group'], key: $pair['key']);

                    if ($fileValue === null) {
                        continue;
                    }

                    $this->repository->updateOrCreate(
                        attributes: ['lang' => $code, 'group' => $pair['group'], 'key' => $pair['key']],
                        payload: ['value' => $fileValue],
                    );

                    $localesReset++;
                }

                $counts[$localesReset > 0 ? 'reset' : 'skipped']++;
            }
        });

        return $counts;
    }

    public function saveTranslationsForKey(string $group, string $key, array $valuesByLocale): void
    {
        DB::transaction(function () use ($group, $key, $valuesByLocale): void {
            foreach (config('app.supported_locales') as $locale) {
                $code = $locale['code'];

                if (! array_key_exists($code, $valuesByLocale)) {
                    continue;
                }

                $this->repository->updateOrCreate(
                    attributes: ['lang' => $code, 'group' => $group, 'key' => $key],
                    payload: ['value' => $valuesByLocale[$code]],
                );
            }
        });
    }
}
