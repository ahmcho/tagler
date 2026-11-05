<?php

namespace App\Modules\Translation\Providers;

use App\Models\User;
use App\Modules\Translation\Console\Commands\SyncFileTranslationsToDatabase;
use App\Modules\Translation\Models\Translation;
use App\Modules\Translation\Observers\TranslationObserver;
use App\Modules\Translation\Repositories\Contracts\TranslationRepositoryContract;
use App\Modules\Translation\Repositories\TranslationRepository;
use App\Modules\Translation\Services\Contracts\TranslationServiceContract;
use App\Modules\Translation\Services\TranslationService;
use App\Modules\Translation\Support\CachingTranslationLoader;
use App\Modules\Translation\Support\DatabaseTranslationLoader;
use Crud\Providers\ModuleServiceProvider;
use Illuminate\Contracts\Foundation\Application;
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

        $this->commands([SyncFileTranslationsToDatabase::class]);

        $this->definePermissionGates();
    }

    /**
     * Spatie defines a Gate ability only for permissions that exist when the
     * app boots, so each module defines its own permission gates here.
     */
    private function definePermissionGates(): void
    {
        foreach (['translations.index', 'translations.update'] as $permissionName) {
            Gate::define($permissionName, fn (User $user): bool => $user->getAllPermissions()->contains('name', $permissionName));
        }
    }
}
