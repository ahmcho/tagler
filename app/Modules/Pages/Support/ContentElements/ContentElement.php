<?php

namespace App\Modules\Pages\Support\ContentElements;

/**
 * One content element type. Each type owns its validation, its cleaning and
 * its output for the public page. Types are registered in config/pages.php.
 */
interface ContentElement
{
    /**
     * The type key stored in the content document, for example `heading`.
     */
    public function key(): string;

    public function label(): string;

    /**
     * Laravel validation rules for the element's `data` array.
     *
     * @return array<string, mixed>
     */
    public function rules(): array;

    /**
     * The editor description: the fields to show, and the values a new element starts with.
     *
     * @return array{defaults: array<string, mixed>, fields: list<array<string, mixed>>}
     */
    public function schema(): array;

    /**
     * Human-readable messages for the element's rules, keyed like `field.rule`.
     *
     * @return array<string, string>
     */
    public function messages(): array;

    /**
     * The permission a user needs to save this element type, or null when anyone who can edit a page may save it.
     */
    public function requiresPermission(): ?string;

    /**
     * Cleans validated data before it is stored. For example, raw HTML is sanitised here.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function normalize(array $data): array;

    /**
     * The props the public view renders for this element.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function present(array $data): array;
}
