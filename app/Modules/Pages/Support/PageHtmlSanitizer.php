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
            ->allowAttribute('data-position', ['figure'])
            ->allowAttribute('data-width', ['img'])
            ->allowAttribute('id', ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            ->withMaxInputLength(-1);

        $this->sanitizer = new HtmlSanitizer($config);
    }

    /**
     * Cleans the HTML, then sets the inline width of each figure from the `data-width`
     * (1 to 100) of its image. The image fills the figure. Inline styles are not kept by
     * the sanitizer, so the widths are set here.
     */
    public function sanitize(string $html): string
    {
        $clean = $this->sanitizer->sanitize($html);

        return preg_replace_callback(
            '/<figure\b([^>]*)>(<img\b[^>]*\sdata-width="(\d{1,3})"[^>]*>)/',
            $this->figureWithWidth(...),
            $clean,
        ) ?? $clean;
    }

    /**
     * @param  array{0: string, 1: string, 2: string, 3: string}  $match
     */
    private function figureWithWidth(array $match): string
    {
        $width = (int) $match[3];

        if ($width < 1 || $width > 100) {
            return '<figure'.$match[1].'>'.preg_replace('/\sdata-width="\d{1,3}"/', '', $match[2]);
        }

        $image = str_replace(
            'data-width="'.$match[3].'"',
            'data-width="'.$width.'" style="width: 100%"',
            $match[2],
        );

        return '<figure'.$match[1].' style="width: '.$width.'%">'.$image;
    }
}
