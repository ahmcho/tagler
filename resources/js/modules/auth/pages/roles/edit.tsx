import { useForm } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { ResourceEditContent } from '@/components/resource/resource-edit-content';
import type {
    RoleFormData,
    SelectedPermission,
} from '@/modules/auth/components/role-form';
import { RoleFields } from '@/modules/auth/components/role-form';
import { edit, index, update } from '@/routes/roles';

type Props = {
    model: {
        id: number;
        name: string;
        permissions: SelectedPermission[];
    };
};

export default function Edit({ model }: Props) {
    const form = useForm<RoleFormData>({
        name: model.name,
        permissions: model.permissions.map((permission) => permission.id),
    });

    return (
        <ResourceEditContent
            pageTitle={`Edit role ${model.name}`}
            model={model}
            form={form}
            storeUrl={null}
            updateUrl={update.url(model.id)}
            resourceName="role"
            backHref={index.url()}
        >
            <RoleFields form={form} initialPermissions={model.permissions} />
        </ResourceEditContent>
    );
}

Edit.layout = (page: Props) => ({
    breadcrumbs: [
        {
            title: 'Roles',
            href: index.url(),
            icon: <ShieldCheck />,
        },
        {
            title: `Edit role ${page.model.name}`,
            href: edit.url(page.model.id),
        },
    ],
});
