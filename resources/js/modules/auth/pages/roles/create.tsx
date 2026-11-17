import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/tailgrids/core/card';
import type { RoleFormData } from '@/modules/auth/components/role-form';
import { RoleForm } from '@/modules/auth/components/role-form';
import { create, index, store } from '@/routes/roles';

export default function Create() {
    const form = useForm<RoleFormData>({ name: '', permissions: [] });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(store.url());
    };

    return (
        <>
            <Head title="New role" />

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        New role
                    </h2>
                </CardHeader>

                <CardContent>
                    <RoleForm
                        form={form}
                        initialPermissions={[]}
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
            title: 'Roles',
            href: index.url(),
        },
        {
            title: 'New role',
            href: create.url(),
        },
    ],
};
