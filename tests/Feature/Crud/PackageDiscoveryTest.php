<?php

use Crud\Providers\CrudServiceProvider;

it('auto-discovers the crud service provider', function (): void {
    expect(app()->getProviders(CrudServiceProvider::class))->not->toBeEmpty();
});

it('loads the package config defaults', function (): void {
    expect(config('crud.items_count_per_page'))->toBe(20)
        ->and(config('crud.max_items_count_per_page'))->toBe(100);
});
