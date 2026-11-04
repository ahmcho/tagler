<?php

namespace Tests\Feature\Crud\Fixtures;

use Crud\Providers\ModuleServiceProvider;

class MismatchedModuleProvider extends ModuleServiceProvider
{
    protected array $repositories = [
        CrudParentRepositoryContract::class => CrudChild::class,
    ];
}
