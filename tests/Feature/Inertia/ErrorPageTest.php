<?php

use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;

beforeEach(function (): void {
    config(['app.debug' => false]);

    Route::get('/test-errors/{status}', fn (int $status) => abort($status));
});

it('renders the error page for client errors', function (int $status): void {
    $this->get("/test-errors/{$status}")
        ->assertStatus($status)
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('errors/error')
            ->where('status', $status));
})->with([400, 401, 403, 404, 405, 419, 422, 429]);

it('renders the error page for server errors when debug is off', function (int $status): void {
    $this->get("/test-errors/{$status}")
        ->assertStatus($status)
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('errors/error')
            ->where('status', $status));
})->with([500, 503]);

it('keeps the default server error response when debug is on', function (): void {
    config(['app.debug' => true]);

    $this->get('/test-errors/500')
        ->assertStatus(500)
        ->assertDontSee('errors/error');
});

it('does not render the error page for JSON requests', function (): void {
    $this->getJson('/test-errors/404')
        ->assertStatus(404)
        ->assertDontSee('errors/error');
});
