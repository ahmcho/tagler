import type { ResourceContentProps } from '@/components/resource/resource-form';
import { ResourceForm } from '@/components/resource/resource-form';
import { ResourcePage } from '@/components/resource/resource-page';

/**
 * Create page content. Pass the empty model the controller sends. The form
 * posts to `storeUrl` because the model has no id.
 */
export function ResourceCreateContent<TData extends Record<string, unknown>>({
    pageTitle,
    status,
    ...formProps
}: ResourceContentProps<TData>) {
    return (
        <ResourcePage title={pageTitle} status={status}>
            <ResourceForm<TData> {...formProps} />
        </ResourcePage>
    );
}
