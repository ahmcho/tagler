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

type SelectFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
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
                {options.map((option) => (
                    <SelectItem key={option} id={option}>
                        {option}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
