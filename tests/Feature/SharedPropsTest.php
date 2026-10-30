<?php

use Inertia\Testing\AssertableInertia;

test('the application name is shared with every page', function () {
    config(['app.name' => 'Tagler CMS']);

    $this->get(route('home'))->assertInertia(fn (AssertableInertia $page) => $page
        ->where('name', 'Tagler CMS')
        ->missing('sidebarOpen'));
});
