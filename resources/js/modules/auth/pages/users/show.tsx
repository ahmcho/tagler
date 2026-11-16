import { Head, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/tailgrids/core/button';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/tailgrids/core/card';
import { useAbility } from '@/hooks/use-ability';
import { index as activityLogIndex } from '@/routes/activity-logs';
import { edit, index } from '@/routes/users';

type Props = {
    user: {
        id: number;
        name: string;
        email: string;
        roles: { id: number; name: string }[];
        created_at: string;
        can: { update: boolean; delete: boolean };
    };
};

export default function Show({ user }: Props) {
    const ability = useAbility();

    return (
        <>
            <Head title={`User ${user.name}`} />

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {user.name}
                    </h2>
                </CardHeader>

                <CardContent className="space-y-4">
                    <dl className="grid gap-3 text-sm md:grid-cols-2">
                        <div>
                            <dt className="text-gray-500 dark:text-gray-400">
                                Email
                            </dt>
                            <dd>{user.email}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500 dark:text-gray-400">
                                Created
                            </dt>
                            <dd>{user.created_at}</dd>
                        </div>
                    </dl>

                    <div>
                        <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Roles
                        </h3>
                        {user.roles.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                This user has no roles.
                            </p>
                        ) : (
                            <ul className="flex flex-wrap gap-2">
                                {user.roles.map((role) => (
                                    <li
                                        key={role.id}
                                        className="rounded-md bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800"
                                    >
                                        {role.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        {ability('activity-logs.index') && (
                            <Button
                                appearance="outline"
                                onPress={() =>
                                    router.visit(
                                        activityLogIndex.url({
                                            query: {
                                                subject_type:
                                                    'App\\Models\\User',
                                                subject_id: user.id,
                                            },
                                        }),
                                    )
                                }
                            >
                                View activity
                            </Button>
                        )}
                        {user.can.update && (
                            <Button
                                onPress={() => router.visit(edit.url(user.id))}
                            >
                                <Pencil className="size-4" />
                                Edit
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: index.url(),
        },
    ],
};
