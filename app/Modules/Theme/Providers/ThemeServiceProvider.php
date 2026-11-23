<?php

namespace App\Modules\Theme\Providers;

use App\Modules\Auth\Support\AbilityRegistry;
use App\Modules\Auth\Support\PermissionRegistry;
use App\Modules\Theme\Contracts\ThemeRegistryContract;
use App\Modules\Theme\Contracts\ThemeServiceContract;
use App\Modules\Theme\Services\ThemeService;
use App\Modules\Theme\Support\ThemeManifestParser;
use App\Modules\Theme\Support\ThemeRegistry;
use Crud\Providers\ModuleServiceProvider;

class ThemeServiceProvider extends ModuleServiceProvider
{
    /**
     * @var array<class-string, class-string>
     */
    protected array $services = [
        ThemeServiceContract::class => ThemeService::class,
    ];

    public function register(): void
    {
        parent::register();

        $this->app->singleton(ThemeManifestParser::class);
        $this->app->singleton(ThemeRegistryContract::class, ThemeRegistry::class);
    }

    public function boot(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/theme.php', 'modules.theme');

        $this->registerPermissions();
        $this->registerAbilities();
    }

    /**
     * Class-level abilities reach the frontend as the shared `can` prop, so the theme list can show its actions.
     */
    private function registerAbilities(): void
    {
        app(AbilityRegistry::class)->register([
            'themes.index' => 'themes.index',
            'themes.activate' => 'themes.activate',
        ]);
    }

    private function registerPermissions(): void
    {
        app(PermissionRegistry::class)->register([
            ['name' => 'themes.index', 'description' => 'View the theme list'],
            ['name' => 'themes.activate', 'description' => 'Activate a theme'],
        ]);
    }
}
