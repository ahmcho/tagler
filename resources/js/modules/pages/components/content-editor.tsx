import {
    closestCenter,
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { Button } from '@/components/tailgrids/core/button';
import type {
    ContentDocument,
    ContentEditorConfig,
    ContentElement,
    ContentSection,
} from '@/modules/pages/components/content-document';
import { newId } from '@/modules/pages/components/content-document';
import { SectionCard } from '@/modules/pages/components/content-section-card';

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
