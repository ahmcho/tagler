import { Head, router } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { ResourceDetails } from '@/components/resource/resource-details';
import { Button } from '@/components/tailgrids/core/button';
import { index as activityLogIndex } from '@/routes/activity-logs';
import { index, show } from '@/routes/roles';

type Props = {
    role: {
        id: number;
        name: string;
        guard_name: string;
        permissions: { id: number; name: string }[];
        created_at: string;
    };
};

export default function Show({ role }: Props) {
    return (
        <>
            <Head title={`Role ${role.name}`} />

            <div className="space-y-6">
                <ResourceDetails
                    title="Role Details"
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
                />

                <div className="flex justify-end gap-2">
                    <Button
                        appearance="outline"
                        onPress={() =>
                            router.visit(
                                activityLogIndex.url({
                                    query: {
                                        subject_type:
                                            'App\\Modules\\Auth\\Models\\Role',
                                        subject_id: role.id,
                                    },
                                }),
                            )
                        }
                    >
                        View activity
                    </Button>
                </div>
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
