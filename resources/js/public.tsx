import { createInertiaApp } from '@inertiajs/react';
import type { ComponentType } from 'react';
import NotFound from '@/modules/pages/pages/pages/public/not-found';
import Show from '@/modules/pages/pages/pages/public/show';

/**
 * Entry for public pages only. It imports no admin layout and no Tailwind or
 * Tailgrids stylesheet, so visitors get unstyled HTML. The theme system will
 * replace this entry.
 */
const pages: Record<string, ComponentType<never>> = {
    'pages/public/not-found': NotFound,
    'pages/public/show': Show,
};

createInertiaApp({
    resolve: (name) => {
        const page = pages[name];

        if (!page) {
            throw new Error(`Unknown public page "${name}".`);
        }

        // Each page declares its own props. Inertia passes them in at render time.
        return page as ComponentType;
    },
    strictMode: true,
    // The progress bar injects an admin-style <style> tag. Public pages load no styles.
    progress: false,
});
