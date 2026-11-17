import type { InertiaFormProps } from '@inertiajs/react';
import type { ChangeEvent } from 'react';
import { PasswordField } from '@/components/password-field';
import { Checkbox } from '@/components/tailgrids/core/checkbox';
import {
    FieldError,
    FieldLabel,
    FieldLegend,
} from '@/components/tailgrids/core/field';
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
    /** Derived from the model id by `ResourceForm`, never passed by a page. */
    isCreating: boolean;
};

/** User fields only. The shared `ResourceForm` provides the form and buttons. */
export function UserFields({ form, roles, isCreating }: Props) {
    const toggleRole = (roleId: number, checked: boolean) => {
        const selected = checked
            ? [...form.data.roles, roleId]
            : form.data.roles.filter((id) => id !== roleId);

        form.setData('roles', selected);
    };

    return (
        <>
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
                    isCreating
                        ? 'Password'
                        : 'New password (leave empty to keep)'
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

            <fieldset className="flex flex-col gap-3">
                <FieldLegend variant="label">Roles</FieldLegend>

                <div className="grid gap-3 md:grid-cols-2">
                    {roles.map((role) => (
                        <label
                            key={role.id}
                            className="flex items-center gap-3 rounded-lg border border-base-200 p-3"
                        >
                            <Checkbox
                                aria-label={role.name}
                                checked={form.data.roles.includes(role.id)}
                                onChange={(
                                    event: ChangeEvent<HTMLInputElement>,
                                ) => toggleRole(role.id, event.target.checked)}
                            />
                            <span className="text-sm text-title-50">
                                {role.name}
                            </span>
                        </label>
                    ))}
                </div>

                {form.errors.roles && (
                    <p className="text-sm text-input-error">
                        {form.errors.roles}
                    </p>
                )}
            </fieldset>
        </>
    );
}
