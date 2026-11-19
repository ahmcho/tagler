import { Head, router } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/tailgrids/core/button';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/tailgrids/core/card';
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

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {role.name}
                    </h2>
                </CardHeader>

                <CardContent className="space-y-4">
                    <dl className="grid gap-3 text-sm md:grid-cols-2">
                        <div>
                            <dt className="text-gray-500 dark:text-gray-400">
                                Guard
                            </dt>
                            <dd>{role.guard_name}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500 dark:text-gray-400">
                                Created
                            </dt>
                            <dd>{role.created_at}</dd>
                        </div>
                    </dl>

                    <div>
                        <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Permissions
                        </h3>
                        {role.permissions.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                This role has no permissions.
                            </p>
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
                        )}
                    </div>

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
                </CardContent>
            </Card>
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
