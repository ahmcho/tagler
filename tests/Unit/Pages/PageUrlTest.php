<?php

use App\Modules\Pages\Support\PageUrl;

test('safe link targets are accepted', function (string $url): void {
    expect(PageUrl::isSafe($url))->toBeTrue();
})->with(['/about', '#contact', 'https://example.com/a?b=1', 'http://example.com', 'mailto:info@example.com']);

test('unsafe link targets are refused', function (string $url): void {
    expect(PageUrl::isSafe($url))->toBeFalse();
})->with(['javascript:alert(1)', 'JavaScript:alert(1)', 'data:text/html;base64,PHNjcmlwdD4=', '//evil.example', 'vbscript:msgbox', ' java
script:alert(1)', '', 'ftp://example.com']);
