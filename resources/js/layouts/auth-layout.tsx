import { usePage } from '@inertiajs/react';
import { BrandMark } from '@/components/brand-mark';
import type { AuthLayoutProps } from '@/types';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 dark:bg-gray-900">
            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <BrandMark name={name} />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] dark:shadow-none">
                    <div className="mb-6 text-center">
                        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {description}
                        </p>
                    </div>

                    {children}
                </div>
            </div>
        </main>
    );
}
