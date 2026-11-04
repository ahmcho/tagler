import { Alert, Button, Input } from '@ahmcho/tailadmin-react';
import { Form, Head, Link } from '@inertiajs/react';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot password" />

            {status && (
                <Alert variant="success" title={status} className="mb-5" />
            )}

            <Form {...email.form()} className="space-y-5">
                {({ processing, errors }) => (
                    <>
                        <Input
                            name="email"
                            type="email"
                            label="Email address"
                            autoComplete="off"
                            autoFocus
                            placeholder="email@example.com"
                            error={errors.email}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            isLoading={processing}
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
                    className="font-medium text-brand-500 hover:text-brand-600"
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
