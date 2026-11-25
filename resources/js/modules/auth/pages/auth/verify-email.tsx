import { Form, Head, Link } from '@inertiajs/react';
import { Button } from '@/components/tailgrids/core/button';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail() {
    return (
        <>
            <Head title="Email verification" />

            <Form noValidate {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button
                            type="submit"
                            className="w-full"
                            appearance="outline"
                            pending={processing}
                            disabled={processing}
                        >
                            Resend verification email
                        </Button>

                        <Link
                            href={logout()}
                            className="mx-auto block text-sm font-medium text-primary-500 hover:text-primary-600"
                        >
                            Log out
                        </Link>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verify email',
    description:
        'Please verify your email address by clicking on the link we just emailed to you.',
};
