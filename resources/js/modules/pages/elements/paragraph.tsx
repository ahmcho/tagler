import type { ReactNode } from 'react';

/** The server sanitises the HTML before it reaches the page. */
export function ParagraphElement({
    data,
}: {
    data: Record<string, unknown>;
}): ReactNode {
    return (
        <div dangerouslySetInnerHTML={{ __html: String(data.html ?? '') }} />
    );
}
