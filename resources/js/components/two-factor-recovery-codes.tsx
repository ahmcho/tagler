import { Form } from '@inertiajs/react';
import { Eye, EyeOff, LockKeyhole, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    AlertContent,
    AlertIndicator,
    AlertTitle,
} from '@/components/tailgrids/core/alert';
import { Button } from '@/components/tailgrids/core/button';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/tailgrids/core/card';
import { regenerateRecoveryCodes } from '@/routes/two-factor';

type Props = {
    recoveryCodesList: string[];
    fetchRecoveryCodes: () => Promise<void>;
    errors: string[];
};

export default function TwoFactorRecoveryCodes({
    recoveryCodesList,
    fetchRecoveryCodes,
    errors,
}: Props) {
    const [codesAreVisible, setCodesAreVisible] = useState<boolean>(false);
    const canRegenerateCodes = recoveryCodesList.length > 0 && codesAreVisible;

    const toggleCodesVisibility = useCallback(async () => {
        if (!codesAreVisible && !recoveryCodesList.length) {
            await fetchRecoveryCodes();
        }

        setCodesAreVisible(!codesAreVisible);
    }, [codesAreVisible, recoveryCodesList.length, fetchRecoveryCodes]);

    useEffect(() => {
        if (!recoveryCodesList.length) {
            fetchRecoveryCodes();
        }
    }, [recoveryCodesList.length, fetchRecoveryCodes]);

    const RecoveryCodeIcon = codesAreVisible ? EyeOff : Eye;

    return (
        <Card className="border border-gray-200 shadow-none dark:border-gray-800">
            <CardHeader>
                <div>
                    <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white/90">
                        <LockKeyhole size={16} aria-hidden="true" />
                        2FA recovery codes
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Recovery codes let you regain access if you lose your
                        2FA device. Store them in a secure password manager.
                    </p>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        onPress={toggleCodesVisibility}
                        aria-expanded={codesAreVisible}
                        aria-controls="recovery-codes-section"
                    >
                        <RecoveryCodeIcon size={16} aria-hidden="true" />
                        {codesAreVisible ? 'Hide' : 'View'} recovery codes
                    </Button>

                    {canRegenerateCodes && (
                        <Form
                            noValidate
                            {...regenerateRecoveryCodes.form()}
                            options={{ preserveScroll: true }}
                            onSuccess={fetchRecoveryCodes}
                        >
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    appearance="outline"
                                    disabled={processing}
                                    pending={processing}
                                >
                                    <RefreshCw size={16} />
                                    Regenerate codes
                                </Button>
                            )}
                        </Form>
                    )}
                </div>

                {codesAreVisible && (
                    <div id="recovery-codes-section" className="space-y-3">
                        {errors.map((error) => (
                            <Alert key={error} status="error">
                                <AlertIndicator />
                                <AlertContent>
                                    <AlertTitle>{error}</AlertTitle>
                                </AlertContent>
                            </Alert>
                        ))}

                        {!errors.length && (
                            <>
                                <div
                                    className="grid gap-1 rounded-lg bg-gray-50 p-4 font-mono text-sm text-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                                    role="list"
                                    aria-label="Recovery codes"
                                >
                                    {recoveryCodesList.length ? (
                                        recoveryCodesList.map((code) => (
                                            <div
                                                key={code}
                                                role="listitem"
                                                className="select-text"
                                            >
                                                {code}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-gray-500 dark:text-gray-400">
                                            Loading…
                                        </div>
                                    )}
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Each recovery code can be used once to
                                    access your account and will be removed
                                    after use. If you need more, click{' '}
                                    <span className="font-bold">
                                        Regenerate codes
                                    </span>{' '}
                                    above.
                                </p>
                            </>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
