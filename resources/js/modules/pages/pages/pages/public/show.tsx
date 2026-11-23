import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import type { PageSection } from '@/modules/pages/components/page-sections';
import { PageSections } from '@/modules/pages/components/page-sections';

type Props = {
    page: {
        locale: string;
        title: string;
        subtitle: string | null;
        path: string;
        layout: string | null;
        seo_title: string | null;
        seo_description: string | null;
    };
    sections: PageSection[];
};

/**
 * Public page. Plain semantic HTML. The sections carry data attributes, so a
 * future theme can style them without changing the page.
 */
export default function Show({ page, sections }: Props): ReactNode {
    return (
        <main lang={page.locale} data-layout={page.layout ?? undefined}>
            <Head title={page.seo_title ?? page.title}>
                {page.seo_description && (
                    <meta name="description" content={page.seo_description} />
                )}
            </Head>

            <header>
                <h1>{page.title}</h1>
                {page.subtitle && <p>{page.subtitle}</p>}
            </header>

            <PageSections sections={sections} />
        </main>
    );
}
