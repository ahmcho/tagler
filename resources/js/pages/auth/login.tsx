import {
    Alert,
    Button,
    Checkbox,
    Input,
    PasswordInput,
} from '@ahmcho/tailadmin-react';
import { Form, Head, Link } from '@inertiajs/react';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Log in" />

            {status && (
                <Alert variant="success" title={status} className="mb-5" />
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="space-y-5"
            >
                {({ processing, errors }) => (
                    <>
                        <Input
                            name="email"
                            type="email"
                            label="Email address"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            placeholder="email@example.com"
                            error={errors.email}
                        />

                        <PasswordInput
                            name="password"
                            label="Password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            placeholder="Password"
                            error={errors.password}
                        />

                        <div className="flex items-center justify-between">
                            <Checkbox
                                name="remember"
                                label="Remember me"
                                tabIndex={3}
                            />
                            {canResetPassword && (
                                <Link
                                    href={request()}
                                    tabIndex={4}
                                    className="text-sm font-medium text-brand-500 hover:text-brand-600"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            tabIndex={5}
                            disabled={processing}
                            isLoading={processing}
                            data-test="login-button"
                        >
                            Log in
                        </Button>

                        {canRegister && (
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                Don&apos;t have an account?{' '}
                                <Link
                                    href={register()}
                                    tabIndex={6}
                                    className="font-medium text-brand-500 hover:text-brand-600"
                                >
                                    Sign up
                                </Link>
                            </p>
                        )}
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
