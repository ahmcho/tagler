import type { InertiaFormProps } from '@inertiajs/react';
import { X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import type { SelectOption } from '@/components/searchable-list';
import { SearchableList } from '@/components/searchable-list';
import { Button } from '@/components/tailgrids/core/button';
import { FieldError, FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import { TextField } from '@/components/tailgrids/core/text-field';
import { useSearch } from '@/hooks/use-search';
import { permissionsSearch } from '@/routes/roles';

export type SelectedPermission = {
    id: number;
    name: string;
};

export type RoleFormData = {
    name: string;
    permissions: number[];
};

type Props = {
    form: InertiaFormProps<RoleFormData>;
    initialPermissions: SelectedPermission[];
    submitLabel: string;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
};

export function RoleForm({
    form,
    initialPermissions,
    submitLabel,
    onSubmit,
    onCancel,
}: Props) {
    const [selectedPermissions, setSelectedPermissions] =
        useState(initialPermissions);

    const { loadOptions } = useSearch<SelectedPermission>({
        route: permissionsSearch,
        toOption: (permission) => ({
            value: permission.id,
            label: permission.name,
        }),
    });

    const updateSelectedPermissions = (next: SelectedPermission[]) => {
        setSelectedPermissions(next);
        form.setData(
            'permissions',
            next.map((permission) => permission.id),
        );
    };

    const addPermission = (option: SelectOption | null) => {
        if (option === null) {
            return;
        }

        const id = Number(option.value);

        if (selectedPermissions.some((permission) => permission.id === id)) {
            return;
        }

        updateSelectedPermissions([
            ...selectedPermissions,
            { id, name: option.label },
        ]);
    };

    const removePermission = (id: number) => {
        updateSelectedPermissions(
            selectedPermissions.filter((permission) => permission.id !== id),
        );
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <TextField
                value={form.data.name}
                onChange={(value) => form.setData('name', value)}
                invalid={Boolean(form.errors.name)}
                className="flex w-full flex-col gap-1.5"
            >
                <FieldLabel>Name</FieldLabel>
                <Input className="w-full" />
                <FieldError>{form.errors.name}</FieldError>
            </TextField>

            <fieldset className="space-y-3">
                <legend className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Permissions
                </legend>

                <SearchableList
                    inputId="role-permissions-search"
                    instanceId="role-permissions-search"
                    placeholder="Search permissions to add"
                    loadingMessage="Loading permissions"
                    noOptionsMessage="No permissions found"
                    loadOptions={loadOptions}
                    value={null}
                    onChange={addPermission}
                    isClearable={false}
                    hasError={Boolean(form.errors.permissions)}
                />

                {selectedPermissions.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        No permissions selected.
                    </p>
                ) : (
                    <ul className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                        {selectedPermissions.map((permission) => (
                            <li
                                key={permission.id}
                                className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 py-1 pr-1 pl-2.5 dark:border-gray-800 dark:bg-gray-800"
                            >
                                <span className="font-mono text-xs text-gray-800 dark:text-white/90">
                                    {permission.name}
                                </span>
                                <button
                                    type="button"
                                    aria-label={`Remove ${permission.name}`}
                                    onClick={() =>
                                        removePermission(permission.id)
                                    }
                                    className="cursor-pointer rounded p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                >
                                    <X className="size-3.5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {form.errors.permissions && (
                    <p className="text-sm text-red-600">
                        {form.errors.permissions}
                    </p>
                )}
            </fieldset>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" appearance="outline" onPress={onCancel}>
                    Back
                </Button>
                <Button type="submit" pending={form.processing}>
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
