import type { ReactNode } from 'react';

import { PageHead, renderElement } from '@/theme/api';
import type { ThemeTemplateProps } from '@/theme/contract';

/**
 * The page frame of the default theme. Both templates use it, so they share one layout.
 */
export function ThemeLayout({ page, sections }: ThemeTemplateProps): ReactNode {
    return (
        <main className="theme-default" lang={page.locale}>
            <PageHead page={page} />

            <header className="theme-default__header">
                <h1>{page.title}</h1>
                {page.subtitle && <p>{page.subtitle}</p>}
            </header>

            {sections.map((section) => (
                <section
                    key={section.id}
                    className="theme-default__section"
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
        </main>
    );
}
