'use client';

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { Button } from '@/components/tailgrids/core/button';
import type { ButtonProps } from '@/components/tailgrids/core/button';
import { Input } from '@/components/tailgrids/core/input';
import type { InputProps } from '@/components/tailgrids/core/input';
import { cn } from '@/utils/cn';

export type InputGroupProps = ComponentProps<'div'>;

export function InputGroup({ className, ...props }: InputGroupProps) {
    return (
        <div
            data-slot="input-group"
            role="group"
            className={cn(
                'group flex w-full items-center rounded-lg border border-base-300 bg-input-background transition-all focus-within:border-input-primary-focus-border focus-within:ring-4 focus-within:ring-input-primary-focus-border/20',
                className,
            )}
            {...props}
        />
    );
}

export type InputGroupInputProps = InputProps;

export function InputGroupInput({ className, ...props }: InputGroupInputProps) {
    return (
        <Input
            data-slot="input-group-control"
            className={cn(
                'w-full min-w-0 flex-1 rounded-none border-none bg-transparent px-0 shadow-none group-[:has(>input:first-child)]:pl-3 group-[:has(>input:last-child)]:pr-3 focus:border-none focus:ring-0',
                className,
            )}
            {...props}
        />
    );
}

const inputGroupAddonStyles = cva(
    'flex shrink-0 items-center justify-center px-3 text-sm text-title-50 [&>svg]:h-lh',
    {
        variants: {
            align: {
                'inline-start': 'order-first',
                'inline-end': 'order-last',
            },
        },
        defaultVariants: {
            align: 'inline-start',
        },
    },
);

export interface InputGroupAddonProps
    extends ComponentProps<'div'>, VariantProps<typeof inputGroupAddonStyles> {}

export function InputGroupAddon({
    className,
    align,
    ...props
}: InputGroupAddonProps) {
    return (
        <div
            data-slot="input-group-addon"
            data-align={align}
            className={cn(inputGroupAddonStyles({ align }), className)}
            {...props}
        />
    );
}

export type InputGroupButtonProps = ButtonProps;

export function InputGroupButton({
    className,
    size = 'xs',
    variant = 'ghost',
    ...props
}: InputGroupButtonProps) {
    return (
        <Button
            type="button"
            size={size}
            variant={variant}
            iconOnly
            data-slot="input-group-button"
            className={cn('rounded-md', className)}
            {...props}
        />
    );
}
