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
import { create, index, store } from '@/routes/users';

type Props = {
    roles: RoleOption[];
};

export default function Create({ roles }: Props) {
    const form = useForm<UserFormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [],
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(store.url(), {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="New user" />

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        New user
                    </h2>
                </CardHeader>

                <CardContent>
                    <UserForm
                        form={form}
                        roles={roles}
                        isEdit={false}
                        submitLabel="Create"
                        onSubmit={submit}
                        onCancel={() => router.visit(index.url())}
                    />
                </CardContent>
            </Card>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: index.url(),
        },
        {
            title: 'New user',
            href: create.url(),
        },
    ],
};
