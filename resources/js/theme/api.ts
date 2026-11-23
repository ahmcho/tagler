/**
 * The rendering API that themes may import. Themes import from here instead of from the CMS modules. A theme
 * shipped as a ZIP later will receive this API from the host at runtime, so keep its exports small and stable.
 */
export { PageHead } from '@/theme/page-head';
export { renderElement } from '@/modules/pages/elements';
export type { PageElement } from '@/modules/pages/elements';
