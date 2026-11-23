<?php

namespace App\Modules\Pages\Providers;

use App\Modules\Auth\Support\AbilityRegistry;
use App\Modules\Auth\Support\PermissionRegistry;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Policies\PagePolicy;
use App\Modules\Pages\Repositories\Contracts\PageRepositoryContract;
use App\Modules\Pages\Repositories\Contracts\PageTranslationRepositoryContract;
use App\Modules\Pages\Repositories\PageRepository;
use App\Modules\Pages\Repositories\PageTranslationRepository;
use App\Modules\Pages\Services\Contracts\PageServiceContract;
use App\Modules\Pages\Services\PageService;
use App\Modules\Pages\Support\ContentElementRegistry;
use Crud\Providers\ModuleServiceProvider;
use Illuminate\Support\Facades\Gate;

class PagesServiceProvider extends ModuleServiceProvider
{
    /**
     * @var array<class-string, class-string>
     */
    protected array $repositories = [
        PageRepositoryContract::class => PageRepository::class,
        PageTranslationRepositoryContract::class => PageTranslationRepository::class,
    ];

    /**
     * @var array<class-string, class-string>
     */
    protected array $services = [
        PageServiceContract::class => PageService::class,
    ];

    public function register(): void
    {
        parent::register();

        $this->app->singleton(ContentElementRegistry::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
        $this->mergeConfigFrom(__DIR__.'/../config/pages.php', 'modules.pages');

        Gate::policy(Page::class, PagePolicy::class);

        $this->registerPermissions();
        $this->registerAbilities();
        $this->registerContentElements();
    }

    /**
     * Element classes come from config/pages.php, so only code this application ships can run.
     */
    private function registerContentElements(): void
    {
        $registry = app(ContentElementRegistry::class);

        foreach (config('modules.pages.elements', []) as $elementClass) {
            $registry->register(app($elementClass));
        }
    }

    private function registerPermissions(): void
    {
        app(PermissionRegistry::class)->register([
            ['name' => 'pages.index', 'description' => 'View the page list'],
            ['name' => 'pages.store', 'description' => 'Create pages'],
            ['name' => 'pages.update', 'description' => 'Edit pages'],
            ['name' => 'pages.destroy', 'description' => 'Delete pages'],
            ['name' => 'pages.publish', 'description' => 'Publish and unpublish pages'],
            ['name' => 'pages.homepage', 'description' => 'Assign the homepage'],
            ['name' => 'pages.html', 'description' => 'Save raw HTML blocks on pages'],
        ]);
    }

    /**
     * Only class-level checks belong here. Row-level checks (update, delete, publish) reach the
     * frontend through each resource's `can` object.
     */
    private function registerAbilities(): void
    {
        app(AbilityRegistry::class)->register([
            'pages.index' => [Page::class, 'viewAny'],
            'pages.store' => [Page::class, 'create'],
        ]);
    }
}
