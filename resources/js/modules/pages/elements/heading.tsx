import type { ReactNode } from 'react';

export function HeadingElement({
    data,
}: {
    data: Record<string, unknown>;
}): ReactNode {
    const level = Math.min(6, Math.max(1, Number(data.level) || 2));
    const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    return <Tag>{String(data.text ?? '')}</Tag>;
}
