import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { CLICK_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical';
import type { NodeKey } from 'lexical';
import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';

import { Button } from '@/components/tailgrids/core/button';
import { cn } from '@/utils/cn';

import type { InlineImagePosition } from './inline-image-node';
import { maxWidthForPosition, widthFromDrag } from './inline-image-width';

const POSITION_OPTIONS: [InlineImagePosition, string][] = [
    ['left', 'Left'],
    ['right', 'Right'],
    ['full', 'Full width'],
];

const POSITION_CLASSES: Record<InlineImagePosition, string> = {
    left: 'my-2 mr-4 float-left max-w-[50%]',
    right: 'my-2 ml-4 float-right max-w-[50%]',
    full: 'my-4 w-full',
};

type DragState = {
    pointerId: number;
    startX: number;
    startPercent: number;
    parentPx: number;
    direction: 1 | -1;
};

type InlineImageViewProps = {
    nodeKey: NodeKey;
    src: string;
    altText: string;
    caption: string;
    position: InlineImagePosition;
    width: number;
    onCommitWidth: (width: number) => void;
    onCommitPosition: (position: InlineImagePosition) => void;
};

/**
 * The image in the editor. When selected, it shows a box with a handle. Dragging the
 * handle changes the width. The new width is saved once, when the drag ends.
 */
export function InlineImageView({
    nodeKey,
    src,
    altText,
    caption,
    position,
    width,
    onCommitWidth,
    onCommitPosition,
}: InlineImageViewProps) {
    const [editor] = useLexicalComposerContext();
    const isEditable = useLexicalEditable();
    const [isSelected, setSelected] = useLexicalNodeSelection(nodeKey);
    const figureRef = useRef<HTMLElement>(null);
    const dragRef = useRef<DragState | null>(null);
    const draftRef = useRef<number | null>(null);
    const [draftWidth, setDraftWidth] = useState<number | null>(null);

    // The handle sits on the side that faces away from the text. Right-floated images grow to the left.
    const handleSide = position === 'right' ? 'left' : 'right';

    useEffect(
        () =>
            editor.registerCommand(
                CLICK_COMMAND,
                (event) => {
                    if (figureRef.current?.contains(event.target as Node)) {
                        setSelected(true);
                    }

                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
        [editor, setSelected],
    );

    const handlePointerDown = (event: PointerEvent<HTMLSpanElement>) => {
        const figure = figureRef.current;
        const parent = figure?.parentElement;

        if (!figure || !parent || parent.clientWidth === 0) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startPercent:
                (figure.getBoundingClientRect().width / parent.clientWidth) *
                100,
            parentPx: parent.clientWidth,
            direction: handleSide === 'right' ? 1 : -1,
        };
    };

    const handlePointerMove = (event: PointerEvent<HTMLSpanElement>) => {
        const drag = dragRef.current;

        if (!drag || drag.pointerId !== event.pointerId) {
            return;
        }

        const next = widthFromDrag(
            drag.startPercent,
            drag.direction * (event.clientX - drag.startX),
            drag.parentPx,
            maxWidthForPosition(position),
        );

        draftRef.current = next;
        setDraftWidth(next);
    };

    const handlePointerEnd = (event: PointerEvent<HTMLSpanElement>) => {
        if (dragRef.current?.pointerId !== event.pointerId) {
            return;
        }

        dragRef.current = null;

        const finalWidth = draftRef.current;

        draftRef.current = null;
        setDraftWidth(null);

        if (finalWidth !== null) {
            editor.update(() => onCommitWidth(finalWidth));
        }
    };

    const showControls = isSelected && isEditable;

    return (
        <figure
            ref={figureRef}
            data-position={position}
            className={cn(
                POSITION_CLASSES[position],
                'relative',
                showControls && 'ring-2 ring-primary-500',
            )}
            style={{ width: `${draftWidth ?? width}%` }}
        >
            {showControls && (
                <div className="bg-base-50 absolute top-1 left-1 z-10 flex w-max gap-1 rounded-md p-1 shadow">
                    {POSITION_OPTIONS.map(([value, label]) => (
                        <Button
                            key={value}
                            type="button"
                            size="xs"
                            className="whitespace-nowrap"
                            variant={position === value ? 'primary' : 'ghost'}
                            appearance={position === value ? 'fill' : 'outline'}
                            aria-pressed={position === value}
                            onPress={() =>
                                editor.update(() => onCommitPosition(value))
                            }
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            )}
            <img
                src={src}
                alt={altText}
                data-width={width}
                draggable={false}
                className="h-auto max-w-full rounded-md"
            />
            {caption !== '' && (
                <figcaption className="text-base-500 mt-1 text-sm">
                    {caption}
                </figcaption>
            )}
            {showControls && (
                <span
                    title="Drag to resize"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerEnd}
                    onPointerCancel={handlePointerEnd}
                    className={cn(
                        'absolute bottom-1 size-3 cursor-ew-resize rounded-sm bg-primary-500 ring-2 ring-white',
                        handleSide === 'right' ? 'right-1' : 'left-1',
                    )}
                />
            )}
        </figure>
    );
}
