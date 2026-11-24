import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ChildPagesElement } from './child-pages';

describe('ChildPagesElement', () => {
    it('renders the heading and a link for each child page', () => {
        const markup = renderToStaticMarkup(
            <ChildPagesElement
                data={{
                    title: 'Services',
                    items: [
                        { title: 'Web', url: '/services/web' },
                        { title: 'Design', url: '/services/design' },
                    ],
                }}
            />,
        );

        expect(markup).toContain('<h2>Services</h2>');
        expect(markup).toContain('<a href="/services/web">Web</a>');
        expect(markup).toContain('<a href="/services/design">Design</a>');
    });

    it('renders nothing when there are no child pages', () => {
        const markup = renderToStaticMarkup(
            <ChildPagesElement data={{ title: 'Services', items: [] }} />,
        );

        expect(markup).toBe('');
    });

    it('renders nothing when the resolved items are missing', () => {
        expect(renderToStaticMarkup(<ChildPagesElement data={{}} />)).toBe('');
    });
});
