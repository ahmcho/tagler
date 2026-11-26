<?php

use App\Modules\Pages\Support\PageHtmlSanitizer;

test('scripts, event handlers and unsafe links are removed', function (): void {
    $clean = (new PageHtmlSanitizer)->sanitize('<p onclick="x()">Hi <script>alert(1)</script></p><a href="javascript:alert(2)">bad</a>');

    expect($clean)->not->toContain('<script')
        ->and($clean)->not->toContain('onclick')
        ->and($clean)->not->toContain('javascript:')
        ->and($clean)->toContain('Hi');
});

test('safe formatting is kept and links get a safe rel', function (): void {
    $clean = (new PageHtmlSanitizer)->sanitize('<p><strong>Bold</strong> <a href="https://example.com">link</a></p>');

    expect($clean)->toContain('<strong>Bold</strong>')
        ->and($clean)->toContain('href="https://example.com"')
        ->and($clean)->toContain('rel="noopener noreferrer"');
});

test('an image figure keeps its source, alt text, caption and position', function (): void {
    $html = '<figure data-position="left"><img src="https://cdn.example.com/a.jpg" alt="Harbour" onerror="x()"><figcaption>Old harbour</figcaption></figure>';

    $clean = (new PageHtmlSanitizer)->sanitize($html);

    expect($clean)->toContain('<figure data-position="left">')
        ->and($clean)->toContain('src="https://cdn.example.com/a.jpg"')
        ->and($clean)->toContain('alt="Harbour"')
        ->and($clean)->toContain('<figcaption>Old harbour</figcaption>')
        ->and($clean)->not->toContain('onerror');
});

test('a link keeps its target and still gets a safe rel', function (): void {
    $clean = (new PageHtmlSanitizer)->sanitize('<a href="https://example.com" target="_blank">new</a><a href="/contact" target="_self">same</a>');

    expect($clean)->toContain('target="_blank"')
        ->and($clean)->toContain('target="_self"')
        ->and($clean)->toContain('rel="noopener noreferrer"');
});

test('an image width is kept as an inline width on the image and its figure', function (): void {
    $sanitizer = new PageHtmlSanitizer;

    $kept = $sanitizer->sanitize('<figure data-position="full"><img src="https://cdn.example.com/a.jpg" alt="A" data-width="42" style="position: fixed"></figure>');
    $dropped = $sanitizer->sanitize('<figure data-position="full"><img src="https://cdn.example.com/a.jpg" alt="A" data-width="250"></figure>');

    expect($kept)->toContain('<figure data-position="full" style="width: 42%">')
        ->and($kept)->toContain('data-width="42" style="width: 100%"')
        ->and($kept)->not->toContain('position: fixed')
        ->and($dropped)->not->toContain('style=')
        ->and($dropped)->not->toContain('data-width')
        ->and($dropped)->toContain('<figure data-position="full">');
});
