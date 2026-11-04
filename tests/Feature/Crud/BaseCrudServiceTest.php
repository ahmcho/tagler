<?php

use Crud\Requests\RequestParser;
use Crud\Services\BaseCrudService;
use Tests\Feature\Crud\Fixtures\CrudChild;
use Tests\Feature\Crud\Fixtures\CrudFixtures;
use Tests\Feature\Crud\Fixtures\CrudParent;
use Tests\Feature\Crud\Fixtures\CrudParentRepository;
use Tests\Feature\Crud\Fixtures\CrudParentService;

beforeEach(function () {
    CrudFixtures::up();

    $this->service = new CrudParentService(app(CrudParentRepository::class));
});

it('merges request parser filters with explicit conditions', function () {
    CrudParent::create(['name' => 'Alpha']);
    CrudParent::create(['name' => 'Alphabet']);
    CrudParent::create(['name' => 'Beta']);

    $parser = new RequestParser(autoFilters: [['name', 'LIKE', '%alp%']], autoSorting: 'name');

    $page = $this->service->getAllPaginated(
        $parser,
        conditions: [['name', '!=', 'Alphabet']],
    );

    expect($page->total())->toBe(1)
        ->and($page->items()[0]->name)->toBe('Alpha');
});

it('loads expandable relations from the request parser on findById', function () {
    $parent = CrudParent::create(['name' => 'Alpha']);
    CrudChild::create(['crud_parent_id' => $parent->id, 'name' => 'Child']);

    $model = $this->service->findById($parent->id, new RequestParser(expandable: ['children']));

    expect($model->relationLoaded('children'))->toBeTrue()
        ->and($model->children)->toHaveCount(1);
});

it('is a BaseCrudService', function () {
    expect($this->service)->toBeInstanceOf(BaseCrudService::class);
});
