import type { ReactNode } from 'react';
import { Button } from '@/components/tailgrids/core/button';
import {
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogIcon,
    DialogTitle,
} from '@/components/tailgrids/core/dialog';
import type { ResourceActionOptions, ResourceConfirm } from './types';

/** A confirm request waiting for the user. `run` starts the action once they confirm. */
export type PendingConfirm = {
    title: string;
    description: string;
    confirmLabel: string;
    icon: ReactNode;
    tone: 'default' | 'danger';
    run: (options: ResourceActionOptions) => void;
};

export function createPendingConfirm<Target>(
    confirm: ResourceConfirm<Target>,
    target: Target,
    run: (options: ResourceActionOptions) => void,
): PendingConfirm {
    return {
        title: confirm.title,
        description: confirm.description(target),
        confirmLabel: confirm.confirmLabel,
        icon: confirm.icon,
        tone: confirm.tone ?? 'default',
        run,
    };
}

type ResourceConfirmDialogProps = {
    pending: PendingConfirm | null;
    onClose: () => void;
    onConfirm: () => void;
};

export function ResourceConfirmDialog({
    pending,
    onClose,
    onConfirm,
}: ResourceConfirmDialogProps) {
    const isDanger = pending?.tone === 'danger';

    return (
        <Dialog
            isOpen={pending !== null}
            isDismissable
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    onClose();
                }
            }}
        >
            <DialogHeader>
                {pending && (
                    <DialogIcon tone={isDanger ? 'danger' : 'success'}>
                        {pending.icon}
                    </DialogIcon>
                )}
                <DialogTitle>{pending?.title}</DialogTitle>
                <DialogDescription>{pending?.description}</DialogDescription>
            </DialogHeader>

            <DialogFooter>
                <Button appearance="outline" onPress={onClose}>
                    Cancel
                </Button>
                <Button
                    variant={isDanger ? 'danger' : 'primary'}
                    onPress={onConfirm}
                >
                    {pending?.confirmLabel}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}
