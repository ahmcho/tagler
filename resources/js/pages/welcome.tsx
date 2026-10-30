import { Button, Card } from '@ahmcho/tailadmin-react';
import { Head, router, usePage } from '@inertiajs/react';
import { BrandMark } from '@/components/brand-mark';
import { dashboard, login, register } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth, name } = usePage().props;

    return (
        <>
            <Head title="Welcome" />
            <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 dark:bg-gray-900">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex justify-center">
                        <BrandMark name={name} />
                    </div>

                    <Card padding="lg" className="space-y-6 text-center">
                        <div className="space-y-2">
                            <h1 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
                                Welcome
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Sign in to manage your content.
                            </p>
                        </div>

                        {auth.user ? (
                            <Button
                                fullWidth
                                onClick={() => router.visit(dashboard().url)}
                            >
                                Go to dashboard
                            </Button>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Button
                                    fullWidth
                                    onClick={() => router.visit(login().url)}
                                >
                                    Log in
                                </Button>
                                {canRegister && (
                                    <Button
                                        fullWidth
                                        variant="outline"
                                        onClick={() =>
                                            router.visit(register().url)
                                        }
                                    >
                                        Register
                                    </Button>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            </main>
        </>
    );
}
