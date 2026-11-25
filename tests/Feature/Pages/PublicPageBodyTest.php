<?php

use App\Modules\Pages\Enums\PageStatus;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\PageFixtures;

beforeEach(function (): void {
    $this->locale = config('app.locale');
});

test('the public page passes the sanitised body to the view', function (): void {
    PageFixtures::create([], ['locale' => $this->locale, 'slug' => 'about', 'path' => 'about', 'body' => '<p>Hello</p>']);

    $this->get("/{$this->locale}/about")
        ->assertInertia(fn (Assert $page) => $page
            ->where('body', '<p>Hello</p>')
            ->where('children', []));
});

test('the children list holds only live children in the current locale, sorted by title', function (): void {
    $parent = PageFixtures::create([], ['locale' => $this->locale, 'slug' => 'services', 'path' => 'services', 'title' => 'Services']);
    PageFixtures::create(['parent_id' => $parent->id], ['locale' => $this->locale, 'slug' => 'web', 'path' => 'services/web', 'title' => 'Web']);
    PageFixtures::create(['parent_id' => $parent->id], ['locale' => $this->locale, 'slug' => 'design', 'path' => 'services/design', 'title' => 'Design']);
    PageFixtures::create(
        ['parent_id' => $parent->id, 'status' => PageStatus::Draft],
        ['locale' => $this->locale, 'slug' => 'hidden', 'path' => 'services/hidden', 'title' => 'Hidden'],
    );

    $this->get("/{$this->locale}/services")
        ->assertInertia(fn (Assert $page) => $page
            ->has('children', 2)
            ->where('children.0.title', 'Design')
            ->where('children.0.url', "/{$this->locale}/services/design")
            ->where('children.1.title', 'Web'));
});

test('the not-found page has no body and no children', function (): void {
    $this->get('/missing-page')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page
            ->where('body', null)
            ->where('children', []));
});
