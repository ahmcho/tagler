import { createHeadlessEditor } from '@lexical/headless';
import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
    TRANSFORMERS,
} from '@lexical/markdown';
import { $getRoot } from 'lexical';
import { describe, expect, it } from 'vitest';

import {
    $createInlineImageNode,
    $isInlineImageNode,
    INLINE_IMAGE_MARKDOWN,
    InlineImageNode,
} from './inline-image-node';

const TRANSFORMERS_WITH_IMAGE = [INLINE_IMAGE_MARKDOWN, ...TRANSFORMERS];

function createEditor() {
    return createHeadlessEditor({
        namespace: 'test',
        nodes: [InlineImageNode],
        onError: (error) => {
            throw error;
        },
    });
}

describe('inline image Markdown', () => {
    it('reads an image line into an image node and writes it back', () => {
        const editor = createEditor();

        editor.update(
            () => {
                $convertFromMarkdownString(
                    '![Harbour at dusk](https://cdn.example.com/a.jpg)',
                    TRANSFORMERS_WITH_IMAGE,
                );
            },
            { discrete: true },
        );

        editor.getEditorState().read(() => {
            const [child] = $getRoot().getChildren();

            expect($isInlineImageNode(child)).toBe(true);
            expect(child).toMatchObject({
                __src: 'https://cdn.example.com/a.jpg',
                __altText: 'Harbour at dusk',
            });
            expect($convertToMarkdownString(TRANSFORMERS_WITH_IMAGE)).toBe(
                '![Harbour at dusk](https://cdn.example.com/a.jpg)',
            );
        });
    });

    it('writes a node created in code as an image line', () => {
        const editor = createEditor();

        editor.update(
            () => {
                $getRoot().append(
                    $createInlineImageNode({
                        src: '/media/b.png',
                        altText: 'Logo',
                        caption: 'Our logo',
                        position: 'right',
                    }),
                );
            },
            { discrete: true },
        );

        editor.getEditorState().read(() => {
            expect($convertToMarkdownString(TRANSFORMERS_WITH_IMAGE)).toBe(
                '![Logo](/media/b.png)',
            );
        });
    });
});
