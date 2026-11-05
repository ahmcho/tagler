<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('appearance page is displayed for verified users', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('appearance.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/appearance'),
        );
});

test('appearance page redirects guests to login', function () {
    $this->get(route('appearance.edit'))
        ->assertRedirect(route('login'));
});
