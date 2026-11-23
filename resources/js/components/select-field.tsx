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
};

export function SelectField({
    label,
    value,
    onChange,
    options,
    allOptionLabel,
}: SelectFieldProps) {
    const selectedKey =
        value !== '' ? value : allOptionLabel ? ALL_OPTION_KEY : null;

    return (
        <Select
            value={selectedKey}
            onChange={(key) =>
                onChange(
                    key === null || key === ALL_OPTION_KEY ? '' : String(key),
                )
            }
        >
            <SelectLabel>{label}</SelectLabel>
            <SelectTrigger>
                <SelectValue />
                <SelectIndicator />
            </SelectTrigger>
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
