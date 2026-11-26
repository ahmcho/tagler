import { FieldError, FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import { TextField } from '@/components/tailgrids/core/text-field';

type Props = {
    value: string;
    error: string | null;
    disabled: boolean;
    onChange: (value: string) => void;
};

/** Shown for private files only. An empty value makes the file use the global setting. Saved with the details. */
export function MediaLinkLifetime({ value, error, disabled, onChange }: Props) {
    return (
        <div className="flex flex-col gap-3">
            <TextField
                value={value}
                onChange={onChange}
                disabled={disabled}
                invalid={Boolean(error)}
                className="flex w-full flex-col gap-1.5"
            >
                <FieldLabel>Link lifetime (minutes)</FieldLabel>
                <Input
                    type="number"
                    min={1}
                    step={1}
                    placeholder="Global setting"
                    className="w-full"
                />
                <FieldError>{error ?? undefined}</FieldError>
            </TextField>
            <p className="text-xs text-text-100">
                Signed links to this file expire after this many minutes. Leave
                the field empty to use the global setting.
            </p>
        </div>
    );
}
