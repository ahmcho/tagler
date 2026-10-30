import { Card, CardHeader } from '@ahmcho/tailadmin-react';
import { Head, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Dashboard" />

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-3">
                    <CardHeader>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Welcome back, {auth.user.name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Your content overview will appear here.
                            </p>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
    ],
};
