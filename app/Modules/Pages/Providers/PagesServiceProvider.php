<?php

namespace App\Modules\Pages\Providers;

use App\Modules\Auth\Support\AbilityRegistry;
use App\Modules\Auth\Support\PermissionRegistry;
use App\Modules\Pages\Console\Commands\PublishScheduledPages;
use App\Modules\Pages\Models\Page;
use App\Modules\Pages\Policies\PagePolicy;
use App\Modules\Pages\Repositories\Contracts\PageRepositoryContract;
use App\Modules\Pages\Repositories\Contracts\PageRevisionRepositoryContract;
use App\Modules\Pages\Repositories\Contracts\PageTranslationRepositoryContract;
use App\Modules\Pages\Repositories\PageRepository;
use App\Modules\Pages\Repositories\PageRevisionRepository;
use App\Modules\Pages\Repositories\PageTranslationRepository;
use App\Modules\Pages\Services\Contracts\PageServiceContract;
use App\Modules\Pages\Services\PageService;
use Crud\Providers\ModuleServiceProvider;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\Gate;
use Inertia\Ssr\Gateway;
use Inertia\Ssr\HttpGateway;

class PagesServiceProvider extends ModuleServiceProvider
{
    /**
     * @var array<class-string, class-string>
     */
    protected array $repositories = [
        PageRepositoryContract::class => PageRepository::class,
        PageTranslationRepositoryContract::class => PageTranslationRepository::class,
        PageRevisionRepositoryContract::class => PageRevisionRepository::class,
    ];

    /**
     * @var array<class-string, class-string>
     */
    protected array $services = [
        PageServiceContract::class => PageService::class,
    ];

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
        $this->mergeConfigFrom(__DIR__.'/../config/pages.php', 'modules.pages');

        Gate::policy(Page::class, PagePolicy::class);

        $this->registerPermissions();
        $this->registerAbilities();
        $this->registerConsole();
        $this->disableSsrForPublicPages();
    }

    /**
     * Public pages load only public.tsx, which has no server render entry. Server rendering would replace the
     * search and sharing tags in the root view with the dev server's own head, so public pages skip it.
     */
    private function disableSsrForPublicPages(): void
    {
        /** @var object $gateway The SSR gateway is an HttpGateway unless another package replaces it. */
        $gateway = $this->app->make(Gateway::class);

        if ($gateway instanceof HttpGateway) {
            $gateway->disable(fn (): bool => $this->isPublicPageRequest());
        }
    }

    private function isPublicPageRequest(): bool
    {
        $name = request()->route()?->getName();

        return $name === null || in_array($name, ['home', 'pages.localized', 'pages.preview.show'], true);
    }

    private function registerConsole(): void
    {
        $this->commands([PublishScheduledPages::class]);

        $this->callAfterResolving(Schedule::class, function (Schedule $schedule): void {
            $schedule->command(PublishScheduledPages::class)->everyMinute()->withoutOverlapping();
        });
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
