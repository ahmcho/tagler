import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import type { ThemePage } from '@/theme/contract';

/**
 * Title and search and sharing tags of a public page. The `head-key` values match the keys the server writes in
 * resources/views/public.blade.php, so the browser keeps one copy of each tag.
 */
export function PageHead({ page }: { page: ThemePage }): ReactNode {
    const title = page.seo_title ?? page.title;

    return (
        <Head title={title}>
            {page.seo_description && (
                <meta
                    head-key="description"
                    name="description"
                    content={page.seo_description}
                />
            )}
            <meta head-key="og:type" property="og:type" content="website" />
            <meta
                head-key="og:locale"
                property="og:locale"
                content={page.og_locale}
            />
            <meta head-key="og:title" property="og:title" content={title} />
            {page.seo_description && (
                <meta
                    head-key="og:description"
                    property="og:description"
                    content={page.seo_description}
                />
            )}
            {page.canonical_url && (
                <link
                    head-key="canonical"
                    rel="canonical"
                    href={page.canonical_url}
                />
            )}
            {page.canonical_url && (
                <meta
                    head-key="og:url"
                    property="og:url"
                    content={page.canonical_url}
                />
            )}
        </Head>
    );
}
