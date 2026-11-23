<?php

use App\Models\User;

test('the dashboard lives under the admin prefix', function (): void {
    expect(route('dashboard', absolute: false))->toBe('/admin/dashboard');
});

test('the login page lives under the admin prefix', function (): void {
    expect(route('login', absolute: false))->toBe('/admin/login');
});

test('guests are redirected to the admin login page', function (): void {
    $this->get('/admin/dashboard')->assertRedirect('/admin/login');
});

test('the old root paths are no longer served', function (): void {
    $this->actingAs(User::factory()->create());

    $this->get('/dashboard')->assertNotFound();
    $this->get('/settings/profile')->assertNotFound();
});

test('the profile redirect points to the profile page inside admin', function (): void {
    $this->actingAs(User::factory()->create());

    $this->get('/admin/settings')->assertRedirect(route('profile.edit'));
});

test('logging out sends the user to the admin login page', function (): void {
    $this->actingAs(User::factory()->create());

    $this->post('/admin/logout')->assertRedirect('/admin/login');
    $this->assertGuest();
});
