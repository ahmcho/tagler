<?php

namespace App\Providers;

use App\Console\Commands\SyncFileTranslationsToDatabase;
use App\Support\Database\Loader;
use App\Support\Database\Translator;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Translation\FileLoader;
use Illuminate\Translation\TranslationServiceProvider as BaseTranslationServiceProvider;

class TranslationServiceProvider extends BaseTranslationServiceProvider
{
    public function register(): void
    {
        $this->registerLoader();

        $this->app->singleton('translator', function (Application $app) {
            $translator = new Translator(
                $app['translation.loader'],
                $app->getLocale()
            );

            $translator->setFallback($app->getFallbackLocale());

            return $translator;
        });
    }

    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                SyncFileTranslationsToDatabase::class,
            ]);
        }
    }

    protected function registerLoader(): void
    {
        $this->app->singleton('translation.loader', function (Application $app) {
            return new Loader(
                new FileLoader($app['files'], $app['path.lang']),
                ! $app->environment('local', 'testing')
            );
        });
    }
}
