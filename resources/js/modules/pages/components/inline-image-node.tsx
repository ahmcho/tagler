/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Adapted from infonomic/lexical-inline-image-plugin (MIT).
 */
import type { ElementTransformer } from '@lexical/markdown';
import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';
import { DecoratorNode } from 'lexical';
import type { ReactElement } from 'react';

export type InlineImagePosition = 'left' | 'right' | 'full';

export type InlineImagePayload = {
    src: string;
    altText: string;
    caption: string;
    position: InlineImagePosition;
};

type SerializedInlineImageNode = Spread<
    InlineImagePayload,
    SerializedLexicalNode
>;

const POSITIONS: readonly InlineImagePosition[] = ['left', 'right', 'full'];

const POSITION_CLASSES: Record<InlineImagePosition, string> = {
    left: 'my-2 mr-4 float-left max-w-[50%]',
    right: 'my-2 ml-4 float-right max-w-[50%]',
    full: 'my-4 w-full',
};

/** Reads the position from `data-position`. Anything unknown falls back to `full`. */
function readPosition(value: string | null): InlineImagePosition {
    return POSITIONS.find((position) => position === value) ?? 'full';
}

/** A figure with an image. The caption is kept only when the figure has a figcaption. */
function convertFigure(figure: HTMLElement): DOMConversionOutput | null {
    const img = figure.querySelector('img');

    if (!img) {
        return null;
    }

    const node = $createInlineImageNode({
        src: img.getAttribute('src') ?? '',
        altText: img.getAttribute('alt') ?? '',
        caption: figure.querySelector('figcaption')?.textContent ?? '',
        position: readPosition(figure.getAttribute('data-position')),
    });

    // The figure's children are already read into the node, so drop them.
    return { node, after: () => [] };
}

/** A bare image, for example one pasted into the editor. */
function convertImage(element: HTMLElement): DOMConversionOutput {
    return {
        node: $createInlineImageNode({
            src: element.getAttribute('src') ?? '',
            altText: element.getAttribute('alt') ?? '',
            caption: '',
            position: 'full',
        }),
    };
}

/**
 * Block image node. It is stored as a figure, so it sits at the top level of the body
 * and never inside a paragraph.
 */
export class InlineImageNode extends DecoratorNode<ReactElement> {
    __src: string;
    __altText: string;
    __caption: string;
    __position: InlineImagePosition;

    static getType(): string {
        return 'inline-image';
    }

    static clone(node: InlineImageNode): InlineImageNode {
        return new InlineImageNode(
            node.__src,
            node.__altText,
            node.__caption,
            node.__position,
            node.__key,
        );
    }

    static importJSON(serialized: SerializedInlineImageNode): InlineImageNode {
        return $createInlineImageNode(serialized);
    }

    static importDOM(): DOMConversionMap | null {
        return {
            figure: () => ({ conversion: convertFigure, priority: 1 }),
            img: () => ({ conversion: convertImage, priority: 0 }),
        };
    }

    constructor(
        src: string,
        altText: string,
        caption: string,
        position: InlineImagePosition,
        key?: NodeKey,
    ) {
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__caption = caption;
        this.__position = position;
    }

    exportDOM(): DOMExportOutput {
        const figure = document.createElement('figure');
        const img = document.createElement('img');

        figure.setAttribute('data-position', this.__position);
        img.setAttribute('src', this.__src);
        img.setAttribute('alt', this.__altText);
        figure.append(img);

        if (this.__caption !== '') {
            const caption = document.createElement('figcaption');

            caption.textContent = this.__caption;
            figure.append(caption);
        }

        return { element: figure };
    }

    exportJSON(): SerializedInlineImageNode {
        return {
            type: 'inline-image',
            version: 1,
            src: this.__src,
            altText: this.__altText,
            caption: this.__caption,
            position: this.__position,
        };
    }

    isInline(): false {
        return false;
    }

    getSrc(): string {
        return this.__src;
    }

    getAltText(): string {
        return this.__altText;
    }

    getCaption(): string {
        return this.__caption;
    }

    getPosition(): InlineImagePosition {
        return this.__position;
    }

    createDOM(): HTMLElement {
        return document.createElement('div');
    }

    updateDOM(): false {
        return false;
    }

    decorate(): ReactElement {
        return (
            <figure
                data-position={this.__position}
                className={POSITION_CLASSES[this.__position]}
            >
                <img
                    src={this.__src}
                    alt={this.__altText}
                    className="h-auto max-w-full rounded-md"
                />
                {this.__caption !== '' && (
                    <figcaption className="text-base-500 mt-1 text-sm">
                        {this.__caption}
                    </figcaption>
                )}
            </figure>
        );
    }
}

export function $createInlineImageNode({
    src,
    altText,
    caption,
    position,
    key,
}: InlineImagePayload & { key?: NodeKey }): InlineImageNode {
    return new InlineImageNode(src, altText, caption, position, key);
}

export function $isInlineImageNode(
    node: LexicalNode | null | undefined,
): node is InlineImageNode {
    return node instanceof InlineImageNode;
}

/** An image on its own line, written as `![alt](src)`. Caption and position are not kept in Markdown. */
export const INLINE_IMAGE_MARKDOWN: ElementTransformer = {
    type: 'element',
    dependencies: [InlineImageNode],
    regExp: /^!\[([^\]]*)\]\(([^)\s]+)\)$/,
    replace: (parentNode, _children, match) => {
        const [, altText, src] = match;

        parentNode.replace(
            $createInlineImageNode({
                src,
                altText,
                caption: '',
                position: 'full',
            }),
        );

        return true;
    },
    export: (node) =>
        $isInlineImageNode(node)
            ? `![${node.getAltText()}](${node.getSrc()})`
            : null,
};
