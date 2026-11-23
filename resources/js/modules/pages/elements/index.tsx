import type { ReactNode } from 'react';
import { ButtonElement } from './button';
import { DividerElement } from './divider';
import { HeadingElement } from './heading';
import { HtmlElement } from './html';
import { MarkdownElement } from './markdown';
import { ParagraphElement } from './paragraph';
import { QuoteElement } from './quote';
import { SpacerElement } from './spacer';

export type PageElement = {
    id: string;
    type: string;
    data: Record<string, unknown>;
};

/**
 * Element components by type key. The keys match the server registry in
 * config/pages.php. A type with no component is skipped, as the server does.
 */
const components: Record<string, (props: { data: never }) => ReactNode> = {
    heading: HeadingElement,
    paragraph: ParagraphElement,
    markdown: MarkdownElement,
    html: HtmlElement,
    button: ButtonElement,
    spacer: SpacerElement,
    divider: DividerElement,
    quote: QuoteElement,
};

export function renderElement(element: PageElement): ReactNode {
    const Component = components[element.type];

    if (!Component) {
        return null;
    }

    const Typed = Component as (props: {
        data: Record<string, unknown>;
    }) => ReactNode;

    return <Typed data={element.data} />;
}
