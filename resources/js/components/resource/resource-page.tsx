import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

type ResourcePageProps = {
    title: string;
    /** Buttons shown above the content, for example "New role". Pass `false` to hide them. */
    actions?: ReactNode;
    children: ReactNode;
};

/**
 * Shell for every resource page: the document title, the action bar and the
 * content. Flash messages show as toasts. Breadcrumbs stay on the page as `Page.layout`.
 */
export function ResourcePage({ title, actions, children }: ResourcePageProps) {
    return (
        <>
            <Head title={title} />

            <div className="space-y-6">
                {actions && <div className="flex justify-end">{actions}</div>}

                {children}
            </div>
        </>
    );
}
