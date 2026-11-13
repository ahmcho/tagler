import type { ComponentProps } from 'react';
import { cn } from '@/utils/cn';

export function Card({ children, className }: ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'flex w-full flex-col gap-3 rounded-2xl bg-card-background-50 md:min-w-sm',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className }: ComponentProps<'div'>) {
    return (
        <div className={cn('relative w-full px-5 pt-5', className)}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className }: ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'text-xl leading-7 font-semibold -tracking-[0.2px] text-title-50 md:text-2xl',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function CardDescription({
    children,
    className,
}: ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'mt-0.5 text-base leading-6 -tracking-[0.2px] text-text-100',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function CardAction({ children, className }: ComponentProps<'div'>) {
    return (
        <div className={cn('absolute top-5 right-5 text-text-50', className)}>
            {children}
        </div>
    );
}

export function CardContent({ children, className }: ComponentProps<'div'>) {
    return (
        <div className={cn('px-5 text-text-100', className)}>{children}</div>
    );
}

export function CardFooter({ children, className }: ComponentProps<'div'>) {
    return <div className={cn('px-5 pb-5', className)}>{children}</div>;
}
