<?php

use App\Modules\Pages\Services\PageContentValidator;
use App\Modules\Pages\Support\PageContentDocument;
use Illuminate\Support\Str;

const VALIDATOR_SECTION_ID = '11111111-1111-4111-8111-111111111111';
const VALIDATOR_OTHER_SECTION_ID = '33333333-3333-4333-8333-333333333333';

/**
 * @return array{document: array<string, mixed>, errors: array<string, mixed>}
 */
function validateContent(array $document): array
{
    return app(PageContentValidator::class)->validate($document, fn (): bool => true);
}

function validSection(string $id = VALIDATOR_SECTION_ID, array $elements = []): array
{
    return ['id' => $id, 'layout' => 'full-width', 'elements' => $elements];
}

test('a document over the byte limit is rejected', function (): void {
    $document = ['version' => PageContentDocument::VERSION, 'sections' => [], 'padding' => str_repeat('a', 512 * 1024)];

    expect(validateContent($document)['errors'])
        ->toBe(['content' => __('pages.errors.content_too_large')]);
});

test('an unsupported document version is rejected', function (): void {
    $document = ['version' => PageContentDocument::VERSION + 1, 'sections' => []];

    expect(validateContent($document)['errors'])
        ->toBe(['content.version' => __('pages.errors.content_version_unsupported')]);
});

test('sections that are not a list return the document unchanged', function (): void {
    $document = ['version' => PageContentDocument::VERSION, 'sections' => ['first' => validSection()]];

    $result = validateContent($document);

    expect($result['errors'])->toBe(['content.sections' => __('pages.errors.content_sections_invalid')])
        ->and($result['document'])->toBe($document);
});

test('too many sections is rejected', function (): void {
    config()->set('modules.pages.limits.max_sections', 1);

    $document = ['version' => PageContentDocument::VERSION, 'sections' => [
        validSection(VALIDATOR_SECTION_ID),
        validSection(VALIDATOR_OTHER_SECTION_ID),
    ]];

    expect(validateContent($document)['errors'])
        ->toBe(['content.sections' => __('pages.errors.content_too_many_sections')]);
});

test('a section that is not an object is rejected by its index', function (): void {
    $document = ['version' => PageContentDocument::VERSION, 'sections' => [validSection(), 'not-a-section']];

    expect(validateContent($document)['errors'])
        ->toBe(['content.sections.1' => __('pages.errors.content_section_invalid')]);
});

test('a malformed section id is rejected', function (): void {
    $document = ['version' => PageContentDocument::VERSION, 'sections' => [validSection('not-a-uuid')]];

    expect(validateContent($document)['errors'])
        ->toBe(['content.sections.0.id' => __('pages.errors.invalid_id')]);
});

test('a duplicate section id is rejected', function (): void {
    $document = ['version' => PageContentDocument::VERSION, 'sections' => [
        validSection(VALIDATOR_SECTION_ID),
        validSection(VALIDATOR_SECTION_ID),
    ]];

    expect(validateContent($document)['errors'])
        ->toBe(['content.sections.1.id' => __('pages.errors.duplicate_id')]);
});

test('an element id that repeats a section id is rejected', function (): void {
    $element = ['id' => VALIDATOR_SECTION_ID, 'type' => 'heading', 'version' => 1, 'data' => ['text' => 'Hi', 'level' => 2]];
    $document = ['version' => PageContentDocument::VERSION, 'sections' => [validSection(VALIDATOR_SECTION_ID, [$element])]];

    expect(validateContent($document)['errors'])
        ->toBe(['content.sections.0.elements.0.id' => __('pages.errors.duplicate_id')]);
});

test('a section whose elements are not a list is rejected', function (): void {
    $document = ['version' => PageContentDocument::VERSION, 'sections' => [validSection(VALIDATOR_SECTION_ID, ['a' => []])]];

    expect(validateContent($document)['errors'])
        ->toBe(['content.sections.0.elements' => __('pages.errors.content_elements_invalid')]);
});

test('an element that is not an object or has no type is rejected', function (): void {
    $document = ['version' => PageContentDocument::VERSION, 'sections' => [validSection(VALIDATOR_SECTION_ID, [['data' => []]])]];

    expect(validateContent($document)['errors'])
        ->toBe(['content.sections.0.elements.0' => __('pages.errors.content_element_invalid')]);
});

test('a valid document has no errors and gets ids for items that have none', function (): void {
    $document = ['version' => PageContentDocument::VERSION, 'sections' => [[
        'layout' => 'full-width',
        'elements' => [['type' => 'heading', 'version' => 1, 'data' => ['text' => 'Hi', 'level' => 2]]],
    ]]];

    $result = validateContent($document);

    expect($result['errors'])->toBe([])
        ->and(Str::isUuid($result['document']['sections'][0]['id']))->toBeTrue()
        ->and(Str::isUuid($result['document']['sections'][0]['elements'][0]['id']))->toBeTrue();
});
