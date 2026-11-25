import { closestCenter, DndContext } from '@dnd-kit/core';
import type { DragEndEvent, useSensors } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, Copy, GripVertical, Trash2 } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Button } from '@/components/tailgrids/core/button';
import {
    Select,
    SelectContent,
    SelectIndicator,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/tailgrids/core/select';
import { Toggle } from '@/components/tailgrids/core/toggle';
import type {
    ContentEditorConfig,
    ContentElement,
    ContentElementType,
    ContentSection,
} from '@/modules/pages/components/content-document';
import { newId } from '@/modules/pages/components/content-document';
import {
    ErrorText,
    SortableElement,
} from '@/modules/pages/components/content-element-editor';

type SectionCardProps = {
    section: ContentSection;
    index: number;
    count: number;
    config: ContentEditorConfig;
    elementTypes: ContentElementType[];
    typeByKey: Map<string, ContentElementType>;
    sensors: ReturnType<typeof useSensors>;
    errorFor: (path: string) => string | undefined;
    onUpdate: (patch: Partial<ContentSection>) => void;
    onUpdateElements: (elements: ContentElement[]) => void;
    onMove: (direction: -1 | 1) => void;
    onDuplicate: () => void;
    onRemove: () => void;
};

/** One section. It is sortable in the section list, and its elements are sortable inside it. */
export function SectionCard({
    section,
    index,
    count,
    config,
    elementTypes,
    typeByKey,
    sensors,
    errorFor,
    onUpdate,
    onUpdateElements,
    onMove,
    onDuplicate,
    onRemove,
}: SectionCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.id });
    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
    };

    const backgroundError =
        errorFor(`sections.${index}.settings.background`) ??
        errorFor(`sections.${index}.settings`);

    const handleElementDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const from = section.elements.findIndex(
            (element) => element.id === active.id,
        );
        const to = section.elements.findIndex(
            (element) => element.id === over.id,
        );

        if (from >= 0 && to >= 0) {
            onUpdateElements(arrayMove(section.elements, from, to));
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-background space-y-4 rounded-xl border border-base-300 p-4"
        >
            <div className="flex flex-wrap items-end gap-3">
                <button
                    ref={setActivatorNodeRef}
                    type="button"
                    aria-label="Drag to reorder section"
                    className="hover:bg-base-100 mb-1 cursor-grab touch-none rounded p-1 text-title-50 active:cursor-grabbing"
                    {...attributes}
                    tabIndex={-1}
                    {...listeners}
                >
                    <GripVertical className="size-4" />
                </button>

                <div className="min-w-56 flex-1">
                    <Select
                        value={section.layout}
                        onChange={(key) => onUpdate({ layout: String(key) })}
                        isInvalid={Boolean(
                            errorFor(`sections.${index}.layout`),
                        )}
                    >
                        <SelectLabel>Layout</SelectLabel>
                        <SelectTrigger>
                            <SelectValue />
                            <SelectIndicator />
                        </SelectTrigger>
                        <SelectContent>
                            {config.layouts.map((layout) => (
                                <SelectItem key={layout.key} id={layout.key}>
                                    {layout.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <ErrorText message={errorFor(`sections.${index}.layout`)} />
                </div>

                <div className="min-w-44 flex-1">
                    <Select
                        value={String(section.settings?.background ?? 'none')}
                        onChange={(key) =>
                            onUpdate({
                                settings: {
                                    ...section.settings,
                                    background: String(key),
                                },
                            })
                        }
                        isInvalid={Boolean(backgroundError)}
                    >
                        <SelectLabel>Background</SelectLabel>
                        <SelectTrigger>
                            <SelectValue />
                            <SelectIndicator />
                        </SelectTrigger>
                        <SelectContent>
                            {config.backgrounds.map((background) => (
                                <SelectItem
                                    key={background.key}
                                    id={background.key}
                                >
                                    {background.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <ErrorText message={backgroundError} />
                </div>

                <Toggle
                    label="Shown on the page"
                    checked={section.enabled !== false}
                    onChange={(event) =>
                        onUpdate({ enabled: event.target.checked })
                    }
                />

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        iconOnly
                        aria-label="Move section up"
                        disabled={index === 0}
                        onPress={() => onMove(-1)}
                    >
                        <ArrowUp className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        iconOnly
                        aria-label="Move section down"
                        disabled={index === count - 1}
                        onPress={() => onMove(1)}
                    >
                        <ArrowDown className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        iconOnly
                        aria-label="Duplicate section"
                        onPress={onDuplicate}
                    >
                        <Copy className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        iconOnly
                        aria-label="Remove section"
                        onPress={onRemove}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleElementDragEnd}
            >
                <SortableContext
                    items={section.elements.map((element) => element.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {section.elements.map((element, elementIndex) => (
                        <SortableElement
                            key={element.id}
                            element={element}
                            type={typeByKey.get(element.type)}
                            isFirst={elementIndex === 0}
                            isLast={
                                elementIndex === section.elements.length - 1
                            }
                            errorFor={(path) =>
                                errorFor(
                                    `sections.${index}.elements.${elementIndex}.${path}`,
                                )
                            }
                            onChange={(next) =>
                                onUpdateElements(
                                    section.elements.map((item, i) =>
                                        i === elementIndex ? next : item,
                                    ),
                                )
                            }
                            onMove={(direction) => {
                                const target = elementIndex + direction;

                                if (
                                    target >= 0 &&
                                    target < section.elements.length
                                ) {
                                    onUpdateElements(
                                        arrayMove(
                                            section.elements,
                                            elementIndex,
                                            target,
                                        ),
                                    );
                                }
                            }}
                            onRemove={() =>
                                onUpdateElements(
                                    section.elements.filter(
                                        (_, i) => i !== elementIndex,
                                    ),
                                )
                            }
                        />
                    ))}
                </SortableContext>
            </DndContext>

            <Select
                value={null}
                onChange={(key) => {
                    const type = typeByKey.get(String(key));

                    if (type) {
                        onUpdateElements([
                            ...section.elements,
                            {
                                id: newId(),
                                type: type.type,
                                version: 1,
                                data: structuredClone(type.schema.defaults),
                            },
                        ]);
                    }
                }}
            >
                <SelectLabel>Add element</SelectLabel>
                <SelectTrigger>
                    <SelectValue>Choose an element type</SelectValue>
                    <SelectIndicator />
                </SelectTrigger>
                <SelectContent>
                    {elementTypes.map((type) => (
                        <SelectItem key={type.type} id={type.type}>
                            {type.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
