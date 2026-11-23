import type { ReactNode } from 'react';

import type { ThemeTemplateProps } from '@/theme/contract';
import { ThemeLayout } from './layout';

/**
 * Homepage template of the default theme.
 */
export default function Home(props: ThemeTemplateProps): ReactNode {
    return <ThemeLayout {...props} />;
}
