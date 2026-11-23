<?php

use App\Models\User;

test('the root path is a 404 for guests while no homepage is set', function () {
    $response = $this->get(route('home'));

    $response->assertNotFound();
});

test('the root path is a 404 for signed-in users while no homepage is set', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('home'));

    $response->assertNotFound();
});
