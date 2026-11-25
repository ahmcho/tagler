<?php

use App\Modules\Pages\Support\MarkdownRenderer;

test('markdown structure renders as html', function (): void {
    $html = app(MarkdownRenderer::class)->render("# Title\n\nSome *text* and **bold**.\n\n- one\n- two\n\n```php\necho 1;\n```\n");

    expect($html)->toContain('<h1 id="title">Title</h1>')
        ->and($html)->toContain('<em>text</em>')
        ->and($html)->toContain('<strong>bold</strong>')
        ->and($html)->toContain('<ul>')
        ->and($html)->toContain('<code class="language-php">');
});

test('gfm tables and task lists render', function (): void {
    $html = app(MarkdownRenderer::class)->render("| a | b |\n|---|---|\n| 1 | 2 |\n\n- [x] done\n");

    expect($html)->toContain('<table>')
        ->and($html)->toContain('<td>2</td>')
        ->and($html)->toContain('type="checkbox"');
});

test('raw html and unsafe links are removed', function (): void {
    $html = app(MarkdownRenderer::class)->render("<script>alert(1)</script>\n\n[bad](javascript:alert(2))\n");

    expect($html)->not->toContain('<script')
        ->and($html)->not->toContain('javascript:');
});

test('headings get ids so in-page links work', function (): void {
    $html = app(MarkdownRenderer::class)->render("- [One](#1-creational)\n\n## 1. Creational\n\n## 1. Creational\n\n### 1.1 Factory Method\n");

    expect($html)->toContain('<h2 id="1-creational">1. Creational</h2>')
        ->and($html)->toContain('<h2 id="1-creational-1">')
        ->and($html)->toContain('<h3 id="11-factory-method">')
        ->and($html)->toContain('href="#1-creational"');
});
