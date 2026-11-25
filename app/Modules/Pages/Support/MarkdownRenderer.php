<?php

namespace App\Modules\Pages\Support;

use League\CommonMark\Environment\Environment;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\Extension\GithubFlavoredMarkdownExtension;
use League\CommonMark\Extension\HeadingPermalink\HeadingPermalinkExtension;
use League\CommonMark\MarkdownConverter;

/**
 * Renders a Markdown body to HTML. Headings get GitHub-style ids, so in-page links such as `#1-creational` work.
 * Raw HTML in the Markdown is escaped, and unsafe links are dropped. The result still goes through
 * PageHtmlSanitizer before it is shown.
 */
final readonly class MarkdownRenderer
{
    private MarkdownConverter $converter;

    public function __construct(private PageHtmlSanitizer $sanitizer)
    {
        $environment = new Environment([
            'html_input' => 'escape',
            'allow_unsafe_links' => false,
            'heading_permalink' => [
                'apply_id_to_heading' => true,
                'insert' => 'none',
                'id_prefix' => '',
            ],
        ]);

        $environment->addExtension(new CommonMarkCoreExtension);
        $environment->addExtension(new GithubFlavoredMarkdownExtension);
        $environment->addExtension(new HeadingPermalinkExtension);

        $this->converter = new MarkdownConverter($environment);
    }

    public function render(string $markdown): string
    {
        return $this->sanitizer->sanitize((string) $this->converter->convert($markdown));
    }
}
