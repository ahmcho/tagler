import { useForm } from '@inertiajs/react';
import { ResourceCreateContent } from '@/components/resource/resource-create-content';
import type {
    RoleOption,
    UserFormData,
} from '@/modules/auth/components/user-form';
import { UserFields } from '@/modules/auth/components/user-form';
import { create, index, store } from '@/routes/users';

type Props = {
    model: {
        id: null;
        name: string | null;
        email: string | null;
        roles: RoleOption[];
    };
    roles: RoleOption[];
};

export default function Create({ model, roles }: Props) {
    const form = useForm<UserFormData>({
        name: model.name ?? '',
        email: model.email ?? '',
        password: '',
        password_confirmation: '',
        roles: model.roles.map((role) => role.id),
    });

    return (
        <ResourceCreateContent
            pageTitle="New user"
            model={model}
            form={form}
            storeUrl={store.url()}
            updateUrl={null}
            resourceName="user"
            backHref={index.url()}
            submitOptions={{
                onFinish: () => form.reset('password', 'password_confirmation'),
            }}
        >
            {({ isCreating }) => (
                <UserFields form={form} roles={roles} isCreating={isCreating} />
            )}
        </ResourceCreateContent>
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
