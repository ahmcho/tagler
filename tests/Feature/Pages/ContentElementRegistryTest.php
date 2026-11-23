<?php

use App\Modules\Pages\Support\ContentElementRegistry;
use App\Modules\Pages\Support\ContentElements\HeadingElement;

test('every element class listed in config is registered under its type key', function () {
    $registry = app(ContentElementRegistry::class);

    expect(array_keys($registry->all()))->toEqualCanonicalizing([
        'heading', 'paragraph', 'markdown', 'html', 'button', 'spacer', 'divider', 'quote',
    ]);
});

test('an unknown type key resolves to null', function () {
    expect(app(ContentElementRegistry::class)->resolve('video'))->toBeNull();
});

test('registering the same type key twice is rejected', function () {
    $registry = new ContentElementRegistry;
    $registry->register(new HeadingElement);

    expect(fn () => $registry->register(new HeadingElement))->toThrow(InvalidArgumentException::class);
});

test('every element describes its editor fields and defaults', function () {
    foreach (app(ContentElementRegistry::class)->all() as $key => $element) {
        $schema = $element->schema();

        expect($schema)->toHaveKeys(['defaults', 'fields'])
            ->and($schema['fields'])->toBeArray()
            ->and($element->key())->toBe($key);
    }
});

test('a paragraph keeps its formatting and drops scripts', function () {
    $paragraph = app(ContentElementRegistry::class)->resolve('paragraph');

    expect($paragraph->normalize(['html' => '<p><strong>Hi</strong><script>x()</script></p>']))
        ->toBe(['html' => '<p><strong>Hi</strong></p>']);
});
