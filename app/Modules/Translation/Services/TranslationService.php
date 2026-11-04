<?php

namespace App\Modules\Translation\Services;

use App\Modules\Translation\Repositories\Contracts\TranslationRepositoryContract;
use App\Modules\Translation\Services\Contracts\TranslationServiceContract;
use Crud\Services\BaseCrudService;
use Illuminate\Support\Facades\DB;

class TranslationService extends BaseCrudService implements TranslationServiceContract
{
    public function __construct(TranslationRepositoryContract $repository)
    {
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
