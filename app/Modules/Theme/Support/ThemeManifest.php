<?php

namespace App\Modules\Theme\Support;

/**
 * A validated theme manifest. Built only from `theme.json`. Nothing in a theme folder is executed.
 *
 * @phpstan-type TemplateMap array<string, string>
 */
final readonly class ThemeManifest
{
    /**
     * @param  array<string, string>  $templates  Template key => template file under resources/js/templates, without extension
     */
    public function __construct(
        public string $slug,
        public string $name,
        public string $version,
        public ?string $description,
        public ?string $author,
        public string $folder,
        public array $templates,
    ) {}

    public function provides(string $templateKey): bool
    {
        return array_key_exists($templateKey, $this->templates);
    }

    /**
     * @return array{slug: string, name: string, version: string, description: string|null, author: string|null, folder: string, templates: array<string, string>}
     */
    public function toArray(): array
    {
        return [
            'slug' => $this->slug,
            'name' => $this->name,
            'version' => $this->version,
            'description' => $this->description,
            'author' => $this->author,
            'folder' => $this->folder,
            'templates' => $this->templates,
        ];
    }

    /**
     * @param  array{slug: string, name: string, version: string, description: string|null, author: string|null, folder: string, templates: array<string, string>}  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(...$data);
    }
}
