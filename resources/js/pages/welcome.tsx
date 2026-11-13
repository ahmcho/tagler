import { Head, router, usePage } from '@inertiajs/react';
import { BrandMark } from '@/components/brand-mark';
import { Button } from '@/components/tailgrids/core/button';
import { Card } from '@/components/tailgrids/core/card';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth, name } = usePage().props;

    return (
        <>
            <Head title="Welcome" />
            <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 dark:bg-gray-900">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex justify-center">
                        <BrandMark name={name} />
                    </div>

                    <Card className="space-y-6 p-8 text-center">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90">
                                Welcome
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Sign in to manage your content.
                            </p>
                        </div>

                        {auth.user ? (
                            <Button
                                className="w-full"
                                onPress={() => router.visit(dashboard().url)}
                            >
                                Go to dashboard
                            </Button>
                        ) : (
                            <Button
                                className="w-full"
                                onPress={() => router.visit(login().url)}
                            >
                                Log in
                            </Button>
                        )}
                    </Card>
                </div>
            </main>
        </>
    );
}
