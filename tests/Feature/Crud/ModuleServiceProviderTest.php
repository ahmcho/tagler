<?php

use Crud\Services\BaseCrudService;
use Tests\Feature\Crud\Fixtures\CrudFixtures;
use Tests\Feature\Crud\Fixtures\CrudParentModuleProvider;
use Tests\Feature\Crud\Fixtures\CrudParentRepository;
use Tests\Feature\Crud\Fixtures\CrudParentRepositoryContract;
use Tests\Feature\Crud\Fixtures\CrudParentService;
use Tests\Feature\Crud\Fixtures\CrudParentServiceContract;
use Tests\Feature\Crud\Fixtures\MismatchedModuleProvider;

beforeEach(function () {
    CrudFixtures::up();

    app()->register(CrudParentModuleProvider::class);
});

it('binds the repository and service pairs of a module', function () {
    expect(app(CrudParentRepositoryContract::class))->toBeInstanceOf(CrudParentRepository::class)
        ->and(app(CrudParentServiceContract::class))->toBeInstanceOf(CrudParentService::class)
        ->and(app(CrudParentServiceContract::class))->toBeInstanceOf(BaseCrudService::class);
});

it('rejects a pair whose implementation does not implement its contract', function () {
    $provider = new MismatchedModuleProvider(app());

    expect(fn () => $provider->register())
        ->toThrow(InvalidArgumentException::class, 'does not implement');
});
