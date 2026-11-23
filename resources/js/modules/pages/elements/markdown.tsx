import type { ReactNode } from 'react';

/** The server renders Markdown with raw HTML escaped, so the output is safe to insert. */
export function MarkdownElement({
    data,
}: {
    data: Record<string, unknown>;
}): ReactNode {
    return (
        <div dangerouslySetInnerHTML={{ __html: String(data.html ?? '') }} />
    );
}
