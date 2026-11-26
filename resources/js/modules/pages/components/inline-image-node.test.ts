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
import { normalizeImageWidth } from './inline-image-width';

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
                        width: 50,
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

    it('keeps the width in the saved JSON', () => {
        const editor = createEditor();

        editor.update(
            () => {
                $getRoot().append(
                    $createInlineImageNode({
                        src: '/media/c.png',
                        altText: 'Chart',
                        caption: '',
                        position: 'full',
                        width: 50,
                    }),
                );
            },
            { discrete: true },
        );

        editor.getEditorState().read(() => {
            const [child] = $getRoot().getChildren();

            expect($isInlineImageNode(child)).toBe(true);
            expect(child.exportJSON()).toMatchObject({ width: 50 });
        });
    });

    it('keeps a width between 1 and 100 percent', () => {
        expect(normalizeImageWidth(0)).toBe(1);
        expect(normalizeImageWidth(42.6)).toBe(43);
        expect(normalizeImageWidth(250)).toBe(100);
        expect(normalizeImageWidth(Number.NaN)).toBe(100);
    });

    it('stores a width set by a drag, rounded and kept in range', () => {
        const editor = createEditor();

        editor.update(
            () => {
                $getRoot().append(
                    $createInlineImageNode({
                        src: '/media/d.png',
                        altText: 'Dock',
                        caption: '',
                        position: 'full',
                        width: 100,
                    }),
                );
            },
            { discrete: true },
        );

        editor.update(
            () => {
                const [child] = $getRoot().getChildren();

                if ($isInlineImageNode(child)) {
                    child.setWidth(42.6);
                }
            },
            { discrete: true },
        );

        editor.getEditorState().read(() => {
            const [child] = $getRoot().getChildren();

            expect(child.exportJSON()).toMatchObject({ width: 43 });
        });
    });

    it('stores a position set after the image is added', () => {
        const editor = createEditor();

        editor.update(
            () => {
                $getRoot().append(
                    $createInlineImageNode({
                        src: '/media/e.png',
                        altText: 'Mast',
                        caption: '',
                        position: 'full',
                        width: 100,
                    }),
                );
            },
            { discrete: true },
        );

        editor.update(
            () => {
                const [child] = $getRoot().getChildren();

                if ($isInlineImageNode(child)) {
                    child.setPosition('right');
                }
            },
            { discrete: true },
        );

        editor.getEditorState().read(() => {
            const [child] = $getRoot().getChildren();

            expect(child.exportJSON()).toMatchObject({ position: 'right' });
        });
    });
});
