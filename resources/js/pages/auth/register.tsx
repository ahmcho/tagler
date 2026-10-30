import { Button, Input, PasswordInput } from '@ahmcho/tailadmin-react';
import { Form, Head, Link } from '@inertiajs/react';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="space-y-5"
            >
                {({ processing, errors }) => (
                    <>
                        <Input
                            name="name"
                            type="text"
                            label="Name"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            placeholder="Full name"
                            error={errors.name}
                        />

                        <Input
                            name="email"
                            type="email"
                            label="Email address"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            placeholder="email@example.com"
                            error={errors.email}
                        />

                        <PasswordInput
                            name="password"
                            label="Password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            placeholder="Password"
                            error={errors.password}
                        />

                        <PasswordInput
                            name="password_confirmation"
                            label="Confirm password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            placeholder="Confirm password"
                            error={errors.password_confirmation}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            tabIndex={5}
                            isLoading={processing}
                            disabled={processing}
                            data-test="register-user-button"
                        >
                            Create account
                        </Button>

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link
                                href={login()}
                                tabIndex={6}
                                className="font-medium text-brand-500 hover:text-brand-600"
                            >
                                Log in
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create an account',
    description: 'Enter your details below to create your account',
};
