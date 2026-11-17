import type { InertiaFormProps } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import type { SelectOption } from '@/components/searchable-list';
import { SearchableList } from '@/components/searchable-list';
import {
    FieldError,
    FieldLabel,
    FieldLegend,
} from '@/components/tailgrids/core/field';
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
};

/** Role fields only. The shared `ResourceForm` provides the form and buttons. */
export function RoleFields({ form, initialPermissions }: Props) {
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
        <>
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

            <fieldset className="flex flex-col gap-3">
                <FieldLegend variant="label">Permissions</FieldLegend>

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
                    <p className="text-sm text-text-100">
                        No permissions selected.
                    </p>
                ) : (
                    <ul className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                        {selectedPermissions.map((permission) => (
                            <li
                                key={permission.id}
                                className="flex items-center gap-1.5 rounded-md border border-base-200 bg-background-soft-100 py-1 pr-1 pl-2.5"
                            >
                                <span className="font-mono text-xs text-title-50">
                                    {permission.name}
                                </span>
                                <button
                                    type="button"
                                    aria-label={`Remove ${permission.name}`}
                                    onClick={() =>
                                        removePermission(permission.id)
                                    }
                                    className="cursor-pointer rounded p-0.5 text-text-100 hover:bg-background-soft-300 hover:text-title-50"
                                >
                                    <X className="size-3.5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {form.errors.permissions && (
                    <p className="text-sm text-input-error">
                        {form.errors.permissions}
                    </p>
                )}
            </fieldset>
        </>
    );
}
