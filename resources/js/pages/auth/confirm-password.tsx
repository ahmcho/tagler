import { Button, PasswordInput } from '@ahmcho/tailadmin-react';
import { Form, Head } from '@inertiajs/react';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirm password" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="space-y-5"
            >
                {({ processing, errors }) => (
                    <>
                        <PasswordInput
                            name="password"
                            label="Password"
                            placeholder="Password"
                            autoComplete="current-password"
                            autoFocus
                            error={errors.password}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            isLoading={processing}
                            disabled={processing}
                            data-test="confirm-password-button"
                        >
                            Confirm password
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Confirm your password',
    description:
        'This is a secure area of the application. Please confirm your password before continuing.',
};
