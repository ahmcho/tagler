import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

type Props = {
    page: {
        locale: string;
        title: string;
        seo_description: string | null;
        og_locale: string;
    };
};

/** Plain 404 for visitors. No admin layout and no styles. The title comes from the server, in the request language. */
export default function NotFound({ page }: Props): ReactNode {
    return (
        <main lang={page.locale}>
            <Head title={page.title} />
            <h1>{page.title}</h1>
        </main>
    );
}
