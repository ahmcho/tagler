import type { ResourceContentProps } from '@/components/resource/resource-form';
import { ResourceForm } from '@/components/resource/resource-form';
import { ResourcePage } from '@/components/resource/resource-page';

/**
 * Edit page content. Pass the model bound by the route. The form puts to
 * `updateUrl` because the model has an id.
 */
export function ResourceEditContent<TData extends Record<string, unknown>>({
    pageTitle,
    ...formProps
}: ResourceContentProps<TData>) {
    return (
        <ResourcePage title={pageTitle}>
            <ResourceForm<TData> {...formProps} />
        </ResourcePage>
    );
}
