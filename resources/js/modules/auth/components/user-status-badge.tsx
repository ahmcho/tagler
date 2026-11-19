import { Badge } from '@/components/tailgrids/core/badge';
import { ModelStatusEnum } from '@/types/generated';

type BadgeColor = 'success' | 'error';

const statusBadges: Record<
    ModelStatusEnum,
    { label: string; color: BadgeColor }
> = {
    [ModelStatusEnum.Active]: { label: 'Active', color: 'success' },
    [ModelStatusEnum.Inactive]: { label: 'Inactive', color: 'error' },
};

export function UserStatusBadge({ status }: { status: ModelStatusEnum }) {
    const { label, color } = statusBadges[status];

    return (
        <Badge color={color} size="sm">
            {label}
        </Badge>
    );
}
