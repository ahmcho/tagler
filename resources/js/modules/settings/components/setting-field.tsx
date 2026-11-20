import { useEffect, useMemo } from 'react';
import type { ComponentType } from 'react';
import { Button } from '@/components/tailgrids/core/button';
import {
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import {
    Select,
    SelectContent,
    SelectDescription,
    SelectErrorMessage,
    SelectIndicator,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/tailgrids/core/select';
import { TextField } from '@/components/tailgrids/core/text-field';
import { AllowedMimeTypes, SettingInputEnum } from '@/types/generated';

export type SettingOption = {
    value: string;
    label: string;
};

export type SettingField = {
    key: string;
    label: string;
    description: string;
    tab: string;
    input: SettingInputEnum;
    options: SettingOption[];
    value: string | number | boolean | null;
    required: boolean;
};

export type SettingValue = string | File | null;

type SettingControlProps = {
    field: SettingField;
    value: SettingValue;
    error?: string;
    onChange: (value: SettingValue) => void;
    onReset: () => void;
};

function TextSettingControl({
    field,
    value,
    error,
    onChange,
}: SettingControlProps) {
    return (
        <TextField
            name={`settings.${field.key}`}
            value={typeof value === 'string' ? value : ''}
            onChange={onChange}
            required={field.required}
            invalid={Boolean(error)}
            className="flex w-full flex-col gap-1.5"
        >
            <FieldLabel>{field.label}</FieldLabel>
            <Input className="w-full" />
            <FieldDescription>{field.description}</FieldDescription>
            <FieldError>{error}</FieldError>
        </TextField>
    );
}

function SelectSettingControl({
    field,
    value,
    error,
    onChange,
}: SettingControlProps) {
    return (
        <Select
            name={`settings.${field.key}`}
            value={typeof value === 'string' ? value : null}
            onChange={(key) => onChange(key === null ? null : String(key))}
            isRequired={field.required}
            isInvalid={Boolean(error)}
        >
            <SelectLabel>{field.label}</SelectLabel>
            <SelectTrigger>
                <SelectValue />
                <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
                {field.options.map((option) => (
                    <SelectItem key={option.value} id={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
            <SelectDescription>{field.description}</SelectDescription>
            <SelectErrorMessage>{error}</SelectErrorMessage>
        </Select>
    );
}

function FileSettingControl({
    field,
    value,
    error,
    onChange,
    onReset,
}: SettingControlProps) {
    const previewUrl = useMemo(
        () => (value instanceof File ? URL.createObjectURL(value) : null),
        [value],
    );

    useEffect(() => {
        return () => {
            if (previewUrl !== null) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const currentUrl = previewUrl ?? String(field.value ?? '');
    const isUploaded = currentUrl.startsWith('/storage/');

    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {field.label}
            </label>
            <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-2">
                <input
                    type="file"
                    name={`settings.${field.key}`}
                    accept={AllowedMimeTypes.Png}
                    onChange={(event) =>
                        onChange(event.target.files?.[0] ?? null)
                    }
                    className="h-11 w-full min-w-0 cursor-pointer overflow-hidden rounded-[10px] border border-gray-300 bg-transparent text-sm text-gray-500 shadow-xs transition-colors file:me-4 file:h-full file:cursor-pointer file:border-0 file:border-e file:border-solid file:border-gray-200 file:bg-gray-50 file:px-3.5 file:py-2.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-100 focus:border-primary-300 focus:ring-3 focus:ring-primary-500/20 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:file:border-gray-800 dark:file:bg-white/5 dark:file:text-gray-300 dark:hover:file:bg-white/10 dark:focus:border-primary-500/40"
                />
                <div className="flex min-w-0 items-center gap-3">
                    <img
                        src={currentUrl}
                        alt={field.label}
                        className="size-8 shrink-0 rounded"
                    />
                    {isUploaded && value === null && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="flex-1 whitespace-nowrap"
                            onPress={onReset}
                        >
                            Reset to default
                        </Button>
                    )}
                </div>
            </div>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                {field.description}
            </p>
            {error && (
                <p className="mt-1.5 text-sm font-normal text-input-error">
                    {error}
                </p>
            )}
        </div>
    );
}

/**
 * One control per SettingInputEnum case. The Record type makes a new case
 * fail to compile until it has a control here.
 */
const SETTING_CONTROLS: Record<
    SettingInputEnum,
    ComponentType<SettingControlProps>
> = {
    [SettingInputEnum.Text]: TextSettingControl,
    [SettingInputEnum.File]: FileSettingControl,
    [SettingInputEnum.Select]: SelectSettingControl,
};

export function SettingFieldControl(props: SettingControlProps) {
    const Control = SETTING_CONTROLS[props.field.input];

    return <Control {...props} />;
}
