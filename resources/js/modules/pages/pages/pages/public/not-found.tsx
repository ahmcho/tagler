import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

/** Plain 404 for visitors. No admin layout and no styles. */
export default function NotFound(): ReactNode {
    return (
        <main>
            <Head title="Page not found" />
            <h1>Page not found</h1>
        </main>
    );
}
