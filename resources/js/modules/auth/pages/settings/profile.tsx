import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Settings } from 'lucide-react';
import ProfileController from '@/actions/App/Modules/Auth/Controllers/ProfileController';
import DeleteUser from '@/components/delete-user';
import { Button } from '@/components/tailgrids/core/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/tailgrids/core/card';
import {
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import { TextField } from '@/components/tailgrids/core/text-field';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';

export default function Profile({
    mustVerifyEmail,
}: {
    mustVerifyEmail: boolean;
}) {
    const { auth } = usePage().props;
    const isEmailUnverified =
        mustVerifyEmail && auth.user.email_verified_at === null;

    return (
        <>
            <Head title="Profile settings" />

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile information</CardTitle>
                        <CardDescription>
                            Update your name and email address
                        </CardDescription>
                    </CardHeader>

                    <Form
                        noValidate
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                    >
                        {({ processing, errors }) => (
                            <>
                                <CardContent>
                                    <FieldGroup>
                                        <TextField
                                            name="name"
                                            defaultValue={auth.user.name}
                                            required
                                            autoComplete="name"
                                            invalid={Boolean(errors.name)}
                                            className="flex w-full flex-col gap-1.5"
                                        >
                                            <FieldLabel>Name</FieldLabel>
                                            <Input className="w-full" />
                                            <FieldError>
                                                {errors.name}
                                            </FieldError>
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
                                            <FieldLabel>
                                                Email address
                                            </FieldLabel>
                                            <Input className="w-full" />
                                            {isEmailUnverified && (
                                                <FieldDescription>
                                                    Your email address is
                                                    unverified.{' '}
                                                    <Link
                                                        href={send()}
                                                        as="button"
                                                        className="font-medium text-primary-500 hover:text-primary-600"
                                                    >
                                                        Resend the verification
                                                        email.
                                                    </Link>
                                                </FieldDescription>
                                            )}
                                            <FieldError>
                                                {errors.email}
                                            </FieldError>
                                        </TextField>
                                    </FieldGroup>
                                </CardContent>

                                <CardFooter className="flex justify-end pt-6">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        pending={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>
                                </CardFooter>
                            </>
                        )}
                    </Form>
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
            icon: <Settings />,
        },
    ],
};
