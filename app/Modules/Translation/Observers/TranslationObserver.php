<?php

namespace App\Modules\Translation\Observers;

use App\Modules\Translation\Models\Translation;
use App\Modules\Translation\Repositories\Contracts\TranslationRepositoryContract;
use App\Modules\Translation\Support\CachingTranslationLoader;

class TranslationObserver
{
    public function __construct(private readonly TranslationRepositoryContract $repository) {}

    public function saving(Translation $translation): void
    {
        $translation->table = $this->repository->findTableFor(group: $translation->group, key: $translation->key);
    }

    public function saved(Translation $translation): void
    {
        $this->forgetCache($translation);
    }

    public function deleted(Translation $translation): void
    {
        $this->forgetCache($translation);
    }

    private function forgetCache(Translation $translation): void
    {
        $loader = app('translator')->getLoader();

        if ($loader instanceof CachingTranslationLoader) {
            $loader->forgetGroup(locale: $translation->lang, group: $translation->group);
        }
    }
}
