import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { ResourceActionButtons } from '@/components/resource/resource-action-buttons';
import { ResourceDetails } from '@/components/resource/resource-details';
import { roleRowActions } from '@/modules/auth/components/role-row-actions';
import type { RoleRecord } from '@/modules/auth/components/role-row-actions';
import { index, show } from '@/routes/roles';

type Props = {
    role: RoleRecord;
};

export default function Show({ role }: Props) {
    return (
        <>
            <Head title={`Role ${role.name}`} />

            <div className="space-y-6">
                <ResourceDetails
                    items={[
                        { label: 'Name', value: role.name },
                        { label: 'Guard', value: role.guard_name },
                        { label: 'Created', value: role.created_at },
                        {
                            label: 'Permissions',
                            value:
                                role.permissions.length === 0 ? (
                                    'This role has no permissions.'
                                ) : (
                                    <ul className="flex flex-wrap gap-2">
                                        {role.permissions.map((permission) => (
                                            <li
                                                key={permission.id}
                                                className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-800"
                                            >
                                                {permission.name}
                                            </li>
                                        ))}
                                    </ul>
                                ),
                        },
                    ]}
                    actions={
                        <ResourceActionButtons
                            actions={roleRowActions(role)}
                            target={role}
                        />
                    }
                />
            </div>
        </>
    );
}

Show.layout = (page: Props) => ({
    breadcrumbs: [
        {
            title: 'Roles',
            href: index.url(),
            icon: <ShieldCheck />,
        },
        {
            title: page.role.name,
            href: show.url(page.role.id),
        },
    ],
});
