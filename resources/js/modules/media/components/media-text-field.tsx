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
            <Input
                className="w-full"
                placeholder={placeholder}
                maxLength={maxLength}
            />
            <FieldError>{error ?? undefined}</FieldError>
        </TextField>
    );
}
