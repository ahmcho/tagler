import { Head } from '@inertiajs/react';
import ErrorLayout from '@/components/errors/error-layout';
import type { ErrorArtwork } from '@/components/errors/error-layout';
import error401Dark from '@/lib/error-art/401-dark.svg';
import error401 from '@/lib/error-art/401.svg';
import error403Dark from '@/lib/error-art/403-dark.svg';
import error403 from '@/lib/error-art/403.svg';
import error404Dark from '@/lib/error-art/404-dark.svg';
import error404 from '@/lib/error-art/404.svg';
import error419Dark from '@/lib/error-art/419-dark.svg';
import error419 from '@/lib/error-art/419.svg';
import error422Dark from '@/lib/error-art/422-dark.svg';
import error422 from '@/lib/error-art/422.svg';
import error500Dark from '@/lib/error-art/500-dark.svg';
import error500 from '@/lib/error-art/500.svg';

type ErrorPageProps = {
    status: number;
};

type ErrorCopy = {
    title: string;
    message: string;
};

const ARTWORK: Record<number, ErrorArtwork> = {
    401: { light: error401, dark: error401Dark },
    403: { light: error403, dark: error403Dark },
    404: { light: error404, dark: error404Dark },
    419: { light: error419, dark: error419Dark },
    422: { light: error422, dark: error422Dark },
    500: { light: error500, dark: error500Dark },
};

const COPY: Record<number, ErrorCopy> = {
    401: {
        title: 'Unauthorized',
        message: 'You need to sign in to view this page.',
    },
    403: {
        title: 'Forbidden',
        message: 'You do not have permission to view this page.',
    },
    404: {
        title: 'Page not found',
        message: 'We can’t seem to find the page you are looking for!',
    },
    419: {
        title: 'Page expired',
        message: 'Your session has expired. Refresh the page and try again.',
    },
    422: {
        title: 'Unprocessable content',
        message: 'The request could not be processed.',
    },
    500: {
        title: 'Server error',
        message: 'Something went wrong on our side. Please try again later.',
    },
    503: {
        title: 'Service unavailable',
        message: 'We are doing some maintenance. Please check back soon.',
    },
};

const FALLBACK_CLIENT_COPY: ErrorCopy = {
    title: 'Request error',
    message: 'The request could not be completed.',
};

const FALLBACK_SERVER_COPY: ErrorCopy = {
    title: 'Server error',
    message: 'Something went wrong on our side. Please try again later.',
};

export default function ErrorPage({ status }: ErrorPageProps) {
    const isServerError = status >= 500;
    const copy =
        COPY[status] ??
        (isServerError ? FALLBACK_SERVER_COPY : FALLBACK_CLIENT_COPY);

    return (
        <>
            <Head title={`${status} ${copy.title}`} />

            <ErrorLayout
                variant={isServerError ? 'server' : 'client'}
                code={status}
                artwork={ARTWORK[status] ?? null}
                message={copy.message}
            />
        </>
    );
}
