import { describe, expect, it } from 'vitest';

import { loadThemeTemplate, parseThemeComponent } from '@/theme/runtime';

describe('parseThemeComponent', () => {
    it('splits a theme component name into slug and template key', () => {
        expect(parseThemeComponent('theme/default/home')).toEqual({
            slug: 'default',
            key: 'home',
        });
        expect(parseThemeComponent('theme/corporate/blog.index')).toEqual({
            slug: 'corporate',
            key: 'blog.index',
        });
    });

    it.each([
        'pages/public/show',
        'theme/Default/home',
        'theme/default/../home',
        'theme/default/',
        'theme/default/Home',
    ])('rejects %s', (name) => {
        expect(parseThemeComponent(name)).toBeNull();
    });
});

describe('loadThemeTemplate', () => {
    it('loads the home template of the bundled default theme', async () => {
        const template = await loadThemeTemplate('theme/default/home');

        expect(typeof template).toBe('function');
    });

    it('returns null for a template the theme does not provide', async () => {
        expect(await loadThemeTemplate('theme/default/blog.index')).toBeNull();
    });

    it('returns null for a theme that is not bundled', async () => {
        expect(await loadThemeTemplate('theme/missing/home')).toBeNull();
    });

    it('returns null for names that are not theme names', async () => {
        expect(await loadThemeTemplate('pages/public/show')).toBeNull();
    });
});
