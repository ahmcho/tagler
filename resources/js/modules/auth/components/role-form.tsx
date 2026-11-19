import type { InertiaFormProps } from '@inertiajs/react';
import { DualListBox } from '@/components/dual-list-box';
import {
    FieldError,
    FieldLabel,
    FieldLegend,
} from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import { TextField } from '@/components/tailgrids/core/text-field';

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
    permissions: SelectedPermission[];
};

/** Role fields only. The shared `ResourceForm` provides the form and buttons. */
export function RoleFields({ form, permissions }: Props) {
    const permissionOptions = permissions.map((permission) => ({
        value: permission.id,
        label: permission.name,
    }));

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

                <DualListBox
                    id="role-permissions"
                    options={permissionOptions}
                    value={form.data.permissions}
                    onChange={(value) =>
                        form.setData(
                            'permissions',
                            value.map((id) => Number(id)),
                        )
                    }
                    hasError={Boolean(form.errors.permissions)}
                />

                {form.errors.permissions && (
                    <p className="text-sm text-input-error">
                        {form.errors.permissions}
                    </p>
                )}
            </fieldset>
        </>
    );
}
