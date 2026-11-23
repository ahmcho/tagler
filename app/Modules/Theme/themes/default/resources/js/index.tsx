import '../css/theme.css';

import type { ThemeModule } from '@/theme/contract';

import Home from './templates/home';
import NotFound from './templates/not-found';
import Page from './templates/page';

/**
 * The theme entry. Each key is a template key from theme.json. The runtime loads this module only when the
 * theme is active, so its CSS loads only then.
 */
export const templates: ThemeModule['templates'] = {
    home: Home,
    page: Page,
    'not-found': NotFound,
};
