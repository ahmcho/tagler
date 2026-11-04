<?php

namespace Tests\Feature\Crud\Fixtures;

use Crud\Providers\ModuleServiceProvider;

class CrudParentModuleProvider extends ModuleServiceProvider
{
    protected array $repositories = [
        CrudParentRepositoryContract::class => CrudParentRepository::class,
    ];

    protected array $services = [
        CrudParentServiceContract::class => CrudParentService::class,
    ];
}
