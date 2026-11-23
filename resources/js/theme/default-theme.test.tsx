import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { templates } from '../../../app/Modules/Theme/themes/default/resources/js/index';

// Head needs an Inertia app. The markup under test does not depend on it.
vi.mock('@inertiajs/react', () => ({ Head: () => null }));

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
