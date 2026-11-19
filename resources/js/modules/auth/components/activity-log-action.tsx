import { router } from '@inertiajs/react';
import { History } from 'lucide-react';
import type { ResourceRowAction } from '@/components/resource/types';
import { index as activityLogIndex } from '@/routes/activity-logs';

/**
 * The "Activity" row action. It opens the activity log filtered to one record.
 * `subjectType` is the model class as the activity log stores it.
 */
export function activityLogAction<Row>(
    subjectType: string,
    getSubjectId: (row: Row) => number,
): ResourceRowAction<Row> {
    return {
        key: 'logs',
        label: 'Activity',
        icon: <History className="size-4" />,
        permission: 'activity-logs.index',
        onAction: (row) =>
            router.visit(
                activityLogIndex.url({
                    query: {
                        subject_type: subjectType,
                        subject_id: getSubjectId(row),
                    },
                }),
            ),
    };
}
