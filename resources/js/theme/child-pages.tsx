import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import type { ThemeChild } from '@/theme/contract';

/**
 * The live child pages of the current page. Nothing renders when there are none.
 */
export function ChildPages({
    title,
    items,
}: {
    title?: string;
    items: ThemeChild[];
}): ReactNode {
    if (items.length === 0) {
        return null;
    }

    return (
        <section>
            {title ? <h2>{title}</h2> : null}
            <ul>
                {items.map((item) => (
                    <li key={item.url}>
                        <Link href={item.url}>{item.title}</Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
