'use client';

import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { useRef } from 'react';
import type { ComponentProps, SVGProps } from 'react';
import { cn } from '@/utils/cn';

const checkboxStyles = cva(
    'grid place-items-center border border-base-200 bg-checkbox-background transition group-hover:border-checkbox-checked-border peer-checked:border-checkbox-checked-border! peer-checked:bg-checkbox-checked-background peer-focus:border-primary-300 peer-focus:ring-4 peer-focus:ring-checkbox-checked-border/20 peer-disabled:border-base-50 [&>svg]:hidden [&>svg]:text-checkbox-checked-icon-color peer-checked:[&>svg]:block peer-disabled:[&>svg]:text-(--border-color-base-50)',
    {
        variants: {
            size: {
                sm: 'size-4 rounded [&>svg]:size-3',
                md: 'size-5 rounded-md [&>svg]:size-3.5',
            },
        },
        defaultVariants: {
            size: 'sm',
        },
    },
);

type PropsType = Omit<ComponentProps<'input'>, 'size'> &
    VariantProps<typeof checkboxStyles> & {};

export function Checkbox({
    size,
    disabled,
    className,
    ...inputProps
}: PropsType) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (inputRef.current && !disabled) {
            inputRef.current.click();
        }
    };

    return (
        <div className={cn('group inline-flex select-none', className)}>
            <input
                ref={inputRef}
                type="checkbox"
                className="peer sr-only"
                disabled={disabled}
                {...inputProps}
            />

            <div
                className={cn(
                    checkboxStyles({ size }),
                    !disabled && 'cursor-pointer',
                )}
                onClick={handleClick}
            >
                <CheckIcon />
            </div>
        </div>
    );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={14}
            height={14}
            viewBox="0 0 14 14"
            fill="none"
            className="stroke-checkbox-checked-icon-color"
            {...props}
        >
            <path
                d="M11.667 3.5L5.25 9.917 2.333 7"
                stroke="currentColor"
                strokeWidth={1.94437}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
