import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { templates } from '../../../app/Modules/Theme/themes/default/resources/js/index';

// Head needs an Inertia app. The test renders its children in place, so the meta tags show in the markup.
vi.mock('@inertiajs/react', () => ({
    Head: ({ children }: { children?: ReactNode }) => children ?? null,
}));

type Manifest = {
    templates: Record<string, string>;
};

const manifest = JSON.parse(
    readFileSync(
        new URL(
            '../../../app/Modules/Theme/themes/default/theme.json',
            import.meta.url,
        ),
        'utf8',
    ),
) as Manifest;

const page = {
    locale: 'en',
    title: 'Welcome',
    subtitle: 'Hello there',
    path: '',
    layout: null,
    seo_title: null,
    seo_description: null,
    canonical_url: null,
    og_locale: 'en_GB',
};

describe('default theme', () => {
    it('exports exactly the template keys its manifest declares', () => {
        expect(Object.keys(templates).sort()).toEqual(
            Object.keys(manifest.templates).sort(),
        );
    });

    it('renders the home template with the title and subtitle', () => {
        const Home = templates.home;

        const html = renderToStaticMarkup(
            createElement(Home, { page, sections: [] }),
        );

        expect(html).toContain('class="theme-default"');
        expect(html).toContain('<h1>Welcome</h1>');
        expect(html).toContain('<p>Hello there</p>');
    });

    it('renders the description and Open Graph meta tags when the page has an SEO description', () => {
        const Home = templates.home;

        const html = renderToStaticMarkup(
            createElement(Home, {
                page: {
                    ...page,
                    seo_title: 'Welcome SEO',
                    seo_description: 'A short summary',
                },
                sections: [],
            }),
        );

        expect(html).toContain('name="description" content="A short summary"');
        expect(html).toContain('property="og:type" content="website"');
        expect(html).toContain('property="og:title" content="Welcome SEO"');
        expect(html).toContain(
            'property="og:description" content="A short summary"',
        );
    });

    it('renders the Open Graph title but no description tags when the page has no SEO description', () => {
        const Home = templates.home;

        const html = renderToStaticMarkup(
            createElement(Home, { page, sections: [] }),
        );

        expect(html).toContain('property="og:title" content="Welcome"');
        expect(html).not.toContain('name="description"');
        expect(html).not.toContain('og:description');
        expect(html).not.toContain('rel="canonical"');
    });

    it('renders the Open Graph locale', () => {
        const Home = templates.home;

        const html = renderToStaticMarkup(
            createElement(Home, { page, sections: [] }),
        );

        expect(html).toContain('property="og:locale" content="en_GB"');
    });

    it('renders the canonical link and og:url when the page has a canonical address', () => {
        const Home = templates.home;

        const html = renderToStaticMarkup(
            createElement(Home, {
                page: {
                    ...page,
                    canonical_url: 'https://example.test/en/about',
                },
                sections: [],
            }),
        );

        expect(html).toContain(
            'rel="canonical" href="https://example.test/en/about"',
        );
        expect(html).toContain(
            'property="og:url" content="https://example.test/en/about"',
        );
    });

    it('renders the not-found template with the page title and no sections', () => {
        const NotFound = templates['not-found'];

        const html = renderToStaticMarkup(
            createElement(NotFound, {
                page: { ...page, title: 'Page not found' },
                sections: [],
            }),
        );

        expect(html).toContain('<h1>Page not found</h1>');
        expect(html).not.toContain('data-layout');
    });

    it('renders each section with its layout and background', () => {
        const Home = templates.home;

        const html = renderToStaticMarkup(
            createElement(Home, {
                page,
                sections: [
                    {
                        id: 's1',
                        layout: 'centered',
                        settings: { background: 'dark' },
                        elements: [{ id: 'e1', type: 'divider', data: {} }],
                    },
                ],
            }),
        );

        expect(html).toContain('data-layout="centered"');
        expect(html).toContain('data-background="dark"');
        expect(html).toContain('data-element="divider"');
    });
});
