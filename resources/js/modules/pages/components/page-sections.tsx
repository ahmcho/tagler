import type { ReactNode } from 'react';
import { renderElement } from '@/modules/pages/elements';
import type { PageElement } from '@/modules/pages/elements';

export type PageSection = {
    id: string;
    layout: string;
    settings: Record<string, unknown>;
    elements: PageElement[];
};

/**
 * Renders the sections of a public page. The layout key and background are
 * data attributes. A theme maps them to its own styles.
 */
export function PageSections({
    sections,
}: {
    sections: PageSection[];
}): ReactNode {
    return (
        <>
            {sections.map((section) => (
                <section
                    key={section.id}
                    data-layout={section.layout}
                    data-background={String(
                        section.settings.background ?? 'none',
                    )}
                >
                    {section.elements.map((element) => (
                        <div key={element.id} data-element={element.type}>
                            {renderElement(element)}
                        </div>
                    ))}
                </section>
            ))}
        </>
    );
}
