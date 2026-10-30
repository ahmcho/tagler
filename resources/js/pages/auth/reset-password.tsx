import { Button, Input, PasswordInput } from '@ahmcho/tailadmin-react';
import { Form, Head } from '@inertiajs/react';
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
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="space-y-5"
            >
                {({ processing, errors }) => (
                    <>
                        <Input
                            name="email"
                            type="email"
                            label="Email"
                            autoComplete="email"
                            value={email}
                            readOnly
                            error={errors.email}
                        />

                        <PasswordInput
                            name="password"
                            label="Password"
                            autoComplete="new-password"
                            autoFocus
                            placeholder="Password"
                            error={errors.password}
                        />

                        <PasswordInput
                            name="password_confirmation"
                            label="Confirm password"
                            autoComplete="new-password"
                            placeholder="Confirm password"
                            error={errors.password_confirmation}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            isLoading={processing}
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
