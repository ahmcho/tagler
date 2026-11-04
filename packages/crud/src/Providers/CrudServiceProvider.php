<?php

namespace Crud\Providers;

use Illuminate\Support\ServiceProvider;

class CrudServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../../config/crud.php', 'crud');
    }

    public function boot(): void
    {
        $this->publishes([
            __DIR__.'/../../config/crud.php' => config_path('crud.php'),
        ], 'config');
    }
}
