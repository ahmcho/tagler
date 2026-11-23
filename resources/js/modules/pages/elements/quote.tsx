import type { ReactNode } from 'react';

export function QuoteElement({
    data,
}: {
    data: Record<string, unknown>;
}): ReactNode {
    return (
        <blockquote>
            <p>{String(data.text ?? '')}</p>
            {data.cite ? <footer>{String(data.cite)}</footer> : null}
        </blockquote>
    );
}
