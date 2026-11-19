import { Head, router } from '@inertiajs/react';
import { Pencil, Users } from 'lucide-react';
import { ResourceDetails } from '@/components/resource/resource-details';
import { Button } from '@/components/tailgrids/core/button';
import { Card, CardContent } from '@/components/tailgrids/core/card';
import { useAbility } from '@/hooks/use-ability';
import { index as activityLogIndex } from '@/routes/activity-logs';
import { edit, index, show } from '@/routes/users';

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

            <div className="space-y-6">
                <ResourceDetails
                    title="User Details"
                    items={[
                        { label: 'Name', value: user.name },
                        { label: 'Email', value: user.email },
                        { label: 'Created', value: user.created_at },
                    ]}
                />
            </div>
        </>
    );
}

Show.layout = (page: Props) => ({
    breadcrumbs: [
        {
            title: 'Users',
            href: index.url(),
            icon: <Users />,
        },
        {
            title: page.user.name,
            href: show.url(page.user.id),
        },
    ],
});
