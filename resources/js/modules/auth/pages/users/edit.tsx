import { useForm } from '@inertiajs/react';
import { ResourceEditContent } from '@/components/resource/resource-edit-content';
import type {
    RoleOption,
    UserFormData,
} from '@/modules/auth/components/user-form';
import { UserFields } from '@/modules/auth/components/user-form';
import { index, update } from '@/routes/users';

type Props = {
    model: {
        id: number;
        name: string;
        email: string;
        roles: RoleOption[];
    };
    roles: RoleOption[];
};

export default function Edit({ model, roles }: Props) {
    const form = useForm<UserFormData>({
        name: model.name,
        email: model.email,
        password: '',
        password_confirmation: '',
        roles: model.roles.map((role) => role.id),
    });

    return (
        <ResourceEditContent
            pageTitle={`Edit user ${model.name}`}
            model={model}
            form={form}
            storeUrl={null}
            updateUrl={update.url(model.id)}
            resourceName="user"
            backHref={index.url()}
            submitOptions={{
                onFinish: () => form.reset('password', 'password_confirmation'),
            }}
        >
            {({ isCreating }) => (
                <UserFields form={form} roles={roles} isCreating={isCreating} />
            )}
        </ResourceEditContent>
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
