import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Modules/Auth/Controllers/ProfileController';
import DeleteUser from '@/components/delete-user';
import { Button } from '@/components/tailgrids/core/button';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/tailgrids/core/card';
import { FieldError, FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import { TextField } from '@/components/tailgrids/core/text-field';
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
                    <CardContent>
                        <Form
                            {...ProfileController.update.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            className="space-y-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <TextField
                                        name="name"
                                        defaultValue={auth.user.name}
                                        required
                                        autoComplete="name"
                                        invalid={Boolean(errors.name)}
                                        className="flex w-full flex-col gap-1.5"
                                    >
                                        <FieldLabel>Name</FieldLabel>
                                        <Input
                                            placeholder="Full name"
                                            className="w-full"
                                        />
                                        <FieldError>{errors.name}</FieldError>
                                    </TextField>

                                    <TextField
                                        name="email"
                                        type="email"
                                        defaultValue={auth.user.email}
                                        required
                                        autoComplete="username"
                                        invalid={Boolean(errors.email)}
                                        className="flex w-full flex-col gap-1.5"
                                    >
                                        <FieldLabel>Email address</FieldLabel>
                                        <Input
                                            placeholder="Email address"
                                            className="w-full"
                                        />
                                        <FieldError>{errors.email}</FieldError>
                                    </TextField>

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
                                                        className="font-medium text-primary-500 hover:text-primary-600"
                                                    >
                                                        Click here to resend the
                                                        verification email.
                                                    </Link>
                                                </p>

                                                {status ===
                                                    'verification-link-sent' && (
                                                    <p className="text-success-600 font-medium dark:text-success-500">
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
                                            pending={processing}
                                            data-test="update-profile-button"
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
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
