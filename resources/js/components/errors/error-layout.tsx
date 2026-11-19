import { Link } from '@inertiajs/react';
import gridShape from '@/lib/error-art/grid.svg';
import { home } from '@/routes';

export type ErrorArtwork = {
    light: string;
    dark: string;
};

type ErrorLayoutProps = {
    variant: 'client' | 'server';
    code: number;
    artwork: ErrorArtwork | null;
    message: string;
};

export default function ErrorLayout({
    variant,
    code,
    artwork,
    message,
}: ErrorLayoutProps) {
    const contentWidth =
        variant === 'server' ? 'sm:max-w-140.5' : 'sm:max-w-118';

    return (
        <div className="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
            <div className="absolute top-0 right-0 -z-1 w-full max-w-62.5 xl:max-w-112.5 rtl:right-auto rtl:left-0 rtl:-scale-x-100">
                <img src={gridShape} alt="" />
            </div>
            <div className="absolute bottom-0 left-0 -z-1 w-full max-w-62.5 rotate-180 xl:max-w-112.5 rtl:right-0 rtl:left-auto rtl:-scale-x-100">
                <img src={gridShape} alt="" />
            </div>

            <div
                className={`mx-auto w-full max-w-60.5 text-center ${contentWidth}`}
            >
                {artwork ? (
                    <>
                        <h1 className="mb-8 text-2xl font-bold text-gray-900 xl:text-[64px] dark:text-white/90">
                            ERROR
                        </h1>
                        <img
                            src={artwork.light}
                            alt={String(code)}
                            className="dark:hidden"
                        />
                        <img
                            src={artwork.dark}
                            alt={String(code)}
                            className="hidden dark:block"
                        />
                    </>
                ) : (
                    <h1 className="mb-8 text-6xl font-bold text-gray-900 xl:text-[96px] dark:text-white/90">
                        {code}
                    </h1>
                )}

                <p className="mt-10 mb-6 text-base text-gray-600 sm:text-lg dark:text-gray-400">
                    {message}
                </p>

                <Link
                    href={home()}
                    className="shadow-theme-xs inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:text-gray-800 focus-visible:ring-3 focus-visible:ring-gray-300/50 active:translate-y-px dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
                >
                    Back to Home Page
                </Link>
            </div>

            <p className="absolute inset-s-1/2 bottom-6 -translate-x-1/2 text-center text-sm text-gray-500 rtl:translate-x-1/2 dark:text-gray-400">
                &copy; {new Date().getFullYear()}{' '}
                {import.meta.env.VITE_APP_NAME || 'Laravel'}
            </p>
        </div>
    );
}
