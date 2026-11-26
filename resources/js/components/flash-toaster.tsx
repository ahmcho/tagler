import { usePage } from '@inertiajs/react';
import { Close } from '@tailgrids/icons';
import { useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import {
    Alert,
    AlertContent,
    AlertIndicator,
    AlertTitle,
} from '@/components/tailgrids/core/alert';
import { Button } from '@/components/tailgrids/core/button';
import type { FlashMessage } from '@/utils/flash-message';
import { getFlashMessage } from '@/utils/flash-message';

const TOAST_DURATION_MS = 5000;

type FlashToastProps = FlashMessage & {
    id: string | number;
};

/** One toast, drawn with the TailGrids alert. */
function FlashToast({ id, status, message }: FlashToastProps) {
    // The alert tints are translucent in dark mode, so an opaque surface sits
    // behind them. Otherwise the page shows through the floating toast.
    return (
        <div className="w-88 max-w-[calc(100vw-2rem)] rounded-lg bg-background-50 shadow-lg">
            <Alert status={status} className="max-w-none items-center">
                <AlertIndicator />
                <AlertContent>
                    <AlertTitle>{message}</AlertTitle>
                </AlertContent>
                <Button
                    variant="ghost"
                    iconOnly
                    aria-label="Close"
                    onPress={() => toast.dismiss(id)}
                >
                    <Close />
                </Button>
            </Alert>
        </div>
    );
}

/**
 * Shows the flash message of each response as a Sonner toast. Mount it once
 * in each layout.
 */
export function FlashToaster() {
    const page = usePage();
    const handledPage = useRef<typeof page | null>(null);

    useEffect(() => {
        if (handledPage.current === page) {
            return;
        }

        handledPage.current = page;

        const flashMessage = getFlashMessage(page.flash, page.props.status);

        if (flashMessage === null) {
            return;
        }

        toast.custom((id) => <FlashToast id={id} {...flashMessage} />, {
            duration: TOAST_DURATION_MS,
        });
    }, [page]);

    return (
        <Toaster
            position="top-right"
            offset={{ top: '5rem', right: '1.5rem' }}
            toastOptions={{ unstyled: true }}
        />
    );
}

/** Shows a toast from client code, in the same style as the flash messages. */
export function showToast({ status, message }: FlashMessage): void {
    toast.custom(
        (id) => <FlashToast id={id} status={status} message={message} />,
        {
            duration: TOAST_DURATION_MS,
        },
    );
}
