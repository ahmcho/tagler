import { createInertiaApp } from '@inertiajs/react';
import type { ComponentType } from 'react';
import NotFound from '@/modules/pages/pages/pages/public/not-found';
import Show from '@/modules/pages/pages/pages/public/show';
import { loadThemeTemplate, parseThemeComponent } from '@/theme/runtime';

/**
 * Entry for public pages only. It imports no admin layout and no Tailwind or
 * Tailgrids stylesheet, so visitors get unstyled HTML where no theme applies.
 *
 * Names such as `theme/{slug}/{key}` come from the CMS when the active theme
 * provides that template. They resolve asynchronously, so each theme loads as
 * its own chunk. When the template cannot be loaded, the plain view with the
 * same key is used.
 */
const plainPages: Record<string, ComponentType<never>> = {
    'pages/public/not-found': NotFound,
    'pages/public/show': Show,
};

async function loadThemed(name: string): Promise<ComponentType | null> {
    try {
        return (await loadThemeTemplate(name)) as ComponentType | null;
    } catch (error) {
        console.error(`The theme template "${name}" failed to load.`, error);

        return null;
    }
}

function plainFallback(name: string): ComponentType {
    const parsed = parseThemeComponent(name);
    const plainName =
        parsed === null
            ? name
            : parsed.key === 'not-found'
              ? 'pages/public/not-found'
              : 'pages/public/show';
    const page = plainPages[plainName];

    if (!page) {
        throw new Error(`Unknown public page "${name}".`);
    }

    return page as ComponentType;
}

createInertiaApp({
    // Each page declares its own props. Inertia passes them in at render time.
    resolve: async (name) => (await loadThemed(name)) ?? plainFallback(name),
    strictMode: true,
    // The progress bar injects an admin-style <style> tag. Public pages load no styles.
    progress: false,
});
