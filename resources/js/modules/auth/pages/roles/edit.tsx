import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/tailgrids/core/card';
import type {
    PermissionOption,
    RoleFormData,
} from '@/modules/auth/components/role-form';
import { RoleForm } from '@/modules/auth/components/role-form';
import { index, update } from '@/routes/roles';

type Props = {
    role: {
        id: number;
        name: string;
        permissions: { id: number; name: string }[];
    };
    permissions: PermissionOption[];
};

export default function Edit({ role, permissions }: Props) {
    const form = useForm<RoleFormData>({
        name: role.name,
        permissions: role.permissions.map((permission) => permission.id),
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(update.url(role.id));
    };

    return (
        <>
            <Head title={`Edit role ${role.name}`} />

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Edit role
                    </h2>
                </CardHeader>

                <CardContent>
                    <RoleForm
                        form={form}
                        permissions={permissions}
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
            title: 'Roles',
            href: index.url(),
        },
    ],
};
