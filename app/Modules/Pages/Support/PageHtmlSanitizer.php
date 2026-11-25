<?php

namespace App\Modules\Pages\Support;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

/**
 * Cleans raw HTML written by editors. Only the safe element set is kept. Links
 * may use http, https and mailto, and relative links are allowed. Scripts,
 * event handlers and unknown elements are removed.
 */
final readonly class PageHtmlSanitizer
{
    private HtmlSanitizer $sanitizer;

    public function __construct()
    {
        $config = (new HtmlSanitizerConfig)
            ->allowSafeElements()
            ->allowLinkSchemes(['http', 'https', 'mailto'])
            ->allowRelativeLinks()
            ->allowMediaSchemes(['http', 'https'])
            ->allowRelativeMedias()
            ->forceAttribute('a', 'rel', 'noopener noreferrer')
            ->allowElement('input', ['type', 'checked', 'disabled'])
            ->allowAttribute('class', ['code'])
            ->allowAttribute('id', ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            ->withMaxInputLength(-1);

        $this->sanitizer = new HtmlSanitizer($config);
    }

    public function sanitize(string $html): string
    {
        return $this->sanitizer->sanitize($html);
    }
}
