import { Form, Head, Link } from '@inertiajs/react';
import {
    Alert,
    AlertContent,
    AlertIndicator,
    AlertTitle,
} from '@/components/tailgrids/core/alert';
import { Button } from '@/components/tailgrids/core/button';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <Alert status="success" className="mb-5">
                    <AlertIndicator />
                    <AlertContent>
                        <AlertTitle>
                            A new verification link has been sent to the email
                            address you provided during registration.
                        </AlertTitle>
                    </AlertContent>
                </Alert>
            )}

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
