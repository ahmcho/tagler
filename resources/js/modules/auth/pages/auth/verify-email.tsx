import { Alert, Button } from '@ahmcho/tailadmin-react';
import { Form, Head, Link } from '@inertiajs/react';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <Alert
                    variant="success"
                    title="A new verification link has been sent to the email address you provided during registration."
                    className="mb-5"
                />
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button
                            type="submit"
                            fullWidth
                            variant="secondary"
                            isLoading={processing}
                            disabled={processing}
                        >
                            Resend verification email
                        </Button>

                        <Link
                            href={logout()}
                            className="mx-auto block text-sm font-medium text-brand-500 hover:text-brand-600"
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
