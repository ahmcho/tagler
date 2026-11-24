import type { ReactNode } from 'react';
import { FieldError, FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import { TextField } from '@/components/tailgrids/core/text-field';

type Props = {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
    placeholder?: string;
    ariaLabel?: string;
    maxLength?: number;
    autoFocus?: boolean;
    required?: boolean;
    startIcon?: ReactNode;
};

/** Label, input and error text in the same layout as the other forms in the admin. */
export function MediaTextField({
    label,
    value,
    onChange,
    error,
    placeholder,
    ariaLabel,
    maxLength,
    autoFocus,
    required,
    startIcon,
}: Props) {
    return (
        <TextField
            value={value}
            onChange={onChange}
            aria-label={label ? undefined : ariaLabel}
            invalid={Boolean(error)}
            required={required}
            autoFocus={autoFocus}
            className="flex w-full flex-col gap-1.5"
        >
            {label && <FieldLabel>{label}</FieldLabel>}
            <span className="relative flex items-center">
                {startIcon && (
                    <span className="pointer-events-none absolute left-3 flex">
                        {startIcon}
                    </span>
                )}
                <Input
                    className={startIcon ? 'w-full pl-9' : 'w-full'}
                    placeholder={placeholder}
                    maxLength={maxLength}
                />
            </span>
            <FieldError>{error ?? undefined}</FieldError>
        </TextField>
    );
}
