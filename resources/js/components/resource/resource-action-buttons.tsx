import { useState } from 'react';
import { Button } from '@/components/tailgrids/core/button';
import { useCan } from '@/hooks/use-can';
import {
    ResourceConfirmDialog,
    createPendingConfirm,
} from './resource-confirm-dialog';
import type { PendingConfirm } from './resource-confirm-dialog';
import type { ResourceRowAction } from './types';

type ResourceActionButtonsProps<Row> = {
    /** The same row actions the index shows, for example Edit, Delete and Activity. */
    actions: ResourceRowAction<Row>[];
    target: Row;
};

const buttonVariants = {
    default: 'primary',
    primary: 'primary',
    success: 'success',
    warning: 'primary',
    danger: 'danger',
} as const;

const noop = () => {};

/**
 * The action buttons for a show page. They follow the index row actions:
 * a permission check, and a confirm dialog for actions with `confirm`.
 */
export function ResourceActionButtons<Row>({
    actions,
    target,
}: ResourceActionButtonsProps<Row>) {
    const can = useCan();
    const [pending, setPending] = useState<PendingConfirm | null>(null);

    const permitted = actions.filter(
        (action) => !action.permission || can(action.permission),
    );

    const request = (action: ResourceRowAction<Row>) => {
        if (!action.confirm) {
            action.onAction(target, { onFinish: noop });

            return;
        }

        setPending(
            createPendingConfirm(action.confirm, target, (options) =>
                action.onAction(target, options),
            ),
        );
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                {permitted.map((action) => (
                    <Button
                        key={action.key}
                        appearance="outline"
                        variant={buttonVariants[action.tone ?? 'default']}
                        onPress={() => request(action)}
                    >
                        {action.icon}
                        {action.label}
                    </Button>
                ))}
            </div>

            <ResourceConfirmDialog
                pending={pending}
                onClose={() => setPending(null)}
                onConfirm={() =>
                    pending?.run({ onFinish: () => setPending(null) })
                }
            />
        </>
    );
}
