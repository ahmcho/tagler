import { Form, Head, Link } from '@inertiajs/react';
import { PasswordField } from '@/components/password-field';
import {
    Alert,
    AlertContent,
    AlertIndicator,
    AlertTitle,
} from '@/components/tailgrids/core/alert';
import { Button } from '@/components/tailgrids/core/button';
import { Checkbox } from '@/components/tailgrids/core/checkbox';
import { FieldError, FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import { TextField } from '@/components/tailgrids/core/text-field';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            {status && (
                <Alert status="success" className="mb-5">
                    <AlertIndicator />
                    <AlertContent>
                        <AlertTitle>{status}</AlertTitle>
                    </AlertContent>
                </Alert>
            )}

            <Form
                noValidate
                {...store.form()}
                resetOnSuccess={['password']}
                className="space-y-5"
            >
                {({ processing, errors }) => (
                    <>
                        <TextField
                            name="email"
                            type="email"
                            autoComplete="email"
                            autoFocus
                            required
                            invalid={Boolean(errors.email)}
                            className="flex w-full flex-col gap-1.5"
                        >
                            <FieldLabel>Email address</FieldLabel>
                            <Input
                                placeholder="email@example.com"
                                tabIndex={1}
                                className="w-full"
                            />
                            <FieldError>{errors.email}</FieldError>
                        </TextField>

                        <PasswordField
                            name="password"
                            label="Password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            placeholder="Password"
                            error={errors.password}
                        />

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-400">
                                <Checkbox name="remember" tabIndex={3} />
                                Remember me
                            </label>
                            {canResetPassword && (
                                <Link
                                    href={request()}
                                    tabIndex={4}
                                    className="text-sm font-medium text-primary-500 hover:text-primary-600"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                            pending={processing}
                            data-test="login-button"
                        >
                            Log in
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in',
};
