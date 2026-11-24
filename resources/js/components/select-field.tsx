import type { ReactNode } from 'react';
import {
    InputGroup,
    InputGroupAddon,
} from '@/components/tailgrids/core/input-group';
import {
    Select,
    SelectContent,
    SelectIndicator,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/tailgrids/core/select';

const ALL_OPTION_KEY = '__all__';

/** A plain string is both the value and the label. Use `{ value, label }` when they differ. */
export type SelectFieldOption = string | { value: string; label: string };

type SelectFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectFieldOption[];
    allOptionLabel?: string;
    /** Icon shown at the start of the field, inside an input group. */
    startIcon?: ReactNode;
    /** Hides the visible label. It stays for screen readers. */
    hideLabel?: boolean;
};

export function SelectField({
    label,
    value,
    onChange,
    options,
    allOptionLabel,
    startIcon,
    hideLabel,
}: SelectFieldProps) {
    const selectedKey =
        value !== '' ? value : allOptionLabel ? ALL_OPTION_KEY : null;

    const trigger = (
        <SelectTrigger
            className={
                startIcon
                    ? 'min-w-0 flex-1 rounded-none border-0 bg-transparent py-0 pr-3 pl-0 focus:border-0 focus:ring-0'
                    : undefined
            }
        >
            <SelectValue />
            <SelectIndicator />
        </SelectTrigger>
    );

    return (
        <Select
            value={selectedKey}
            onChange={(key) =>
                onChange(
                    key === null || key === ALL_OPTION_KEY ? '' : String(key),
                )
            }
        >
            <SelectLabel className={hideLabel ? 'sr-only' : undefined}>
                {label}
            </SelectLabel>
            {startIcon ? (
                <InputGroup className="h-11">
                    <InputGroupAddon>{startIcon}</InputGroupAddon>
                    {trigger}
                </InputGroup>
            ) : (
                trigger
            )}
            <SelectContent>
                {allOptionLabel && (
                    <SelectItem id={ALL_OPTION_KEY}>
                        {allOptionLabel}
                    </SelectItem>
                )}
                {options.map((option) => {
                    const { value: optionValue, label: optionLabel } =
                        typeof option === 'string'
                            ? { value: option, label: option }
                            : option;

                    return (
                        <SelectItem key={optionValue} id={optionValue}>
                            {optionLabel}
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
}
