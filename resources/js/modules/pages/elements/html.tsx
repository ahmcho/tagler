import type { ReactNode } from 'react';

/** The server sanitises the HTML with an allow-list on output, so it is safe to insert. */
export function HtmlElement({
    data,
}: {
    data: Record<string, unknown>;
}): ReactNode {
    return (
        <div dangerouslySetInnerHTML={{ __html: String(data.html ?? '') }} />
    );
}
