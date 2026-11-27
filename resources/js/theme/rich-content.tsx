import { router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

import { internalVisitPath } from '@/utils/internal-link';

/**
 * Stored page HTML. Same-origin links in it visit through Inertia. The rest keep the browser's default.
 */
export function RichContent({
    html,
    className,
}: {
    html: string;
    className?: string;
}): ReactNode {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;

        if (container === null) {
            return;
        }

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
    }, [html]);

    return (
        <div
            ref={containerRef}
            className={className}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
