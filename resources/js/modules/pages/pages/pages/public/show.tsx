import type { ReactNode } from 'react';
import { ChildPages, PageHead, RichContent } from '@/theme/api';
import type { ThemePage } from '@/theme/contract';

type Props = {
    page: ThemePage;
    body: string | null;
    children: { title: string; url: string }[];
};

/**
 * Public page without a theme template. Plain semantic HTML. The body is sanitised on save.
 */
export default function Show({ page, body, children }: Props): ReactNode {
    return (
        <main lang={page.locale} data-layout={page.layout ?? undefined}>
            <PageHead page={page} />

            <header>
                <h1>{page.title}</h1>
                {page.subtitle && <p>{page.subtitle}</p>}
            </header>

            {body && <RichContent html={body} />}

            <ChildPages items={children} />
        </main>
    );
}
