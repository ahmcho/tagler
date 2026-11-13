import {
    DialogTrigger as AriaDialogTrigger,
    ModalOverlay as AriaModalOverlay,
} from 'react-aria-components';
import type {
    DialogTriggerProps as AriaDialogTriggerProps,
    ModalOverlayProps as AriaModalOverlayProps,
} from 'react-aria-components';
import { cn } from '@/utils/cn';

export type OverlayWrapperProps = AriaDialogTriggerProps;

export function OverlayWrapper({ ...props }: OverlayWrapperProps) {
    return <AriaDialogTrigger {...props} />;
}

export type BackdropProps = AriaModalOverlayProps;

export function Backdrop({
    className,
    isDismissable = true,
    ...props
}: BackdropProps) {
    return (
        <AriaModalOverlay
            isDismissable={isDismissable}
            className={cn(
                'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200',
                className,
            )}
            {...props}
        />
    );
}
