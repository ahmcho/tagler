/**
 * The contract between the CMS and a theme. A theme receives only these props. It never receives Eloquent models,
 * and it must not import from `@/modules/*` or `@/components/*`. Shared rendering comes from `@/theme/api`.
 */
import type { ComponentType } from 'react';

export type ThemePage = {
    locale: string;
    title: string;
    subtitle: string | null;
    path: string;
    layout: string | null;
    seo_title: string | null;
    seo_description: string | null;
    /** The default-locale address of the page, or null when it has none. */
    canonical_url: string | null;
    /** The Open Graph locale, for example en_GB. */
    og_locale: string;
};

export type ThemeElement = {
    id: string;
    type: string;
    data: Record<string, unknown>;
};

export type ThemeSection = {
    id: string;
    layout: string;
    settings: Record<string, unknown>;
    elements: ThemeElement[];
};

export type ThemeTemplateProps = {
    page: ThemePage;
    sections: ThemeSection[];
};

export type ThemeTemplate = ComponentType<ThemeTemplateProps>;

/** What a theme's entry module exports. Keys are template keys from theme.json. */
export type ThemeModule = {
    templates: Record<string, ThemeTemplate>;
};
