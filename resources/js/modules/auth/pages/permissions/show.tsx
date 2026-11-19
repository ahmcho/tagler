import { Head, router } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/tailgrids/core/button';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/tailgrids/core/card';
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

            <Card>
                <CardHeader>
                    <h2 className="font-mono text-lg font-semibold text-gray-800 dark:text-white/90">
                        {permission.name}
                    </h2>
                </CardHeader>

                <CardContent className="space-y-4">
                    <dl className="grid gap-3 text-sm md:grid-cols-2">
                        <div>
                            <dt className="text-gray-500 dark:text-gray-400">
                                Description
                            </dt>
                            <dd>{permission.description ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500 dark:text-gray-400">
                                Guard
                            </dt>
                            <dd>{permission.guard_name}</dd>
                        </div>
                    </dl>

                    <div>
                        <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Roles with this permission
                        </h3>
                        {permission.roles.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No role holds this permission.
                            </p>
                        ) : (
                            <ul className="flex flex-wrap gap-2">
                                {permission.roles.map((role) => (
                                    <li key={role.id}>
                                        <Button
                                            appearance="outline"
                                            onPress={() =>
                                                router.visit(
                                                    roleShow.url(role.id),
                                                )
                                            }
                                        >
                                            {role.name}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

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
                </CardContent>
            </Card>
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
