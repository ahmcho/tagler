<?php

use Illuminate\Support\Facades\Route;
use Tests\Feature\Crud\Fixtures\CrudAutoFilterRequest;
use Tests\Feature\Crud\Fixtures\CrudParentRequest;

beforeEach(function (): void {
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

it('builds filters, sorting, expand and paging from the request', function (): void {
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

it('falls back to the default sorting for an unknown sort key', function (): void {
    $response = $this->getJson('/crud-test/parser?sort=unknown');

    expect($response->json('sorting'))->toBe('-id');
});

it('falls back to the default page size when per-page is too large', function (): void {
    $response = $this->getJson('/crud-test/parser?per-page=500');

    expect($response->json('perPage'))->toBe(20);
});

it('routes a custom sort key to customSorting', function (): void {
    $response = $this->getJson('/crud-test/parser?sort=recent&direction=desc');

    expect($response->json('customSorting'))->toBe('-recent')
        ->and($response->json('sorting'))->toBeNull();
});

it('builds LIKE filters for string rules, exact filters for other values and skips custom filters', function (): void {
    Route::get('/crud-test/auto-filters', function (CrudAutoFilterRequest $request) {
        return response()->json($request->parser()->getAutoFilters());
    });

    $response = $this->getJson('/crud-test/auto-filters?name=Al&title=Bo&status=0&code=Z');

    $response->assertOk();
    expect($response->json())->toBe([
        ['name', 'LIKE', '%Al%'],
        ['title', 'LIKE', '%Bo%'],
        ['status', '=', '0'],
    ]);
});

it('treats a string rule with the value 0 as an exact filter', function (): void {
    Route::get('/crud-test/auto-filters-zero', function (CrudAutoFilterRequest $request) {
        return response()->json($request->parser()->getAutoFilters());
    });

    $response = $this->getJson('/crud-test/auto-filters-zero?title=0');

    expect($response->json())->toBe([['title', '=', '0']]);
});
