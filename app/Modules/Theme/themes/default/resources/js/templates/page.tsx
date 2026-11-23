import type { ReactNode } from 'react';

import type { ThemeTemplateProps } from '@/theme/contract';
import { ThemeLayout } from './layout';

/**
 * Template of every other page in the default theme.
 */
export default function Page(props: ThemeTemplateProps): ReactNode {
    return <ThemeLayout {...props} />;
}
