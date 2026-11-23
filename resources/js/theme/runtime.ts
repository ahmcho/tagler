import type { ThemeModule, ThemeTemplate } from '@/theme/contract';

/**
 * Theme entries are loaded lazily. Each theme is its own chunk, and its CSS loads only when the theme is used.
 * The glob is relative to this file, so the paths below point at the theme folders in app/Modules/Theme/themes.
 */
const themeEntries = import.meta.glob<ThemeModule>(
    '../../../app/Modules/Theme/themes/*/resources/js/index.tsx',
);

const THEME_COMPONENT = /^theme\/([a-z][a-z0-9-]{1,39})\/([a-z][a-z0-9.-]*)$/;

export type ThemeComponentName = {
    slug: string;
    key: string;
};

/**
 * Splits a component name such as `theme/default/home`. Returns null for any other name.
 */
export function parseThemeComponent(name: string): ThemeComponentName | null {
    const match = THEME_COMPONENT.exec(name);

    if (match === null) {
        return null;
    }

    return { slug: match[1], key: match[2] };
}

/**
 * The template for a theme component name, or null when the name is not a theme name, the theme is not
 * bundled, or the theme does not provide the template.
 */
export async function loadThemeTemplate(
    name: string,
): Promise<ThemeTemplate | null> {
    const parsed = parseThemeComponent(name);

    if (parsed === null) {
        return null;
    }

    const load =
        themeEntries[
            `../../../app/Modules/Theme/themes/${parsed.slug}/resources/js/index.tsx`
        ];

    if (load === undefined) {
        return null;
    }

    const themeModule = await load();

    return Object.hasOwn(themeModule.templates, parsed.key)
        ? themeModule.templates[parsed.key]
        : null;
}
