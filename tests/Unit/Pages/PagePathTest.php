<?php

use App\Modules\Pages\Support\PagePath;

test('a request path is normalised to one stored path', function (string $raw) {
    expect(PagePath::parse($raw, 10)?->value)->toBe('services/web');
})->with(['services/web', '/services/web', '/Services//Web/', '  services/web/  ']);

test('an empty request path is the homepage', function (string $raw) {
    expect(PagePath::parse($raw, 10)?->value)->toBe('/');
})->with(['', '/', '//']);

test('invalid segments are rejected', function (string $raw) {
    expect(PagePath::parse($raw, 10))->toBeNull();
})->with(['bad_slug', 'a/../b', 'a/.', 'has space', '-leading', 'trailing-', 'double--hyphen']);

test('a path deeper than the limit is rejected', function () {
    expect(PagePath::parse('a/b/c', 2))->toBeNull()
        ->and(PagePath::parse('a/b', 2)?->value)->toBe('a/b');
});

test('a child of the homepage keeps only its own slug', function () {
    $child = PagePath::homepage()->child('about', 10);

    expect($child?->value)->toBe('about');
});

test('a child of a nested page appends its slug', function () {
    $parent = PagePath::parse('services', 10);

    expect($parent?->child('web', 10)?->value)->toBe('services/web');
});

test('a child with an invalid slug is rejected', function () {
    expect(PagePath::homepage()->child('Not Valid', 10))->toBeNull();
});

test('ancestors are listed from the top level down', function () {
    $path = PagePath::parse('a/b/c', 10);

    expect($path?->ancestors())->toBe(['a', 'a/b'])
        ->and(PagePath::parse('top', 10)?->ancestors())->toBe([])
        ->and(PagePath::homepage()->ancestors())->toBe([]);
});

test('only the first segment is reported as the first segment', function () {
    expect(PagePath::parse('admin/users', 10)?->firstSegment())->toBe('admin')
        ->and(PagePath::homepage()->firstSegment())->toBeNull();
});
