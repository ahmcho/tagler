'use client';

import { ChevronDown } from '@tailgrids/icons';
import type { ComponentProps, ReactNode } from 'react';
import {
    Button as AriaButton,
    ListBox as AriaListBox,
    ListBoxItem as AriaListBoxItem,
    Popover as AriaPopover,
    Select as AriaSelect,
    SelectValue as AriaSelectValue,
} from 'react-aria-components';
import {
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/components/tailgrids/core/field';
import { cn } from '@/utils/cn';

type SelectKey = string | number;

export interface SelectProps {
    value?: SelectKey | null;
    onChange?: (value: SelectKey | null) => void;
    name?: string;
    isDisabled?: boolean;
    isInvalid?: boolean;
    isRequired?: boolean;
    className?: string;
    children: ReactNode;
}

export function Select({
    value,
    onChange,
    name,
    isDisabled,
    isInvalid,
    isRequired,
    className,
    children,
}: SelectProps) {
    return (
        <AriaSelect
            className={cn('flex w-full flex-col gap-1.5', className)}
            selectedKey={value}
            onSelectionChange={(key) => onChange?.(key)}
            name={name}
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            isRequired={isRequired}
        >
            {children}
        </AriaSelect>
    );
}

export function SelectLabel({
    className,
    ...props
}: ComponentProps<typeof FieldLabel>) {
    return <FieldLabel className={className} {...props} />;
}

export function SelectDescription({
    className,
    ...props
}: ComponentProps<typeof FieldDescription>) {
    return <FieldDescription className={className} {...props} />;
}

export function SelectErrorMessage({
    className,
    ...props
}: ComponentProps<typeof FieldError>) {
    return <FieldError className={className} {...props} />;
}

export function SelectTrigger({
    className,
    isInvalid,
    children,
    ...props
}: ComponentProps<typeof AriaButton> & { isInvalid?: boolean }) {
    return (
        <AriaButton
            className={cn(
                'flex w-full items-center justify-between gap-2 rounded-lg border border-base-300 bg-input-background px-4 py-2.5 text-left text-title-50 outline-none focus:border-input-primary-focus-border focus:ring-4 focus:ring-input-primary-focus-border/20 data-disabled:border-base-100 data-disabled:text-input-disabled-text',
                isInvalid &&
                    'border-input-error-focus-border focus:ring-input-error-focus-border/20',
                className,
            )}
            {...props}
        >
            {children}
        </AriaButton>
    );
}

export function SelectValue({
    className,
    ...props
}: ComponentProps<typeof AriaSelectValue>) {
    return (
        <AriaSelectValue
            className={cn(
                'flex-1 truncate data-placeholder:text-text-100',
                className,
            )}
            {...props}
        />
    );
}

export function SelectIndicator({
    className,
    children,
}: {
    className?: string;
    children?: ReactNode;
}) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'pointer-events-none flex items-center text-title-50',
                className,
            )}
        >
            {children ?? <ChevronDown className="h-5 w-5" />}
        </span>
    );
}

export function SelectContent({
    className,
    children,
    ...props
}: ComponentProps<typeof AriaPopover> & { children: ReactNode }) {
    return (
        <AriaPopover
            className={cn(
                'min-w-(--trigger-width) overflow-auto rounded-xl bg-dropdown-background shadow-md outline-hidden',
                className,
            )}
            {...props}
        >
            <AriaListBox className="max-h-72 overflow-auto p-1 outline-hidden">
                {children}
            </AriaListBox>
        </AriaPopover>
    );
}

export function SelectItem({
    className,
    ...props
}: ComponentProps<typeof AriaListBoxItem>) {
    return (
        <AriaListBoxItem
            className={cn(
                'group flex w-full cursor-default items-center gap-3 rounded-md px-3 py-2 text-sm text-text-50 outline-hidden focus:bg-dropdown-hover-background focus:text-title-50 data-disabled:text-input-disabled-text data-selected:font-medium',
                className,
            )}
            {...props}
        />
    );
}
