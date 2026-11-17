import { SearchableList } from '@/components/searchable-list';
import type { SelectOption } from '@/components/searchable-list';
import { SelectField } from '@/components/select-field';
import { FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import { TextField } from '@/components/tailgrids/core/text-field';
import type { ResourceFilterField } from './types';

type ResourceFilterFieldsProps = {
    fields: ResourceFilterField[];
    textValues: Record<string, string>;
    optionValues: Record<string, SelectOption | null>;
    onTextChange: (name: string, value: string) => void;
    onOptionChange: (name: string, option: SelectOption | null) => void;
};

/** Renders the filter panel body from the declared field list. */
export function ResourceFilterFields({
    fields,
    textValues,
    optionValues,
    onTextChange,
    onOptionChange,
}: ResourceFilterFieldsProps) {
    return (
        <div className="space-y-4">
            {fields.map((field) => {
                if (field.type === 'select') {
                    return (
                        <SelectField
                            key={field.name}
                            label={field.label}
                            value={textValues[field.name] ?? ''}
                            onChange={(value) =>
                                onTextChange(field.name, value)
                            }
                            options={field.options}
                            allOptionLabel={field.allLabel}
                        />
                    );
                }

                if (field.type === 'text') {
                    return (
                        <TextField
                            key={field.name}
                            value={textValues[field.name] ?? ''}
                            onChange={(value) =>
                                onTextChange(field.name, value)
                            }
                            className="flex w-full flex-col gap-1.5"
                        >
                            <FieldLabel>{field.label}</FieldLabel>
                            <Input
                                inputMode={field.inputMode}
                                className="w-full"
                            />
                        </TextField>
                    );
                }

                return (
                    <SearchableList
                        key={field.name}
                        inputId={`${field.name}-filter`}
                        instanceId={`${field.name}-filter`}
                        placeholder={field.placeholder}
                        loadingMessage={field.loadingMessage}
                        noOptionsMessage={field.noOptionsMessage}
                        loadOptions={field.loadOptions}
                        value={optionValues[field.name] ?? null}
                        onChange={(option) =>
                            onOptionChange(field.name, option)
                        }
                    />
                );
            })}
        </div>
    );
}
