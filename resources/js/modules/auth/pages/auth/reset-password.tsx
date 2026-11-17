import { Form, Head } from '@inertiajs/react';
import { PasswordField } from '@/components/password-field';
import { Button } from '@/components/tailgrids/core/button';
import { FieldError, FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import { TextField } from '@/components/tailgrids/core/text-field';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    return (
        <>
            <Head title="Reset password" />

            <Form
                noValidate
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="space-y-5"
            >
                {({ processing, errors }) => (
                    <>
                        <TextField
                            name="email"
                            type="email"
                            autoComplete="email"
                            defaultValue={email}
                            readOnly
                            invalid={Boolean(errors.email)}
                            className="flex w-full flex-col gap-1.5"
                        >
                            <FieldLabel>Email</FieldLabel>
                            <Input className="w-full" />
                            <FieldError>{errors.email}</FieldError>
                        </TextField>

                        <PasswordField
                            name="password"
                            label="Password"
                            autoComplete="new-password"
                            autoFocus
                            placeholder="Password"
                            error={errors.password}
                        />

                        <PasswordField
                            name="password_confirmation"
                            label="Confirm password"
                            autoComplete="new-password"
                            placeholder="Confirm password"
                            error={errors.password_confirmation}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            pending={processing}
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            Reset password
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = {
    title: 'Reset password',
    description: 'Please enter your new password below',
};
