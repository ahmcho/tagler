import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Input,
} from '@ahmcho/tailadmin-react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Profile settings" />

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Profile information
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Update your name and email address
                            </p>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Form
                            {...ProfileController.update.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            className="space-y-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <Input
                                        name="name"
                                        label="Name"
                                        defaultValue={auth.user.name}
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                        error={errors.name}
                                    />

                                    <Input
                                        name="email"
                                        type="email"
                                        label="Email address"
                                        defaultValue={auth.user.email}
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                        error={errors.email}
                                    />

                                    {mustVerifyEmail &&
                                        auth.user.email_verified_at ===
                                            null && (
                                            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                                <p>
                                                    Your email address is
                                                    unverified.{' '}
                                                    <Link
                                                        href={send()}
                                                        as="button"
                                                        className="font-medium text-brand-500 hover:text-brand-600"
                                                    >
                                                        Click here to resend the
                                                        verification email.
                                                    </Link>
                                                </p>

                                                {status ===
                                                    'verification-link-sent' && (
                                                    <p className="font-medium text-success-600 dark:text-success-500">
                                                        A new verification link
                                                        has been sent to your
                                                        email address.
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                    <div>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            isLoading={processing}
                                            data-test="update-profile-button"
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardBody>
                </Card>

                <DeleteUser />
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit().url,
        },
    ],
};
