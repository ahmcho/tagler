import { useForm } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { ResourceCreateContent } from '@/components/resource/resource-create-content';
import type {
    RoleFormData,
    SelectedPermission,
} from '@/modules/auth/components/role-form';
import { RoleFields } from '@/modules/auth/components/role-form';
import { create, index, store } from '@/routes/roles';

type Props = {
    model: {
        id: null;
        name: string | null;
        permissions: SelectedPermission[];
    };
};

export default function Create({ model }: Props) {
    const form = useForm<RoleFormData>({
        name: model.name ?? '',
        permissions: model.permissions.map((permission) => permission.id),
    });

    return (
        <ResourceCreateContent
            pageTitle="New role"
            model={model}
            form={form}
            storeUrl={store.url()}
            updateUrl={null}
            resourceName="role"
            backHref={index.url()}
        >
            <RoleFields form={form} initialPermissions={model.permissions} />
        </ResourceCreateContent>
    );
}

Create.layout = {
    breadcrumbs: [
        {
            title: 'Roles',
            href: index.url(),
            icon: <ShieldCheck />,
        },
        {
            title: 'New role',
            href: create.url(),
        },
    ],
};
