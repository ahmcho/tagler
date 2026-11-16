import { Head, usePage } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/tailgrids/core/card';
import { dashboard } from '@/routes';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Dashboard" />

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="pb-5 md:col-span-3">
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

                {[1, 2, 3].map((index) => (
                    <Card key={index} className="pb-5 md:min-w-0">
                        <CardHeader>
                            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-white/10" />
                            <div className="mt-4 h-8 w-32 rounded bg-gray-200 dark:bg-white/10" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-3 w-40 rounded bg-gray-100 dark:bg-white/5" />
                        </CardContent>
                    </Card>
                ))}

                <Card className="pb-5 md:col-span-2 md:min-w-0">
                    <CardHeader>
                        <div className="h-5 w-40 rounded bg-gray-200 dark:bg-white/10" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 w-full rounded-xl bg-gray-100 dark:bg-white/5" />
                    </CardContent>
                </Card>

                <Card className="pb-5 md:min-w-0">
                    <CardHeader>
                        <div className="h-5 w-32 rounded bg-gray-200 dark:bg-white/10" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3, 4].map((index) => (
                                <div
                                    key={index}
                                    className="h-10 w-full rounded-lg bg-gray-100 dark:bg-white/5"
                                />
                            ))}
                        </div>
                    </CardContent>
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
