import type { ReactNode } from 'react';
import {
    DatePickerField,
    toCalendarDate,
} from '@/components/date-picker-field';
import {
    DateRangePickerField,
    formatCalendarRange,
    toCalendarRange,
} from '@/components/date-range-picker-field';
import { SearchableList } from '@/components/searchable-list';
import type { SelectOption } from '@/components/searchable-list';
import { SelectField } from '@/components/select-field';
import { FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import { TextField } from '@/components/tailgrids/core/text-field';
import type {
    ResourceDateFilter,
    ResourceDateRangeFilter,
    ResourceFilterField,
    ResourceSearchableFilter,
    ResourceSelectFilter,
    ResourceTextFilter,
} from './types';

type ResourceFilterFieldsProps = {
    fields: ResourceFilterField[];
    wide?: boolean;
    textValues: Record<string, string>;
    optionValues: Record<string, SelectOption | null>;
    onTextChange: (name: string, value: string) => void;
    onOptionChange: (name: string, option: SelectOption | null) => void;
};

type FilterValueProps = Omit<ResourceFilterFieldsProps, 'fields' | 'wide'>;

function renderSelectFilter(
    field: ResourceSelectFilter,
    { textValues, onTextChange }: FilterValueProps,
): ReactNode {
    return (
        <SelectField
            key={field.name}
            label={field.label}
            value={textValues[field.name] ?? ''}
            onChange={(value) => onTextChange(field.name, value)}
            options={field.options}
            allOptionLabel={field.allLabel}
        />
    );
}

function renderDateFilter(
    field: ResourceDateFilter,
    { textValues, onTextChange }: FilterValueProps,
): ReactNode {
    return (
        <DatePickerField
            key={field.name}
            label={field.label}
            value={toCalendarDate(textValues[field.name] ?? '')}
            onChange={(next) =>
                onTextChange(field.name, next ? next.toString() : '')
            }
        />
    );
}

function renderDateRangeFilter(
    field: ResourceDateRangeFilter,
    { textValues, onTextChange }: FilterValueProps,
): ReactNode {
    return (
        <DateRangePickerField
            key={field.name}
            label={field.label}
            value={toCalendarRange(textValues[field.name] ?? '')}
            onChange={(next) =>
                onTextChange(field.name, next ? formatCalendarRange(next) : '')
            }
        />
    );
}

function renderTextFilter(
    field: ResourceTextFilter,
    { textValues, onTextChange }: FilterValueProps,
): ReactNode {
    return (
        <TextField
            key={field.name}
            value={textValues[field.name] ?? ''}
            onChange={(value) => onTextChange(field.name, value)}
            className="flex w-full flex-col gap-1.5"
        >
            <FieldLabel>{field.label}</FieldLabel>
            <Input inputMode={field.inputMode} className="w-full" />
        </TextField>
    );
}

function renderSearchableFilter(
    field: ResourceSearchableFilter,
    { optionValues, onOptionChange }: FilterValueProps,
): ReactNode {
    return (
        <SearchableList
            key={field.name}
            inputId={`${field.name}-filter`}
            placeholder={field.placeholder}
            loadingMessage={field.loadingMessage}
            noOptionsMessage={field.noOptionsMessage}
            loadOptions={field.loadOptions}
            value={optionValues[field.name] ?? null}
            onChange={(option) => onOptionChange(field.name, option)}
        />
    );
}

function renderFilterField(
    field: ResourceFilterField,
    values: FilterValueProps,
): ReactNode {
    switch (field.type) {
        case 'select':
            return renderSelectFilter(field, values);
        case 'date':
            return renderDateFilter(field, values);
        case 'daterange':
            return renderDateRangeFilter(field, values);
        case 'text':
            return renderTextFilter(field, values);
        case 'searchable':
            return renderSearchableFilter(field, values);
    }
}

/** Renders the filter panel body from the declared field list. */
export function ResourceFilterFields({
    fields,
    wide,
    ...values
}: ResourceFilterFieldsProps) {
    return (
        <div
            className={
                wide ? 'grid grid-cols-1 gap-4 sm:grid-cols-2' : 'space-y-4'
            }
        >
            {fields.map((field) => renderFilterField(field, values))}
        </div>
    );
}
