<?php

namespace App\Modules\Pages\Support;

/**
 * A normalised public URL path of a page, without a leading slash. The
 * homepage is the value `/`. Invalid input never builds an instance: the
 * factories return null instead.
 */
final readonly class PagePath
{
    public const string HOMEPAGE = '/';

    private const string SEGMENT_PATTERN = '/^[a-z0-9]+(?:-[a-z0-9]+)*$/';

    private function __construct(public string $value) {}

    public static function homepage(): self
    {
        return new self(self::HOMEPAGE);
    }

    /**
     * Parses a request path such as `/Services//Web/`. Empty segments are
     * dropped, so the result is the same page for every spelling.
     */
    public static function parse(string $rawPath, int $maxDepth): ?self
    {
        $segments = array_values(array_filter(
            explode('/', strtolower(trim($rawPath))),
            fn (string $segment): bool => $segment !== '',
        ));

        if ($segments === []) {
            return self::homepage();
        }

        if (count($segments) > $maxDepth || ! array_all($segments, self::isValidSegment(...))) {
            return null;
        }

        return new self(implode('/', $segments));
    }

    /**
     * The path of a page placed under this one. The homepage has no path
     * segment, so a child of the homepage keeps only its own slug.
     */
    public function child(string $slug, int $maxDepth): ?self
    {
        if (! self::isValidSegment($slug)) {
            return null;
        }

        $childPath = $this->isHomepage() ? $slug : $this->value.'/'.$slug;

        return self::parse($childPath, $maxDepth);
    }

    public static function isValidSegment(string $segment): bool
    {
        return preg_match(self::SEGMENT_PATTERN, $segment) === 1;
    }

    public function isHomepage(): bool
    {
        return $this->value === self::HOMEPAGE;
    }

    public function firstSegment(): ?string
    {
        return $this->isHomepage() ? null : explode('/', $this->value)[0];
    }

    /**
     * Stored paths of every ancestor, from the top level down. A path `a/b/c`
     * returns `a` and `a/b`.
     *
     * @return list<string>
     */
    public function ancestors(): array
    {
        if ($this->isHomepage()) {
            return [];
        }

        $segments = explode('/', $this->value);
        $ancestors = [];

        for ($index = 1; $index < count($segments); $index++) {
            $ancestors[] = implode('/', array_slice($segments, 0, $index));
        }

        return $ancestors;
    }
}
