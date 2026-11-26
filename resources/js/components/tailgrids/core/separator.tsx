'use client';

import { cva } from 'class-variance-authority';
import { Separator as AriaSeparator } from 'react-aria-components';
import type { SeparatorProps as AriaSeparatorProps } from 'react-aria-components';
import { cn } from '@/utils/cn';

const separatorStyles = cva('shrink-0 bg-(--border-color-base-200)', {
    variants: {
        orientation: {
            horizontal: 'h-[1px] w-full',
            vertical: 'h-full w-[1px]',
        },
    },
    defaultVariants: {
        orientation: 'horizontal',
    },
});

export type SeparatorProps = AriaSeparatorProps;

export function Separator({
    className,
    orientation = 'horizontal',
    ...props
}: SeparatorProps) {
    return (
        <AriaSeparator
            orientation={orientation}
            className={cn(separatorStyles({ orientation }), className)}
            {...props}
        />
    );
}
