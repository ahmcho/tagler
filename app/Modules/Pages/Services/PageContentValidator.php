<?php

namespace App\Modules\Pages\Services;

use App\Modules\Pages\Support\ContentElementRegistry;
use App\Modules\Pages\Support\PageContentDocument;
use Closure;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * Checks and cleans one locale's content document. Known element types are
 * validated and normalised. Unknown types are kept as they are and skipped on
 * output, so a missing element type never blocks a save. Unknown keys are kept.
 */
class PageContentValidator
{
    public function __construct(private readonly ContentElementRegistry $registry) {}

    /**
     * @param  Closure(string): bool  $can  Tells whether the editor holds a permission.
     * @return array{document: array<string, mixed>, errors: array<string, string>}
     */
    public function validate(array $document, Closure $can): array
    {
        $errors = [];
        $limits = config('modules.pages.limits');

        if (strlen((string) json_encode($document)) > $limits['max_document_bytes']) {
            $errors['content'] = __('pages.errors.content_too_large');
        }

        if (($document['version'] ?? null) !== PageContentDocument::VERSION) {
            $errors['content.version'] = __('pages.errors.content_version_unsupported');
        }

        $sections = $document['sections'] ?? null;

        if (! is_array($sections) || ! array_is_list($sections)) {
            $errors['content.sections'] = __('pages.errors.content_sections_invalid');

            return ['document' => $document, 'errors' => $errors];
        }

        if (count($sections) > $limits['max_sections']) {
            $errors['content.sections'] = __('pages.errors.content_too_many_sections');
        }

        $seenIds = [];

        foreach ($sections as $sectionIndex => $section) {
            $path = "content.sections.{$sectionIndex}";

            if (! is_array($section)) {
                $errors[$path] = __('pages.errors.content_section_invalid');

                continue;
            }

            $section['id'] = $this->identifier($section['id'] ?? null, "{$path}.id", $seenIds, $errors);
            $section = $this->validateSection($section, $path, $can, $seenIds, $errors);

            $sections[$sectionIndex] = $section;
        }

        $document['sections'] = $sections;

        return ['document' => $document, 'errors' => $errors];
    }

    /**
     * @param  array<string, mixed>  $section
     * @param  array<string, true>  $seenIds
     * @param  array<string, string>  $errors
     * @return array<string, mixed>
     */
    private function validateSection(array $section, string $path, Closure $can, array &$seenIds, array &$errors): array
    {
        $layouts = config('modules.pages.layouts');

        if (! array_key_exists($section['layout'] ?? '', $layouts)) {
            $errors["{$path}.layout"] = __('pages.errors.content_layout_unknown');
        }

        if (isset($section['enabled']) && ! is_bool($section['enabled'])) {
            $errors["{$path}.enabled"] = __('pages.errors.content_flag_invalid');
        }

        $elements = $section['elements'] ?? [];

        if (! is_array($elements) || ! array_is_list($elements)) {
            $errors["{$path}.elements"] = __('pages.errors.content_elements_invalid');

            return $section;
        }

        if (count($elements) > config('modules.pages.limits.max_elements_per_section')) {
            $errors["{$path}.elements"] = __('pages.errors.content_too_many_elements');
        }

        foreach ($elements as $elementIndex => $element) {
            $elementPath = "{$path}.elements.{$elementIndex}";

            if (! is_array($element) || ! is_string($element['type'] ?? null)) {
                $errors[$elementPath] = __('pages.errors.content_element_invalid');

                continue;
            }

            $element['id'] = $this->identifier($element['id'] ?? null, "{$elementPath}.id", $seenIds, $errors);
            $elements[$elementIndex] = $this->validateElement($element, $elementPath, $can, $errors);
        }

        $section['elements'] = $elements;

        return $section;
    }

    /**
     * @param  array<string, mixed>  $element
     * @param  array<string, string>  $errors
     * @return array<string, mixed>
     */
    private function validateElement(array $element, string $path, Closure $can, array &$errors): array
    {
        $handler = $this->registry->resolve($element['type']);

        if ($handler === null) {
            return $element;
        }

        if (($permission = $handler->requiresPermission()) !== null && ! $can($permission)) {
            $errors["{$path}.type"] = __('pages.errors.content_permission_missing', ['type' => $handler->label()]);

            return $element;
        }

        $data = is_array($element['data'] ?? null) ? $element['data'] : [];
        $validator = Validator::make($data, $handler->rules(), $handler->messages());

        if ($validator->fails()) {
            foreach ($validator->errors()->messages() as $field => $messages) {
                $errors["{$path}.data.{$field}"] = $messages[0];
            }

            return $element;
        }

        $element['data'] = array_merge($data, $handler->normalize($validator->validated()));

        return $element;
    }

    /**
     * Keeps a given UUID or creates one. Duplicate and malformed ids are errors.
     *
     * @param  array<string, true>  $seenIds
     * @param  array<string, string>  $errors
     */
    private function identifier(mixed $value, string $path, array &$seenIds, array &$errors): string
    {
        if ($value === null || $value === '') {
            $id = (string) Str::uuid();
        } elseif (is_string($value) && Str::isUuid($value)) {
            $id = $value;
        } else {
            $errors[$path] = __('pages.errors.invalid_id');

            return '';
        }

        if (isset($seenIds[$id])) {
            $errors[$path] = __('pages.errors.duplicate_id');
        }

        $seenIds[$id] = true;

        return $id;
    }
}
