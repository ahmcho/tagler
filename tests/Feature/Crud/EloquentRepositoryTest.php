<?php

use Crud\Exceptions\ModelHasRelationsException;
use Crud\Repositories\EloquentRepository;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Tests\Feature\Crud\Fixtures\CrudChild;
use Tests\Feature\Crud\Fixtures\CrudFixtures;
use Tests\Feature\Crud\Fixtures\CrudNote;
use Tests\Feature\Crud\Fixtures\CrudParent;
use Tests\Feature\Crud\Fixtures\CrudParentRepository;

beforeEach(function () {
    CrudFixtures::up();

    $this->repository = app(CrudParentRepository::class);
});

it('paginates results', function () {
    foreach (['Alpha', 'Beta', 'Gamma'] as $name) {
        CrudParent::create(['name' => $name]);
    }

    $page = $this->repository->getAllPaginated(perPage: 2);

    expect($page->total())->toBe(3)
        ->and($page->items())->toHaveCount(2);
});

it('applies plain conditions', function () {
    CrudParent::create(['name' => 'Alpha']);
    CrudParent::create(['name' => 'Beta']);

    $page = $this->repository->getAllPaginated(conditions: [['name', '=', 'Alpha']]);

    expect($page->total())->toBe(1)
        ->and($page->items()[0]->name)->toBe('Alpha');
});

it('matches LIKE conditions case-insensitively', function () {
    CrudParent::create(['name' => 'Alpha']);
    CrudParent::create(['name' => 'Alphabet']);
    CrudParent::create(['name' => 'Beta']);

    $like = $this->repository->getAllPaginated(conditions: [['name', 'LIKE', '%ALP%']]);
    $notLike = $this->repository->getAllPaginated(conditions: [['name', 'not like', '%alp%']]);

    expect($like->total())->toBe(2)
        ->and($notLike->total())->toBe(1)
        ->and($notLike->items()[0]->name)->toBe('Beta');
});

it('sorts by a column in the requested direction', function () {
    CrudParent::create(['name' => 'Alpha']);
    CrudParent::create(['name' => 'Gamma']);

    $page = $this->repository->getAllPaginated(sorting: '-name');

    expect($page->items()[0]->name)->toBe('Gamma');
});

it('uses a custom sorting hook', function () {
    CrudParent::create(['name' => 'First']);
    CrudParent::create(['name' => 'Second']);

    $page = $this->repository->getAllPaginated(customSorting: '-recent');

    expect($page->items()[0]->name)->toBe('Second');
});

it('uses a custom condition hook', function () {
    CrudParent::create(['name' => 'Alpha']);
    CrudParent::create(['name' => 'Alphabet']);
    CrudParent::create(['name' => 'Beta']);

    $page = $this->repository->getAllPaginated(customConditions: ['prefix' => 'Al']);

    expect($page->total())->toBe(2);
});

it('adds custom relations', function () {
    $parent = CrudParent::create(['name' => 'Alpha']);
    CrudChild::create(['crud_parent_id' => $parent->id, 'name' => 'Child']);

    $page = $this->repository->getAllPaginated(customRelations: ['children_count']);

    expect($page->items()[0]->children_count)->toBe(1);
});

it('finds a model by id and fails for a missing id', function () {
    $parent = CrudParent::create(['name' => 'Alpha']);

    expect($this->repository->findById($parent->id)->name)->toBe('Alpha');

    expect(fn () => $this->repository->findById(999999))->toThrow(ModelNotFoundException::class);
});

it('creates and updates a model', function () {
    $parent = $this->repository->create(['name' => 'Alpha']);
    $updated = $this->repository->update($parent, ['name' => 'Beta']);

    expect($parent->id)->not->toBeNull()
        ->and($updated->name)->toBe('Beta');
});

it('deletes a model without relations and returns true', function () {
    $parent = CrudParent::create(['name' => 'Alpha']);

    expect($this->repository->deleteById($parent->id))->toBeTrue()
        ->and(CrudParent::count())->toBe(0);
});

it('maps a foreign key violation to ModelHasRelationsException', function () {
    $parent = CrudParent::create(['name' => 'Alpha']);
    CrudChild::create(['crud_parent_id' => $parent->id, 'name' => 'Child']);

    $this->repository->deleteById($parent->id);
})->throws(ModelHasRelationsException::class);

it('keeps the transaction usable after a foreign key violation', function () {
    $parent = CrudParent::create(['name' => 'Alpha']);
    CrudChild::create(['crud_parent_id' => $parent->id, 'name' => 'Child']);

    DB::transaction(function () use ($parent): void {
        try {
            $this->repository->deleteById($parent->id);
        } catch (ModelHasRelationsException $exception) {
            expect($exception->getStatusCode())->toBe(403);
        }

        expect(CrudParent::count())->toBe(1);
    });
});

it('soft deletes, restores and permanently deletes a model', function () {
    $notes = new class(new CrudNote) extends EloquentRepository {};
    $note = $notes->create(['title' => 'Draft']);

    $notes->deleteById($note->id);
    expect($notes->findOnlyTrashedById($note->id)->title)->toBe('Draft');

    $notes->restoreById($note->id);
    expect($notes->findById($note->id)->title)->toBe('Draft');

    $notes->deleteById($note->id);
    $notes->permanentlyDeleteById($note->id);
    expect(CrudNote::withTrashed()->count())->toBe(0);
});
