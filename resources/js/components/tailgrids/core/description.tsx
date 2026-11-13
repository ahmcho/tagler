'use client';

import type { TextProps } from 'react-aria-components';
import { Text } from 'react-aria-components';
import { cn } from '@/utils/cn';

export type DescriptionProps = Omit<TextProps, 'slot'>;

export function Description({ className, ...props }: DescriptionProps) {
    return (
        <Text
            slot="description"
            data-slot="description"
            className={cn('text-sm text-text-50', className)}
            {...props}
        />
    );
}
