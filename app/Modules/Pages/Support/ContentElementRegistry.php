<?php

namespace App\Modules\Pages\Support;

use App\Modules\Pages\Support\ContentElements\ContentElement;
use InvalidArgumentException;

/**
 * Maps type keys to element classes. Lookups never create a class from input: the classes come from config.
 */
class ContentElementRegistry
{
    /**
     * @var array<string, ContentElement>
     */
    private array $elements = [];

    public function register(ContentElement $element): void
    {
        if (isset($this->elements[$element->key()])) {
            throw new InvalidArgumentException("Content element [{$element->key()}] is already registered.");
        }

        $this->elements[$element->key()] = $element;
    }

    public function resolve(string $key): ?ContentElement
    {
        return $this->elements[$key] ?? null;
    }

    /**
     * @return array<string, ContentElement>
     */
    public function all(): array
    {
        return $this->elements;
    }
}
