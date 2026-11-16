import type { InertiaFormProps } from '@inertiajs/react';
import type { ChangeEvent, FormEvent } from 'react';
import { PasswordField } from '@/components/password-field';
import { Button } from '@/components/tailgrids/core/button';
import { Checkbox } from '@/components/tailgrids/core/checkbox';
import { FieldError, FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import { TextField } from '@/components/tailgrids/core/text-field';

export type RoleOption = {
    id: number;
    name: string;
};

export type UserFormData = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    roles: number[];
};

type Props = {
    form: InertiaFormProps<UserFormData>;
    roles: RoleOption[];
    isEdit: boolean;
    submitLabel: string;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
};

export function UserForm({
    form,
    roles,
    isEdit,
    submitLabel,
    onSubmit,
    onCancel,
}: Props) {
    const toggleRole = (roleId: number, checked: boolean) => {
        const selected = checked
            ? [...form.data.roles, roleId]
            : form.data.roles.filter((id) => id !== roleId);

        form.setData('roles', selected);
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <TextField
                value={form.data.name}
                onChange={(value) => form.setData('name', value)}
                invalid={Boolean(form.errors.name)}
                className="flex w-full flex-col gap-1.5"
            >
                <FieldLabel>Full name</FieldLabel>
                <Input className="w-full" />
                <FieldError>{form.errors.name}</FieldError>
            </TextField>

            <TextField
                value={form.data.email}
                onChange={(value) => form.setData('email', value)}
                invalid={Boolean(form.errors.email)}
                className="flex w-full flex-col gap-1.5"
            >
                <FieldLabel>Email</FieldLabel>
                <Input type="email" className="w-full" />
                <FieldError>{form.errors.email}</FieldError>
            </TextField>

            <PasswordField
                label={
                    isEdit ? 'New password (leave empty to keep)' : 'Password'
                }
                value={form.data.password}
                onChange={(value) => form.setData('password', value)}
                error={form.errors.password}
                autoComplete="new-password"
            />

            <PasswordField
                label="Confirm password"
                value={form.data.password_confirmation}
                onChange={(value) =>
                    form.setData('password_confirmation', value)
                }
                error={form.errors.password_confirmation}
                autoComplete="new-password"
            />

            <fieldset className="space-y-3">
                <legend className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Roles
                </legend>

                <div className="grid gap-3 md:grid-cols-2">
                    {roles.map((role) => (
                        <label
                            key={role.id}
                            className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800"
                        >
                            <Checkbox
                                aria-label={role.name}
                                checked={form.data.roles.includes(role.id)}
                                onChange={(
                                    event: ChangeEvent<HTMLInputElement>,
                                ) => toggleRole(role.id, event.target.checked)}
                            />
                            <span className="text-sm text-gray-800 dark:text-white/90">
                                {role.name}
                            </span>
                        </label>
                    ))}
                </div>

                {form.errors.roles && (
                    <p className="text-sm text-red-600">{form.errors.roles}</p>
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
