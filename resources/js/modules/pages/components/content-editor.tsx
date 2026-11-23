import {
    closestCenter,
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type {
    DragEndEvent,
    DraggableAttributes,
    DraggableSyntheticListeners,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    ArrowDown,
    ArrowUp,
    Copy,
    GripVertical,
    Plus,
    Trash2,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useSyncExternalStore } from 'react';
import { Button } from '@/components/tailgrids/core/button';
import { FieldError, FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import {
    Select,
    SelectContent,
    SelectIndicator,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/tailgrids/core/select';
import { TextField } from '@/components/tailgrids/core/text-field';
import { Toggle } from '@/components/tailgrids/core/toggle';
import type {
    ContentDocument,
    JsonValue,
    ContentEditorConfig,
    ContentElement,
    ContentElementField,
    ContentElementType,
    ContentSection,
} from '@/modules/pages/components/content-document';
import { newId } from '@/modules/pages/components/content-document';
import { RichTextEditor } from '@/modules/pages/components/rich-text-editor';

type Props = {
    value: ContentDocument;
    onChange: (next: ContentDocument) => void;
    config: ContentEditorConfig;
    /** Returns the server error for a path inside the document, for example `sections.0.layout`. */
    errorFor: (path: string) => string | undefined;
};

/**
 * Visual editor for one locale's content: sections in order, each with its
 * layout and elements. Element fields come from each element's schema on the
 * server. Unknown types and keys are kept as they are.
 */
export function ContentEditor(props: Props) {
    // Drag and drop assigns ids in the browser. Rendering only after mount keeps server and client markup equal.
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    if (!mounted) {
        return <p className="text-sm text-title-50">Loading sections…</p>;
    }

    return <SectionList {...props} />;
}

function SectionList({ value, onChange, config, errorFor }: Props) {
    const sections = value.sections;
    const elementTypes = config.elementTypes.filter(
        (type) => type.requiresPermission === null || config.canUseHtml,
    );
    const typeByKey = new Map(
        config.elementTypes.map((type) => [type.type, type]),
    );
    // Keyboard users move sections and elements with the up and down buttons.
    // Keyboard drag did not move items in the browser, so the grips are pointer only.
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    const commit = (nextSections: ContentSection[]) =>
        onChange({ ...value, sections: nextSections });

    const updateSection = (index: number, patch: Partial<ContentSection>) =>
        commit(
            sections.map((section, i) =>
                i === index ? { ...section, ...patch } : section,
            ),
        );

    const updateElements = (index: number, elements: ContentElement[]) =>
        updateSection(index, { elements });

    const addSection = () =>
        commit([
            ...sections,
            {
                id: newId(),
                layout: config.layouts[0]?.key ?? 'full-width',
                enabled: true,
                settings: {},
                elements: [],
            },
        ]);

    const duplicateSection = (index: number) => {
        const copy = structuredClone(sections[index]);
        copy.id = newId();
        copy.elements = copy.elements.map((element) => ({
            ...element,
            id: newId(),
        }));
        commit([
            ...sections.slice(0, index + 1),
            copy,
            ...sections.slice(index + 1),
        ]);
    };

    const handleSectionDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const from = sections.findIndex((section) => section.id === active.id);
        const to = sections.findIndex((section) => section.id === over.id);

        if (from >= 0 && to >= 0) {
            commit(arrayMove(sections, from, to));
        }
    };

    const sectionError = errorFor('sections');

    return (
        <div className="space-y-4">
            {sectionError && (
                <p className="text-sm text-input-error">{sectionError}</p>
            )}

            {sections.length === 0 && (
                <p className="text-sm text-title-50">
                    This language has no sections yet.
                </p>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSectionDragEnd}
            >
                <SortableContext
                    items={sections.map((section) => section.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {sections.map((section, index) => (
                        <SectionCard
                            key={section.id}
                            section={section}
                            index={index}
                            count={sections.length}
                            config={config}
                            elementTypes={elementTypes}
                            typeByKey={typeByKey}
                            sensors={sensors}
                            errorFor={errorFor}
                            onUpdate={(patch) => updateSection(index, patch)}
                            onUpdateElements={(elements) =>
                                updateElements(index, elements)
                            }
                            onMove={(direction) => {
                                const target = index + direction;

                                if (target >= 0 && target < sections.length) {
                                    commit(arrayMove(sections, index, target));
                                }
                            }}
                            onDuplicate={() => duplicateSection(index)}
                            onRemove={() =>
                                commit(sections.filter((_, i) => i !== index))
                            }
                        />
                    ))}
                </SortableContext>
            </DndContext>

            <Button
                type="button"
                variant="primary"
                appearance="outline"
                onPress={addSection}
            >
                <Plus className="size-4" />
                Add section
            </Button>
        </div>
    );
}

type DragHandleProps = {
    attributes: DraggableAttributes;
    listeners: DraggableSyntheticListeners;
    label: string;
};

/** The grip button. Pointer and touch drag from here. It is out of the tab order. */
function DragHandle({ attributes, listeners, label }: DragHandleProps) {
    return (
        <button
            type="button"
            aria-label={label}
            className="hover:bg-base-100 cursor-grab touch-none rounded p-1 text-title-50 active:cursor-grabbing"
            {...attributes}
            tabIndex={-1}
            {...listeners}
        >
            <GripVertical className="size-4" />
        </button>
    );
}

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
function SectionCard({
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

type SortableElementProps = Omit<ElementEditorProps, 'dragHandle'>;

/** An element that can be dragged inside its section. */
function SortableElement(props: SortableElementProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props.element.id,
    });
    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <ElementEditor
                {...props}
                dragHandle={
                    <DragHandle
                        attributes={attributes}
                        listeners={listeners}
                        label="Drag to reorder element"
                    />
                }
            />
        </div>
    );
}

type ElementEditorProps = {
    element: ContentElement;
    dragHandle: ReactNode;
    type: ContentElementType | undefined;
    isFirst: boolean;
    isLast: boolean;
    errorFor: (path: string) => string | undefined;
    onChange: (next: ContentElement) => void;
    onMove: (direction: -1 | 1) => void;
    onRemove: () => void;
};

function ElementEditor({
    element,
    dragHandle,
    type,
    isFirst,
    isLast,
    errorFor,
    onChange,
    onMove,
    onRemove,
}: ElementEditorProps) {
    const toolbar = (
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                {dragHandle}
                <p className="text-sm font-medium text-title-50">
                    {type ? type.label : `Unavailable element: ${element.type}`}
                </p>
            </div>
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    iconOnly
                    aria-label="Move element up"
                    disabled={isFirst}
                    onPress={() => onMove(-1)}
                >
                    <ArrowUp className="size-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    iconOnly
                    aria-label="Move element down"
                    disabled={isLast}
                    onPress={() => onMove(1)}
                >
                    <ArrowDown className="size-4" />
                </Button>
                <Button
                    type="button"
                    variant="danger"
                    iconOnly
                    aria-label="Remove element"
                    onPress={onRemove}
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>
        </div>
    );

    if (!type) {
        return (
            <div className="space-y-2 rounded-lg border border-dashed border-base-300 p-3">
                {toolbar}
                <p className="text-sm text-title-50">
                    This element type is not registered. It is kept in the
                    content but not shown on the page.
                </p>
            </div>
        );
    }

    const setData = (name: string, data: JsonValue) =>
        onChange({ ...element, data: { ...element.data, [name]: data } });

    return (
        <div className="space-y-4 rounded-lg border border-base-300 bg-background-50 p-3">
            {toolbar}
            <ErrorText message={errorFor('type')} />

            {type.schema.fields.map((field) => (
                <FieldInput
                    key={field.name}
                    field={field}
                    value={element.data[field.name]}
                    error={errorFor(`data.${field.name}`)}
                    onChange={(next) => setData(field.name, next)}
                />
            ))}
        </div>
    );
}

function FieldInput({
    field,
    value,
    error,
    onChange,
}: {
    field: ContentElementField;
    value: unknown;
    error: string | undefined;
    onChange: (next: JsonValue) => void;
}) {
    const text = value === undefined || value === null ? '' : String(value);

    if (field.type === 'rich') {
        return (
            <div className="flex flex-col gap-1.5">
                <FieldLabel>{field.label}</FieldLabel>
                <RichTextEditor
                    value={text}
                    onChange={onChange}
                    invalid={Boolean(error)}
                />
                <ErrorText message={error} />
            </div>
        );
    }

    if (field.type === 'textarea') {
        return (
            <div className="flex flex-col gap-1.5">
                <FieldLabel>{field.label}</FieldLabel>
                <textarea
                    value={text}
                    onChange={(event) => onChange(event.target.value)}
                    rows={4}
                    aria-invalid={Boolean(error)}
                    className="w-full rounded-lg border border-base-300 bg-input-background px-4 py-2.5 text-title-50 outline-none focus:border-input-primary-focus-border"
                />
                <ErrorText message={error} />
            </div>
        );
    }

    if (field.type === 'select') {
        const options = field.options ?? [];

        return (
            <Select
                value={text}
                onChange={(key) => {
                    const option = options.find(
                        (item) => String(item.value) === String(key),
                    );
                    onChange(option?.value ?? String(key));
                }}
                isInvalid={Boolean(error)}
            >
                <SelectLabel>{field.label}</SelectLabel>
                <SelectTrigger>
                    <SelectValue />
                    <SelectIndicator />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem
                            key={String(option.value)}
                            id={String(option.value)}
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
                <ErrorText message={error} />
            </Select>
        );
    }

    return (
        <TextField
            value={text}
            onChange={(next) => onChange(next)}
            invalid={Boolean(error)}
            className="flex w-full flex-col gap-1.5"
        >
            <FieldLabel>{field.label}</FieldLabel>
            <Input
                type={field.type === 'url' ? 'text' : 'text'}
                className="w-full"
            />
            <FieldError>{error}</FieldError>
        </TextField>
    );
}

/** Error text for fields outside a react-aria text field, where FieldError renders nothing. */
function ErrorText({ message }: { message?: string }) {
    return message ? (
        <p className="text-sm text-input-error">{message}</p>
    ) : null;
}
