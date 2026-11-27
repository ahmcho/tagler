import { describe, expect, it } from 'vitest';

import { internalVisitPath } from './internal-link';

const currentLocation = new URL(
    'https://cms.test/en/services',
) as unknown as Location;

function anchor(
    href: string,
    attributes: Record<string, string> = {},
): HTMLAnchorElement {
    return {
        getAttribute: (name: string) => (name === 'href' ? href : null),
        hasAttribute: (name: string) => name in attributes || name === 'href',
        target: attributes.target ?? '',
    } as unknown as HTMLAnchorElement;
}

function click(init: Partial<MouseEvent> = {}): MouseEvent {
    return {
        button: 0,
        defaultPrevented: false,
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        ...init,
    } as MouseEvent;
}

describe('internalVisitPath', () => {
    it('returns the path for a same-origin link', () => {
        expect(
            internalVisitPath(
                anchor('/en/services/web?x=1#top'),
                click(),
                currentLocation,
            ),
        ).toBe('/en/services/web?x=1#top');
    });

    it('leaves external links to the browser', () => {
        expect(
            internalVisitPath(
                anchor('https://example.com/a'),
                click(),
                currentLocation,
            ),
        ).toBeNull();
    });

    it('leaves downloads and new-tab links to the browser', () => {
        expect(
            internalVisitPath(
                anchor('/files/a.pdf', { download: '' }),
                click(),
                currentLocation,
            ),
        ).toBeNull();
        expect(
            internalVisitPath(
                anchor('/en/x', { target: '_blank' }),
                click(),
                currentLocation,
            ),
        ).toBeNull();
    });

    it('leaves modified and non-primary clicks to the browser', () => {
        expect(
            internalVisitPath(
                anchor('/en/x'),
                click({ ctrlKey: true }),
                currentLocation,
            ),
        ).toBeNull();
        expect(
            internalVisitPath(
                anchor('/en/x'),
                click({ button: 1 }),
                currentLocation,
            ),
        ).toBeNull();
    });

    it('leaves same-page hash links to the browser', () => {
        expect(
            internalVisitPath(anchor('#faq'), click(), currentLocation),
        ).toBeNull();
    });
});
