import { router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import type {
    ResourceActionOptions,
    ResourceRowAction,
} from '@/components/resource/types';
import { destroy, edit } from '@/routes/users';
import type { ModelStatusEnum } from '@/types/generated';
import { activityLogAction } from './activity-log-action';

export type UserRecord = {
    id: number;
    name: string;
    email: string;
    status: ModelStatusEnum;
    roles: { id: number; name: string }[];
    created_at: string;
    can: { update: boolean; delete: boolean };
};

const USER_MODEL_CLASS = 'App\\Models\\User';

/** Edit, Delete and Activity for a user. The index adds View, and the show page uses these as buttons. */
export function userRowActions(
    user: UserRecord,
): ResourceRowAction<UserRecord>[] {
    return [
        ...(user.can.update
            ? [
                  {
                      key: 'edit',
                      label: 'Edit',
                      icon: <Pencil className="size-4" />,
                      tone: 'success' as const,
                      onAction: () => router.visit(edit.url(user.id)),
                  },
              ]
            : []),
        ...(user.can.delete
            ? [
                  {
                      key: 'delete',
                      label: 'Delete',
                      icon: <Trash2 className="size-4" />,
                      tone: 'danger' as const,
                      confirm: {
                          title: 'Delete user',
                          description: (target: UserRecord) =>
                              `Delete the user "${target.name}"? This cannot be undone.`,
                          confirmLabel: 'Delete',
                          icon: <Trash2 />,
                          tone: 'danger' as const,
                      },
                      onAction: (
                          target: UserRecord,
                          options: ResourceActionOptions,
                      ) =>
                          router.delete(destroy.url(target.id), {
                              preserveScroll: true,
                              onFinish: options.onFinish,
                          }),
                  },
              ]
            : []),
        activityLogAction<UserRecord>(USER_MODEL_CLASS, (target) => target.id),
    ];
}
