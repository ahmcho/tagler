import type { ReactNode } from 'react';

/** A spacer has no styles here. Its size is the theme's job. */
export function SpacerElement({
    data,
}: {
    data: Record<string, unknown>;
}): ReactNode {
    return <div aria-hidden="true" data-height={String(data.height ?? 'md')} />;
}
