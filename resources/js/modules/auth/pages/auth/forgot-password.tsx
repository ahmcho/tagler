import { Form, Head, Link } from '@inertiajs/react';
import { Button } from '@/components/tailgrids/core/button';
import { FieldError, FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import { TextField } from '@/components/tailgrids/core/text-field';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword() {
    return (
        <>
            <Head title="Forgot password" />

            <Form noValidate {...email.form()} className="space-y-5">
                {({ processing, errors }) => (
                    <>
                        <TextField
                            name="email"
                            type="email"
                            autoComplete="off"
                            autoFocus
                            invalid={Boolean(errors.email)}
                            className="flex w-full flex-col gap-1.5"
                        >
                            <FieldLabel>Email address</FieldLabel>
                            <Input
                                placeholder="email@example.com"
                                className="w-full"
                            />
                            <FieldError>{errors.email}</FieldError>
                        </TextField>

                        <Button
                            type="submit"
                            className="w-full"
                            pending={processing}
                            disabled={processing}
                            data-test="email-password-reset-link-button"
                        >
                            Email password reset link
                        </Button>
                    </>
                )}
            </Form>

            <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
                Or, return to{' '}
                <Link
                    href={login()}
                    className="font-medium text-primary-500 hover:text-primary-600"
                >
                    log in
                </Link>
            </p>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Forgot password',
    description: 'Enter your email to receive a password reset link',
};
