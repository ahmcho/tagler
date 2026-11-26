<?php

namespace App\Modules\Translation\Providers;

use App\Modules\Auth\Support\AbilityRegistry;
use App\Modules\Translation\Console\Commands\SyncFileTranslationsToDatabase;
use App\Modules\Translation\Models\Translation;
use App\Modules\Translation\Observers\TranslationObserver;
use App\Modules\Translation\Policies\TranslationPolicy;
use App\Modules\Translation\Repositories\Contracts\TranslationRepositoryContract;
use App\Modules\Translation\Repositories\TranslationRepository;
use App\Modules\Translation\Services\Contracts\TranslationServiceContract;
use App\Modules\Translation\Services\TranslationService;
use App\Modules\Translation\Support\CachingTranslationLoader;
use App\Modules\Translation\Support\DatabaseTranslationLoader;
use Crud\Providers\ModuleServiceProvider;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Gate;

class TranslationServiceProvider extends ModuleServiceProvider
{
    /**
     * @var array<class-string, class-string>
     */
    protected array $repositories = [
        TranslationRepositoryContract::class => TranslationRepository::class,
    ];

    /**
     * @var array<class-string, class-string>
     */
    protected array $services = [
        TranslationServiceContract::class => TranslationService::class,
    ];

    /**
     * Runs in boot() so it wraps the 'translation.loader' binding that
     * Laravel's own translation provider registers during register().
     */
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');

        $this->app->extend('translation.loader', fn ($fileLoader, Application $app) => new CachingTranslationLoader(
            new DatabaseTranslationLoader($fileLoader, $app['db']),
            $app,
        ));

        Translation::observe(TranslationObserver::class);
        Gate::policy(Translation::class, TranslationPolicy::class);

        $this->commands([SyncFileTranslationsToDatabase::class]);

        $this->registerAbilities();
    }

    /**
     * Class-level abilities for the Inertia `can` prop.
     */
    private function registerAbilities(): void
    {
        app(AbilityRegistry::class)->register([
            'translations.index' => 'translations.index',
        ]);
    }
}
