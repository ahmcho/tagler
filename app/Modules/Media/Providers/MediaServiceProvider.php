<?php

namespace App\Modules\Media\Providers;

use App\Modules\Auth\Support\PermissionRegistry;
use App\Modules\Media\Models\Media;
use App\Modules\Media\Models\MediaFolder;
use App\Modules\Media\Policies\MediaFolderPolicy;
use App\Modules\Media\Policies\MediaPolicy;
use App\Modules\Media\Repositories\Contracts\MediaFolderRepositoryContract;
use App\Modules\Media\Repositories\Contracts\MediaRepositoryContract;
use App\Modules\Media\Repositories\MediaFolderRepository;
use App\Modules\Media\Repositories\MediaRepository;
use App\Modules\Media\Services\Contracts\MediaFolderServiceContract;
use App\Modules\Media\Services\Contracts\MediaServiceContract;
use App\Modules\Media\Services\MediaFolderService;
use App\Modules\Media\Services\MediaService;
use Crud\Providers\ModuleServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;

class MediaServiceProvider extends ModuleServiceProvider
{
    /**
     * @var array<class-string, class-string>
     */
    protected array $repositories = [
        MediaRepositoryContract::class => MediaRepository::class,
        MediaFolderRepositoryContract::class => MediaFolderRepository::class,
    ];

    /**
     * @var array<class-string, class-string>
     */
    protected array $services = [
        MediaServiceContract::class => MediaService::class,
        MediaFolderServiceContract::class => MediaFolderService::class,
    ];

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
        $this->mergeConfigFrom(__DIR__.'/../config/media.php', 'modules.media');

        Gate::policy(Media::class, MediaPolicy::class);
        Gate::policy(MediaFolder::class, MediaFolderPolicy::class);

        RateLimiter::for('media-uploads', fn ($request): Limit => Limit::perMinute(60)
            ->by((string) ($request->user()?->getAuthIdentifier() ?? $request->ip())));

        app(PermissionRegistry::class)->register([
            ['name' => 'media.index', 'description' => 'View the media library'],
            ['name' => 'media.store', 'description' => 'Upload media files'],
            ['name' => 'media.update', 'description' => 'Edit media details and move files'],
            ['name' => 'media.visibility', 'description' => 'Change media visibility'],
            ['name' => 'media.destroy', 'description' => 'Move media to the trash, restore it'],
            ['name' => 'media.purge', 'description' => 'Permanently delete media'],
            ['name' => 'media.folders', 'description' => 'Create, rename, move and delete media folders'],
        ]);
    }
}
