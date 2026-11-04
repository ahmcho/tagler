<?php

use Illuminate\Support\Facades\Route;
use Tests\Feature\Crud\Fixtures\CrudParentRequest;

beforeEach(function () {
    Route::get('/crud-test/parser', function (CrudParentRequest $request) {
        $parser = $request->parser();

        return response()->json([
            'filters' => $parser->getAutoFilters(),
            'sorting' => $parser->getAutoSorting(),
            'customSorting' => $parser->getCustomSorting(),
            'expandable' => $parser->getExpandable(),
            'perPage' => $parser->getPerPage(),
        ]);
    });
});

it('builds filters, sorting, expand and paging from the request', function () {
    $response = $this->getJson('/crud-test/parser?name=Al&sort=name&direction=desc&expand=children&per-page=5');

    $response->assertOk();
    expect($response->json())->toBe([
        'filters' => [['name', 'LIKE', '%Al%']],
        'sorting' => '-name',
        'customSorting' => null,
        'expandable' => ['children'],
        'perPage' => 5,
    ]);
});

it('falls back to the default sorting for an unknown sort key', function () {
    $response = $this->getJson('/crud-test/parser?sort=unknown');

    expect($response->json('sorting'))->toBe('-id');
});

it('falls back to the default page size when per-page is too large', function () {
    $response = $this->getJson('/crud-test/parser?per-page=500');

    expect($response->json('perPage'))->toBe(20);
});

it('routes a custom sort key to customSorting', function () {
    $response = $this->getJson('/crud-test/parser?sort=recent&direction=desc');

    expect($response->json('customSorting'))->toBe('-recent')
        ->and($response->json('sorting'))->toBeNull();
});
