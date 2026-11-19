import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import {
    Alert,
    AlertContent,
    AlertIndicator,
    AlertTitle,
} from '@/components/tailgrids/core/alert';

type ResourcePageProps = {
    title: string;
    status?: string | null;
    /** Buttons shown above the content, for example "New role". Pass `false` to hide them. */
    actions?: ReactNode;
    children: ReactNode;
};

/**
 * Shell for every resource page: the document title, the status alert,
 * the action bar and the content. Breadcrumbs stay on the page as `Page.layout`.
 */
export function ResourcePage({
    title,
    status,
    actions,
    children,
}: ResourcePageProps) {
    return (
        <>
            <Head title={title} />

            <div className="space-y-6">
                {status && (
                    <Alert status="success" className="max-w-none">
                        <AlertIndicator />
                        <AlertContent>
                            <AlertTitle>{status}</AlertTitle>
                        </AlertContent>
                    </Alert>
                )}

                {actions && <div className="flex justify-end">{actions}</div>}

                {children}
            </div>
        </>
    );
}
