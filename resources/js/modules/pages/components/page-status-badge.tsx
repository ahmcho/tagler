import { Badge } from '@/components/tailgrids/core/badge';
import type { PageStatus } from '@/modules/pages/components/page-form';

const statusBadge: Record<
    PageStatus,
    { label: string; color: 'warning' | 'success' | 'primary' }
> = {
    draft: { label: 'Draft', color: 'warning' },
    published: { label: 'Published', color: 'success' },
    scheduled: { label: 'Scheduled', color: 'primary' },
};

export function PageStatusBadge({ status }: { status: PageStatus }) {
    const { label, color } = statusBadge[status];

    return (
        <Badge color={color} size="md">
            {label}
        </Badge>
    );
}
