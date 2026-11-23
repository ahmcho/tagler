<?php

namespace App\Modules\Pages\Support;

/**
 * The versioned content document stored per locale. Slice 2 adds sections and elements.
 */
final class PageContentDocument
{
    public const int VERSION = 1;

    /**
     * @return array{version: int, sections: list<array<string, mixed>>}
     */
    public static function empty(): array
    {
        return ['version' => self::VERSION, 'sections' => []];
    }
}
