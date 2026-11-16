import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/tailgrids/core/card';
import type {
    RoleOption,
    UserFormData,
} from '@/modules/auth/components/user-form';
import { UserForm } from '@/modules/auth/components/user-form';
import { index, update } from '@/routes/users';

type Props = {
    user: {
        id: number;
        name: string;
        email: string;
        roles: { id: number; name: string }[];
    };
    roles: RoleOption[];
};

export default function Edit({ user, roles }: Props) {
    const form = useForm<UserFormData>({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        roles: user.roles.map((role) => role.id),
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(update.url(user.id), {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title={`Edit user ${user.name}`} />

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Edit user
                    </h2>
                </CardHeader>

                <CardContent>
                    <UserForm
                        form={form}
                        roles={roles}
                        isEdit
                        submitLabel="Save"
                        onSubmit={submit}
                        onCancel={() => router.visit(index.url())}
                    />
                </CardContent>
            </Card>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: index.url(),
        },
    ],
};
