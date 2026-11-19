import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { ResourceActionButtons } from '@/components/resource/resource-action-buttons';
import { ResourceDetails } from '@/components/resource/resource-details';
import { userRowActions } from '@/modules/auth/components/user-row-actions';
import type { UserRecord } from '@/modules/auth/components/user-row-actions';
import { index, show } from '@/routes/users';

type Props = {
    user: UserRecord;
};

export default function Show({ user }: Props) {
    return (
        <>
            <Head title={`User ${user.name}`} />

            <div className="space-y-6">
                <ResourceDetails
                    items={[
                        { label: 'Name', value: user.name },
                        { label: 'Email', value: user.email },
                        { label: 'Created', value: user.created_at },
                    ]}
                    actions={
                        <ResourceActionButtons
                            actions={userRowActions(user)}
                            target={user}
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
