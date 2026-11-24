import type { ReactNode } from 'react';

type ChildPageItem = {
    title: string;
    url: string;
};

export function ChildPagesElement({
    data,
}: {
    data: Record<string, unknown>;
}): ReactNode {
    const items = Array.isArray(data.items)
        ? (data.items as ChildPageItem[])
        : [];

    if (items.length === 0) {
        return null;
    }

    return (
        <section>
            {data.title ? <h2>{String(data.title)}</h2> : null}
            <ul>
                {items.map((item) => (
                    <li key={item.url}>
                        <a href={item.url}>{item.title}</a>
                    </li>
                ))}
            </ul>
        </section>
    );
}
