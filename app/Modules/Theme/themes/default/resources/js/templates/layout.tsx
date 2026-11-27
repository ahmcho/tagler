import type { ReactNode } from 'react';

import { ChildPages, PageHead, RichContent } from '@/theme/api';
import type { ThemeTemplateProps } from '@/theme/contract';

/**
 * The page frame of the default theme. Both templates use it, so they share one layout.
 */
export function ThemeLayout({
    page,
    body,
    children,
}: ThemeTemplateProps): ReactNode {
    return (
        <main className="theme-default" lang={page.locale}>
            <PageHead page={page} />

            <header className="theme-default__header">
                <h1>{page.title}</h1>
                {page.subtitle && <p>{page.subtitle}</p>}
            </header>

            {body && (
                <RichContent className="theme-default__body" html={body} />
            )}

            <ChildPages items={children} />
        </main>
    );
}
