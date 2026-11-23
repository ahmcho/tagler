<?php

use App\Modules\Pages\Support\PageHtmlSanitizer;

test('scripts, event handlers and unsafe links are removed', function () {
    $clean = (new PageHtmlSanitizer)->sanitize('<p onclick="x()">Hi <script>alert(1)</script></p><a href="javascript:alert(2)">bad</a>');

    expect($clean)->not->toContain('<script')
        ->and($clean)->not->toContain('onclick')
        ->and($clean)->not->toContain('javascript:')
        ->and($clean)->toContain('Hi');
});

test('safe formatting is kept and links get a safe rel', function () {
    $clean = (new PageHtmlSanitizer)->sanitize('<p><strong>Bold</strong> <a href="https://example.com">link</a></p>');

    expect($clean)->toContain('<strong>Bold</strong>')
        ->and($clean)->toContain('href="https://example.com"')
        ->and($clean)->toContain('rel="noopener noreferrer"');
});
