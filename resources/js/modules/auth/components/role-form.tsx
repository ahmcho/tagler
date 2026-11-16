import type { InertiaFormProps } from '@inertiajs/react';
import type { ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/tailgrids/core/button';
import { Checkbox } from '@/components/tailgrids/core/checkbox';
import { FieldError, FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import { TextField } from '@/components/tailgrids/core/text-field';

export type PermissionOption = {
    id: number;
    name: string;
    description: string | null;
};

export type RoleFormData = {
    name: string;
    permissions: number[];
};

type Props = {
    form: InertiaFormProps<RoleFormData>;
    permissions: PermissionOption[];
    submitLabel: string;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
};

export function RoleForm({
    form,
    permissions,
    submitLabel,
    onSubmit,
    onCancel,
}: Props) {
    const togglePermission = (permissionId: number, checked: boolean) => {
        const selected = checked
            ? [...form.data.permissions, permissionId]
            : form.data.permissions.filter((id) => id !== permissionId);

        form.setData('permissions', selected);
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

                <div className="grid gap-3 md:grid-cols-2">
                    {permissions.map((permission) => (
                        <label
                            key={permission.id}
                            className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800"
                        >
                            <Checkbox
                                aria-label={permission.name}
                                checked={form.data.permissions.includes(
                                    permission.id,
                                )}
                                onChange={(
                                    event: ChangeEvent<HTMLInputElement>,
                                ) =>
                                    togglePermission(
                                        permission.id,
                                        event.target.checked,
                                    )
                                }
                            />
                            <span>
                                <span className="block font-mono text-sm text-gray-800 dark:text-white/90">
                                    {permission.name}
                                </span>
                                {permission.description && (
                                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                                        {permission.description}
                                    </span>
                                )}
                            </span>
                        </label>
                    ))}
                </div>

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
