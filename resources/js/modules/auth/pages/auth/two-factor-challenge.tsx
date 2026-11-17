import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/tailgrids/core/button';
import { FieldError, FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import { TextField } from '@/components/tailgrids/core/text-field';
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
                noValidate
                {...store.form()}
                className="space-y-5"
                resetOnError
                resetOnSuccess={!showRecoveryInput}
            >
                {({ errors, processing, clearErrors }) => (
                    <>
                        {showRecoveryInput ? (
                            <TextField
                                name="recovery_code"
                                autoFocus
                                required
                                invalid={Boolean(errors.recovery_code)}
                                className="flex w-full flex-col gap-1.5"
                            >
                                <FieldLabel>Recovery code</FieldLabel>
                                <Input
                                    placeholder="Enter recovery code"
                                    className="w-full"
                                />
                                <FieldError>{errors.recovery_code}</FieldError>
                            </TextField>
                        ) : (
                            <TextField
                                name="code"
                                autoComplete="one-time-code"
                                autoFocus
                                disabled={processing}
                                invalid={Boolean(errors.code)}
                                className="flex w-full flex-col gap-1.5"
                            >
                                <FieldLabel>Authentication code</FieldLabel>
                                <Input
                                    inputMode="numeric"
                                    maxLength={OTP_MAX_LENGTH}
                                    placeholder="000000"
                                    className="w-full text-center text-lg tracking-[0.5em]"
                                />
                                <FieldError>{errors.code}</FieldError>
                            </TextField>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            pending={processing}
                            disabled={processing}
                        >
                            Continue
                        </Button>

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            or you can{' '}
                            <button
                                type="button"
                                className="font-medium text-primary-500 hover:text-primary-600"
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
