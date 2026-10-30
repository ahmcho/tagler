import {
    Alert,
    Button,
    Input,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from '@ahmcho/tailadmin-react';
import { Form } from '@inertiajs/react';
import { Check, Copy } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { useClipboard } from '@/hooks/use-clipboard';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { confirm } from '@/routes/two-factor';

function TwoFactorSetupStep({
    qrCodeSvg,
    manualSetupKey,
    buttonText,
    onNextStep,
    errors,
}: {
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    buttonText: string;
    onNextStep: () => void;
    errors: string[];
}) {
    const { resolvedAppearance } = useAppearance();
    const [copiedText, copy] = useClipboard();
    const CopyIcon = copiedText === manualSetupKey ? Check : Copy;

    if (errors.length) {
        return (
            <>
                {errors.map((error) => (
                    <Alert key={error} variant="error" title={error} />
                ))}
            </>
        );
    }

    return (
        <>
            <div className="mx-auto aspect-square w-64 rounded-lg border border-gray-200 p-5 dark:border-gray-800">
                {qrCodeSvg ? (
                    <div
                        className="aspect-square w-full rounded-lg bg-white p-2 [&_svg]:size-full"
                        dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                        style={{
                            filter:
                                resolvedAppearance === 'dark'
                                    ? 'invert(1) brightness(1.5)'
                                    : undefined,
                        }}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                        Loading…
                    </div>
                )}
            </div>

            <Button fullWidth onClick={onNextStep}>
                {buttonText}
            </Button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                or, enter the code manually
            </p>

            <div className="flex w-full items-center gap-2 rounded-lg border border-gray-200 pr-2 dark:border-gray-800">
                <input
                    type="text"
                    readOnly
                    value={manualSetupKey ?? 'Loading…'}
                    className="w-full bg-transparent p-3 text-sm text-gray-800 outline-none dark:text-white/90"
                />
                {manualSetupKey && (
                    <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Copy setup key"
                        startIcon={<CopyIcon size={18} />}
                        onClick={() => copy(manualSetupKey)}
                    />
                )}
            </div>
        </>
    );
}

function TwoFactorVerificationStep({
    onClose,
    onBack,
}: {
    onClose: () => void;
    onBack: () => void;
}) {
    const [code, setCode] = useState<string>('');

    return (
        <Form
            {...confirm.form()}
            onSuccess={() => onClose()}
            resetOnError
            resetOnSuccess
        >
            {({
                processing,
                errors,
            }: {
                processing: boolean;
                errors?: { confirmTwoFactorAuthentication?: { code?: string } };
            }) => (
                <>
                    <Input
                        name="code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={OTP_MAX_LENGTH}
                        placeholder="000000"
                        className="text-center text-lg tracking-[0.5em]"
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        disabled={processing}
                        autoFocus
                        error={errors?.confirmTwoFactorAuthentication?.code}
                    />

                    <ModalFooter align="space-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                            disabled={processing}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                processing || code.length < OTP_MAX_LENGTH
                            }
                            isLoading={processing}
                        >
                            Confirm
                        </Button>
                    </ModalFooter>
                </>
            )}
        </Form>
    );
}

type Props = {
    isOpen: boolean;
    onClose: () => void;
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    clearSetupData: () => void;
    fetchSetupData: () => Promise<void>;
    errors: string[];
};

export default function TwoFactorSetupModal({
    isOpen,
    onClose,
    requiresConfirmation,
    twoFactorEnabled,
    qrCodeSvg,
    manualSetupKey,
    clearSetupData,
    fetchSetupData,
    errors,
}: Props) {
    const [showVerificationStep, setShowVerificationStep] =
        useState<boolean>(false);

    const modalConfig = useMemo<{
        title: string;
        description: string;
        buttonText: string;
    }>(() => {
        if (twoFactorEnabled) {
            return {
                title: 'Two-factor authentication enabled',
                description:
                    'Two-factor authentication is now enabled. Scan the QR code or enter the setup key in your authenticator app.',
                buttonText: 'Close',
            };
        }

        if (showVerificationStep) {
            return {
                title: 'Verify authentication code',
                description:
                    'Enter the 6-digit code from your authenticator app',
                buttonText: 'Continue',
            };
        }

        return {
            title: 'Enable two-factor authentication',
            description:
                'To finish enabling two-factor authentication, scan the QR code or enter the setup key in your authenticator app',
            buttonText: 'Continue',
        };
    }, [twoFactorEnabled, showVerificationStep]);

    const handleClose = useCallback(() => {
        setShowVerificationStep(false);
        clearSetupData();
        onClose();
    }, [onClose, clearSetupData]);

    const handleModalNextStep = useCallback(() => {
        if (requiresConfirmation) {
            setShowVerificationStep(true);

            return;
        }

        handleClose();
    }, [requiresConfirmation, handleClose]);

    const fetchSetupDataRef = useRef(fetchSetupData);

    useEffect(() => {
        fetchSetupDataRef.current = fetchSetupData;
    }, [fetchSetupData]);

    useEffect(() => {
        if (isOpen && !qrCodeSvg) {
            fetchSetupDataRef.current();
        }
    }, [isOpen, qrCodeSvg]);

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md">
            <ModalHeader
                title={modalConfig.title}
                subtitle={modalConfig.description}
                onClose={handleClose}
            />

            <ModalBody className="flex flex-col items-center space-y-5">
                {showVerificationStep ? (
                    <TwoFactorVerificationStep
                        onClose={handleClose}
                        onBack={() => setShowVerificationStep(false)}
                    />
                ) : (
                    <TwoFactorSetupStep
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        buttonText={modalConfig.buttonText}
                        onNextStep={handleModalNextStep}
                        errors={errors}
                    />
                )}
            </ModalBody>
        </Modal>
    );
}
