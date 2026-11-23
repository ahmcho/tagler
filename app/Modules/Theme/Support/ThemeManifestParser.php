<?php

namespace App\Modules\Theme\Support;

use App\Modules\Theme\Exceptions\InvalidThemeException;
use JsonException;
use Opis\JsonSchema\Validator;

/**
 * Reads and checks one theme folder. It parses `theme.json` only. It never includes or runs any file from the
 * folder, so an untrusted theme cannot execute code while it is read.
 */
final class ThemeManifestParser
{
    private const string SCHEMA_PATH = __DIR__.'/../config/theme-manifest.schema.json';

    private const int MAX_MANIFEST_BYTES = 65536;

    /**
     * @throws InvalidThemeException
     */
    public function parse(string $folder): ThemeManifest
    {
        $json = $this->readManifest($folder);

        $result = (new Validator)->validate($this->decode($json, false), $this->schema());

        if (! $result->isValid()) {
            throw new InvalidThemeException('theme.json is invalid: '.$result->error()?->message());
        }

        /** @var array<string, mixed> $data */
        $data = $this->decode($json, true);

        $slug = (string) $data['slug'];

        if ($slug !== basename($folder)) {
            throw new InvalidThemeException("The slug \"{$slug}\" must equal the folder name \"".basename($folder).'".');
        }

        /** @var array{tagler: string, php: string} $requires */
        $requires = $data['requires'];
        /** @var array<string, string> $templates */
        $templates = $data['templates'];

        if (! is_file($folder.'/resources/js/index.tsx')) {
            throw new InvalidThemeException('The entry module "resources/js/index.tsx" is missing.');
        }

        foreach ($templates as $templateKey => $templateFile) {
            if (! is_file("{$folder}/resources/js/templates/{$templateFile}.tsx")) {
                throw new InvalidThemeException("The template \"{$templateKey}\" needs resources/js/templates/{$templateFile}.tsx.");
            }
        }

        $this->assertTaglerCompatible($requires['tagler']);
        $this->assertPhpCompatible($requires['php']);

        return new ThemeManifest(
            slug: $slug,
            name: (string) $data['name'],
            version: (string) $data['version'],
            description: isset($data['description']) ? (string) $data['description'] : null,
            author: isset($data['author']) ? (string) $data['author'] : null,
            folder: $folder,
            templates: $templates,
        );
    }

    /**
     * @throws InvalidThemeException
     */
    private function readManifest(string $folder): string
    {
        $file = $folder.'/theme.json';

        if (! is_file($file) || is_link($file)) {
            throw new InvalidThemeException('theme.json is missing or is a link.');
        }

        if (filesize($file) > self::MAX_MANIFEST_BYTES) {
            throw new InvalidThemeException('theme.json is larger than '.self::MAX_MANIFEST_BYTES.' bytes.');
        }

        return (string) file_get_contents($file);
    }

    /**
     * @return ($associative is true ? array<string, mixed> : object)
     *
     * @throws InvalidThemeException
     */
    private function decode(string $json, bool $associative): array|object
    {
        try {
            return json_decode($json, $associative, 32, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new InvalidThemeException('theme.json is not valid JSON: '.$exception->getMessage(), previous: $exception);
        }
    }

    private function schema(): object
    {
        return json_decode((string) file_get_contents(self::SCHEMA_PATH), false, 32, JSON_THROW_ON_ERROR);
    }

    /**
     * @throws InvalidThemeException
     */
    private function assertTaglerCompatible(string $constraint): void
    {
        $required = (int) explode('.', ltrim($constraint, '^'))[0];
        $provided = (int) explode('.', (string) config('modules.theme.tagler_version'))[0];

        if ($required !== $provided) {
            throw new InvalidThemeException("The theme requires Tagler {$constraint}. This CMS provides version ".config('modules.theme.tagler_version').'.');
        }
    }

    /**
     * @throws InvalidThemeException
     */
    private function assertPhpCompatible(string $constraint): void
    {
        $minimum = ltrim($constraint, '^');

        if (version_compare(PHP_VERSION, $minimum.'.0', '<')) {
            throw new InvalidThemeException("The theme requires PHP {$constraint}. This server runs PHP ".PHP_VERSION.'.');
        }
    }
}
