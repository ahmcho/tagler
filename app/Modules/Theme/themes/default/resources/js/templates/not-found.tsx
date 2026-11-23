import type { ReactNode } from 'react';

import type { ThemeTemplateProps } from '@/theme/contract';
import { ThemeLayout } from './layout';

/**
 * The 404 page of the default theme. It uses the page frame with the title and no sections.
 */
export default function NotFound(props: ThemeTemplateProps): ReactNode {
    return <ThemeLayout {...props} />;
}
