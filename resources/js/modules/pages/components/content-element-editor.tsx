import type {
    DraggableAttributes,
    DraggableSyntheticListeners,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, GripVertical, Trash2 } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
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
import type {
    ContentElement,
    ContentElementField,
    ContentElementType,
    JsonValue,
} from '@/modules/pages/components/content-document';
import { RichTextEditor } from '@/modules/pages/components/rich-text-editor';

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

type SortableElementProps = Omit<ElementEditorProps, 'dragHandle'>;

/** An element that can be dragged inside its section. */
export function SortableElement(props: SortableElementProps) {
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
export function ErrorText({ message }: { message?: string }) {
    return message ? (
        <p className="text-sm text-input-error">{message}</p>
    ) : null;
}
