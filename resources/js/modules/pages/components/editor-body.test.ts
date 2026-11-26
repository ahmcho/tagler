import { createHeadlessEditor } from '@lexical/headless';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { describe, expect, it } from 'vitest';

import { $isBodyEmpty } from './editor-body';
import { $createInlineImageNode, InlineImageNode } from './inline-image-node';

function createEditor() {
    return createHeadlessEditor({
        namespace: 'test',
        nodes: [InlineImageNode],
        onError: (error) => {
            throw error;
        },
    });
}

function isBodyEmptyAfter(build: () => void): boolean {
    const editor = createEditor();

    editor.update(build, { discrete: true });

    return editor.getEditorState().read(() => $isBodyEmpty());
}

describe('body emptiness', () => {
    it('is empty with no text and no image', () => {
        expect(isBodyEmptyAfter(() => {})).toBe(true);
    });

    it('is not empty with only an image', () => {
        expect(
            isBodyEmptyAfter(() => {
                $getRoot().append(
                    $createInlineImageNode({
                        src: '/media/f.png',
                        altText: '',
                        caption: '',
                        position: 'full',
                        width: 100,
                    }),
                );
            }),
        ).toBe(false);
    });

    it('is not empty with only text', () => {
        expect(
            isBodyEmptyAfter(() => {
                $getRoot().append(
                    $createParagraphNode().append($createTextNode('Hello')),
                );
            }),
        ).toBe(false);
    });
});
