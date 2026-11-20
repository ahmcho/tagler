<?php

namespace App\Modules\Settings\Providers;

use App\Modules\Auth\Support\AbilityRegistry;
use App\Modules\Auth\Support\PermissionRegistry;
use App\Modules\Settings\Models\Setting;
use App\Modules\Settings\Policies\SettingPolicy;
use App\Modules\Settings\Repositories\Contracts\SettingRepositoryContract;
use App\Modules\Settings\Repositories\SettingRepository;
use App\Modules\Settings\Services\Contracts\SettingServiceContract;
use App\Modules\Settings\Services\SettingService;
use Crud\Providers\ModuleServiceProvider;
use Illuminate\Support\Facades\Gate;

class SettingsServiceProvider extends ModuleServiceProvider
{
    /**
     * @var array<class-string, class-string>
     */
    protected array $repositories = [
        SettingRepositoryContract::class => SettingRepository::class,
    ];

    /**
     * @var array<class-string, class-string>
     */
    protected array $services = [
        SettingServiceContract::class => SettingService::class,
    ];

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');

        Gate::policy(Setting::class, SettingPolicy::class);

        $this->registerPermissions();
        $this->registerAbilities();
    }

    /**
     * The permissions this module declares. The Auth seeder creates them.
     */
    private function registerPermissions(): void
    {
        app(PermissionRegistry::class)->register([
            ['name' => 'settings.index', 'description' => 'View the application settings'],
            ['name' => 'settings.update', 'description' => 'Edit the application settings'],
        ]);
    }

    /**
     * Class-level abilities for the Inertia `can` prop.
     */
    private function registerAbilities(): void
    {
        app(AbilityRegistry::class)->register([
            'settings.index' => [Setting::class, 'viewAny'],
            'settings.update' => [Setting::class, 'update'],
        ]);
    }
}
