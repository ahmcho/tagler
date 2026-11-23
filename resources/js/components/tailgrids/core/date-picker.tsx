'use client';

import {
    Button as AriaButton,
    DatePicker as AriaDatePicker,
    Group as AriaGroup,
    Popover as AriaPopover,
} from 'react-aria-components';
import type {
    ButtonProps as AriaButtonProps,
    DatePickerProps as AriaDatePickerProps,
    GroupProps as AriaGroupProps,
    PopoverProps as AriaPopoverProps,
    DateValue,
} from 'react-aria-components';
import { cn } from '@/utils/cn';

export interface DatePickerProps<T extends DateValue> extends Omit<
    AriaDatePickerProps<T>,
    'isDisabled' | 'isReadOnly' | 'isRequired' | 'isInvalid'
> {
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    invalid?: boolean;
}

export function DatePicker<T extends DateValue>({
    children,
    disabled = false,
    readOnly = false,
    required = false,
    invalid = false,
    className,
    ...props
}: DatePickerProps<T>) {
    return (
        <AriaDatePicker
            isDisabled={disabled}
            isReadOnly={readOnly}
            isRequired={required}
            isInvalid={invalid}
            className={cn('flex w-full flex-col gap-1', className)}
            {...props}
        >
            {children}
        </AriaDatePicker>
    );
}

type DatePickerGroupProps = AriaGroupProps;

export function DatePickerGroup({
    className,
    children,
    ...props
}: DatePickerGroupProps) {
    return (
        <AriaGroup className={cn('relative', className)} {...props}>
            {children}
        </AriaGroup>
    );
}

type DatePickerTriggerProps = AriaButtonProps;

export function DatePickerTrigger({
    className,
    children,
    ...props
}: DatePickerTriggerProps) {
    return (
        <AriaButton
            slot="trigger"
            className={cn(
                'absolute top-1/2 right-5 -translate-y-1/2 rounded-full outline-offset-5 [:where(&>svg)]:size-5',
                className,
            )}
            {...props}
        >
            {children}
        </AriaButton>
    );
}

export type DatePickerPopoverProps = AriaPopoverProps;

export function DatePickerPopover({
    className,
    children,
    ...props
}: DatePickerPopoverProps) {
    return (
        <AriaPopover
            placement="bottom start"
            className={cn(className)}
            {...props}
        >
            {children}
        </AriaPopover>
    );
}
