import { Head, router } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { ResourceDetails } from '@/components/resource/resource-details';
import { Button } from '@/components/tailgrids/core/button';
import { index, show } from '@/routes/permissions';
import { index as rolesIndex, show as roleShow } from '@/routes/roles';

type Props = {
    permission: {
        id: number;
        name: string;
        description: string | null;
        guard_name: string;
        roles: { id: number; name: string }[];
        created_at: string;
    };
};

export default function Show({ permission }: Props) {
    return (
        <>
            <Head title={`Permission ${permission.name}`} />

            <div className="space-y-6">
                <ResourceDetails
                    items={[
                        {
                            label: 'Description',
                            value: permission.description ?? '—',
                        },
                        { label: 'Guard', value: permission.guard_name },
                        { label: 'Created', value: permission.created_at },
                        {
                            label: 'Roles with this permission',
                            value:
                                permission.roles.length === 0 ? (
                                    'No role holds this permission.'
                                ) : (
                                    <ul className="flex flex-wrap gap-2">
                                        {permission.roles.map((role) => (
                                            <li key={role.id}>
                                                <Button
                                                    appearance="outline"
                                                    onPress={() =>
                                                        router.visit(
                                                            roleShow.url(
                                                                role.id,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    {role.name}
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                ),
                        },
                    ]}
                />

                <div className="flex justify-end">
                    <Button
                        appearance="outline"
                        onPress={() =>
                            router.visit(
                                rolesIndex.url({
                                    query: { permission: permission.id },
                                }),
                            )
                        }
                    >
                        Filter roles by this permission
                    </Button>
                </div>
            </div>
        </>
    );
}

Show.layout = (page: Props) => ({
    breadcrumbs: [
        {
            title: 'Permissions',
            href: index.url(),
            icon: <KeyRound />,
        },
        {
            title: page.permission.name,
            href: show.url(page.permission.id),
        },
    ],
});
