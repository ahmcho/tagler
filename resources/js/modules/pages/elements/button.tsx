import type { ReactNode } from 'react';

export function ButtonElement({
    data,
}: {
    data: Record<string, unknown>;
}): ReactNode {
    const target = data.target === '_blank' ? '_blank' : '_self';

    return (
        <a
            href={String(data.url ?? '#')}
            target={target}
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        >
            {String(data.label ?? '')}
        </a>
    );
}
