import { Close } from '@tailgrids/icons';
import type { ComponentProps } from 'react';
import {
    Button as AriaButton,
    Dialog as AriaDialog,
    Modal as AriaModal,
    ModalOverlay as AriaModalOverlay,
    Heading,
} from 'react-aria-components';
import type {
    DialogProps as AriaDialogProps,
    HeadingProps,
} from 'react-aria-components';
import { cn } from '@/utils/cn';
import type { ButtonProps } from './button';
import { Button } from './button';
import type { DescriptionProps } from './description';
import { Description } from './description';

export interface DialogProps extends AriaDialogProps {
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    showCloseButton?: boolean;
    isDismissable?: boolean;
}

export function Dialog({
    isOpen,
    defaultOpen,
    onOpenChange,
    className,
    showCloseButton = true,
    isDismissable = false,
    children,
    ...props
}: DialogProps) {
    return (
        <AriaModalOverlay
            isOpen={isOpen}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            isDismissable={isDismissable}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 dark:bg-black/70"
        >
            <AriaModal>
                <AriaDialog
                    className={cn(
                        'fixed top-1/2 left-1/2 w-full max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-base-100 bg-background-100 p-6 shadow-[0_12px_16px_-4px_rgb(16_24_40/0.08),0_4px_6px_-2px_rgb(16_24_40/0.03)] outline-none max-sm:max-w-[calc(100%-2rem)] dark:border-base-200 dark:shadow-[0_12px_16px_-4px_rgb(0_0_0/0.5)]',
                        className,
                    )}
                    {...props}
                >
                    {({ close }) => (
                        <>
                            {typeof children === 'function'
                                ? children({ close })
                                : children}
                            {showCloseButton && (
                                <AriaButton
                                    onPress={close}
                                    aria-label="Close"
                                    className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-lg text-text-100 opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none [&>svg]:size-6"
                                >
                                    <Close />
                                    <span className="sr-only">Close</span>
                                </AriaButton>
                            )}
                        </>
                    )}
                </AriaDialog>
            </AriaModal>
        </AriaModalOverlay>
    );
}

export type DialogIconProps = ComponentProps<'div'> & {
    tone?: 'success' | 'danger';
};

export function DialogIcon({
    tone = 'success',
    className,
    children,
    ...props
}: DialogIconProps) {
    return (
        <div
            data-slot="dialog-icon"
            className={cn(
                'mb-4 flex size-16 items-center justify-center rounded-full [&>svg]:size-8',
                tone === 'success' && 'bg-success-500/10 text-success-500',
                tone === 'danger' && 'bg-error-500/10 text-error-500',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export type DialogHeaderProps = ComponentProps<'div'>;

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
    return (
        <div
            data-slot="dialog-header"
            className={cn(
                'flex flex-col items-center gap-2 pr-8 text-center',
                className,
            )}
            {...props}
        />
    );
}

export interface DialogTitleProps extends HeadingProps {
    className?: string;
}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
    return (
        <Heading
            slot="title"
            className={cn(
                'text-2xl leading-8 font-semibold text-title-50',
                className,
            )}
            {...props}
        />
    );
}

export type DialogDescriptionProps = DescriptionProps;

export function DialogDescription({
    className,
    ...props
}: DialogDescriptionProps) {
    return (
        <Description
            className={cn('text-base leading-6 text-text-100', className)}
            {...props}
        />
    );
}

export type DialogBodyProps = ComponentProps<'div'>;

export function DialogBody({ className, ...props }: DialogBodyProps) {
    return (
        <div
            data-slot="dialog-body"
            className={cn('py-4 text-left text-sm text-text-100', className)}
            {...props}
        />
    );
}

export interface DialogFooterProps extends ComponentProps<'div'> {
    showCloseButton?: boolean;
}

export function DialogFooter({
    className,
    children,
    ...props
}: DialogFooterProps) {
    return (
        <div
            data-slot="dialog-footer"
            className={cn(
                'flex flex-col-reverse gap-3 pt-6 sm:flex-row [&>*]:flex-1',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export type DialogCloseProps = Omit<ButtonProps, 'slot'>;

export function DialogClose({ ...props }: DialogCloseProps) {
    return <Button slot="close" {...props} />;
}
