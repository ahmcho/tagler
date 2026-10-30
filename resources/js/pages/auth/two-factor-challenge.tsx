import { Button, Input } from '@ahmcho/tailadmin-react';
import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Recovery code',
                description:
                    'Please confirm access to your account by entering one of your emergency recovery codes.',
                toggleText: 'login using an authentication code',
            };
        }

        return {
            title: 'Authentication code',
            description:
                'Enter the authentication code provided by your authenticator application.',
            toggleText: 'login using a recovery code',
        };
    }, [showRecoveryInput]);

    setLayoutProps({
        title: authConfigContent.title,
        description: authConfigContent.description,
    });

    return (
        <>
            <Head title="Two-factor authentication" />

            <Form
                {...store.form()}
                className="space-y-5"
                resetOnError
                resetOnSuccess={!showRecoveryInput}
            >
                {({ errors, processing, clearErrors }) => (
                    <>
                        {showRecoveryInput ? (
                            <Input
                                name="recovery_code"
                                type="text"
                                placeholder="Enter recovery code"
                                autoFocus
                                required
                                error={errors.recovery_code}
                            />
                        ) : (
                            <Input
                                name="code"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={OTP_MAX_LENGTH}
                                placeholder="000000"
                                className="text-center text-lg tracking-[0.5em]"
                                disabled={processing}
                                autoFocus
                                error={errors.code}
                            />
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            isLoading={processing}
                            disabled={processing}
                        >
                            Continue
                        </Button>

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            or you can{' '}
                            <button
                                type="button"
                                className="font-medium text-brand-500 hover:text-brand-600"
                                onClick={() => {
                                    setShowRecoveryInput(!showRecoveryInput);
                                    clearErrors();
                                }}
                            >
                                {authConfigContent.toggleText}
                            </button>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}
