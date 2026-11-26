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
import { $getNodeByKey, DecoratorNode } from 'lexical';
import type { ReactElement } from 'react';

import { InlineImageView } from './inline-image-view';
import { normalizeImageWidth, readImageWidth } from './inline-image-width';

export type InlineImagePosition = 'left' | 'right' | 'full';

export type InlineImagePayload = {
    src: string;
    altText: string;
    caption: string;
    position: InlineImagePosition;
    width: number;
};

type SerializedInlineImageNode = Spread<
    InlineImagePayload,
    SerializedLexicalNode
>;

const POSITIONS: readonly InlineImagePosition[] = ['left', 'right', 'full'];

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
        width: readImageWidth(img.getAttribute('data-width')),
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
            width: readImageWidth(element.getAttribute('data-width')),
        }),
    };
}

/** Sets the width of the image node with this key. Call it inside an editor update. */
function $setImageWidth(key: NodeKey, width: number): void {
    const node = $getNodeByKey(key);

    if ($isInlineImageNode(node)) {
        node.setWidth(width);
    }
}

/** Sets the position of the image node with this key. Call it inside an editor update. */
function $setImagePosition(key: NodeKey, position: InlineImagePosition): void {
    const node = $getNodeByKey(key);

    if ($isInlineImageNode(node)) {
        node.setPosition(position);
    }
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
    __width: number;

    static getType(): string {
        return 'inline-image';
    }

    static clone(node: InlineImageNode): InlineImageNode {
        return new InlineImageNode(
            node.__src,
            node.__altText,
            node.__caption,
            node.__position,
            node.__width,
            node.__key,
        );
    }

    static importJSON(serialized: SerializedInlineImageNode): InlineImageNode {
        return $createInlineImageNode({
            ...serialized,
            width: normalizeImageWidth(serialized.width ?? 100),
        });
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
        width: number,
        key?: NodeKey,
    ) {
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__caption = caption;
        this.__position = position;
        this.__width = width;
    }

    exportDOM(): DOMExportOutput {
        const figure = document.createElement('figure');
        const img = document.createElement('img');

        figure.setAttribute('data-position', this.__position);
        figure.style.width = `${this.__width}%`;
        img.setAttribute('src', this.__src);
        img.setAttribute('alt', this.__altText);
        img.setAttribute('data-width', String(this.__width));
        img.style.width = '100%';
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
            width: this.__width,
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

    getWidth(): number {
        return this.__width;
    }

    setWidth(width: number): void {
        this.getWritable().__width = normalizeImageWidth(width);
    }

    setPosition(position: InlineImagePosition): void {
        this.getWritable().__position = position;
    }

    createDOM(): HTMLElement {
        return document.createElement('div');
    }

    updateDOM(): false {
        return false;
    }

    decorate(): ReactElement {
        const key = this.getKey();

        return (
            <InlineImageView
                nodeKey={key}
                src={this.__src}
                altText={this.__altText}
                caption={this.__caption}
                position={this.__position}
                width={this.__width}
                onCommitWidth={(width) => $setImageWidth(key, width)}
                onCommitPosition={(position) =>
                    $setImagePosition(key, position)
                }
            />
        );
    }
}

export function $createInlineImageNode({
    src,
    altText,
    caption,
    position,
    width,
    key,
}: InlineImagePayload & { key?: NodeKey }): InlineImageNode {
    return new InlineImageNode(src, altText, caption, position, width, key);
}

export function $isInlineImageNode(
    node: LexicalNode | null | undefined,
): node is InlineImageNode {
    return node instanceof InlineImageNode;
}

/** An image on its own line, written as `![alt](src)`. Caption, position and width are not kept in Markdown. */
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
                width: 100,
            }),
        );

        return true;
    },
    export: (node) =>
        $isInlineImageNode(node)
            ? `![${node.getAltText()}](${node.getSrc()})`
            : null,
};
