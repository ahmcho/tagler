import { router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { ChildPages, PageHead } from '@/theme/api';
import type { ThemePage } from '@/theme/contract';
import { internalVisitPath } from '@/utils/internal-link';

type Props = {
    page: ThemePage;
    body: string | null;
    children: { title: string; url: string }[];
};

/**
 * Public page without a theme template. Plain semantic HTML. The body is sanitised on save.
 */
export default function Show({ page, body, children }: Props): ReactNode {
    const bodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = bodyRef.current;

        if (container === null) {
            return;
        }

        /* Stored HTML has plain links. Visit same-origin ones with Inertia, and leave the rest to the browser. */
        const handleClick = (event: MouseEvent): void => {
            const anchor = (event.target as Element).closest('a');

            if (anchor === null || !container.contains(anchor)) {
                return;
            }

            const path = internalVisitPath(anchor, event);

            if (path === null) {
                return;
            }

            event.preventDefault();
            router.visit(path);
        };

        container.addEventListener('click', handleClick);

        return () => container.removeEventListener('click', handleClick);
    }, [body]);

    return (
        <main lang={page.locale} data-layout={page.layout ?? undefined}>
            <PageHead page={page} />

            <header>
                <h1>{page.title}</h1>
                {page.subtitle && <p>{page.subtitle}</p>}
            </header>

            {body && (
                <div ref={bodyRef} dangerouslySetInnerHTML={{ __html: body }} />
            )}

            <ChildPages items={children} />
        </main>
    );
}
