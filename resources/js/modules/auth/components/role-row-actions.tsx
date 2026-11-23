import { router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import type {
    ResourceActionOptions,
    ResourceRowAction,
} from '@/components/resource/types';
import { destroy, edit } from '@/routes/roles';
import { activityLogAction } from './activity-log-action';

export type RoleRecord = {
    id: number;
    name: string;
    guard_name: string;
    permissions: { id: number; name: string }[];
    created_at: string;
    can: { update: boolean; delete: boolean };
};

const ROLE_MODEL_CLASS = 'App\\Modules\\Auth\\Models\\Role';

/** Edit, Delete and Activity for a role. The index adds View, and the show page uses these as buttons. */
export function roleRowActions(
    role: RoleRecord,
): ResourceRowAction<RoleRecord>[] {
    return [
        ...(role.can.update
            ? [
                  {
                      key: 'edit',
                      label: 'Edit',
                      icon: <Pencil className="size-4" />,
                      tone: 'success' as const,
                      onAction: () => router.visit(edit.url(role.id)),
                  },
              ]
            : []),
        ...(role.can.delete
            ? [
                  {
                      key: 'delete',
                      label: 'Delete',
                      icon: <Trash2 className="size-4" />,
                      tone: 'danger' as const,
                      confirm: {
                          title: 'Delete role',
                          description: (target: RoleRecord) =>
                              `Delete the role "${target.name}"? Users who hold it lose its permissions.`,
                          confirmLabel: 'Delete',
                          icon: <Trash2 />,
                          tone: 'danger' as const,
                      },
                      onAction: (
                          target: RoleRecord,
                          options: ResourceActionOptions,
                      ) =>
                          router.delete(destroy.url(target.id), {
                              preserveScroll: true,
                              onFinish: options.onFinish,
                          }),
                  },
              ]
            : []),
        activityLogAction<RoleRecord>(ROLE_MODEL_CLASS, (target) => target.id),
    ];
}
