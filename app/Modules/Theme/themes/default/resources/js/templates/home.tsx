import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { renderElement } from '@/theme/api';
import type { ThemeTemplateProps } from '@/theme/contract';

/**
 * Homepage template of the default theme. It uses only the props the CMS sends and the theme API.
 */
export default function Home({
    page,
    sections,
}: ThemeTemplateProps): ReactNode {
    return (
        <main className="theme-default" lang={page.locale}>
            <Head title={page.seo_title ?? page.title}>
                {page.seo_description && (
                    <meta name="description" content={page.seo_description} />
                )}
            </Head>

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
