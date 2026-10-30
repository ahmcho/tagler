import {
    Alert,
    Button,
    Card,
    CardBody,
    CardHeader,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    PasswordInput,
} from '@ahmcho/tailadmin-react';
import { Form } from '@inertiajs/react';
import { useRef, useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <Card>
            <CardHeader>
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Delete account
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Delete your account and all of its resources
                    </p>
                </div>
            </CardHeader>
            <CardBody className="space-y-4">
                <Alert
                    variant="error"
                    title="Warning"
                    description="Please proceed with caution, this cannot be undone."
                />

                <div>
                    <Button
                        variant="danger"
                        onClick={() => setIsOpen(true)}
                        data-test="delete-user-button"
                    >
                        Delete account
                    </Button>
                </div>

                <Modal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    size="md"
                >
                    <ModalHeader
                        title="Are you sure you want to delete your account?"
                        subtitle="Once your account is deleted, all of its resources and data will also be permanently deleted. Please enter your password to confirm you would like to permanently delete your account."
                        onClose={() => setIsOpen(false)}
                    />

                    <Form
                        {...ProfileController.destroy.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        onError={() => passwordInput.current?.focus()}
                        onSuccess={() => setIsOpen(false)}
                        resetOnSuccess
                    >
                        {({ processing, errors }) => (
                            <>
                                <ModalBody className="mt-4 mb-6">
                                    <PasswordInput
                                        name="password"
                                        label="Password"
                                        ref={passwordInput}
                                        placeholder="Password"
                                        autoComplete="current-password"
                                        error={errors.password}
                                    />
                                </ModalBody>

                                <ModalFooter align="right">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="danger"
                                        disabled={processing}
                                        isLoading={processing}
                                        data-test="confirm-delete-user-button"
                                    >
                                        Delete account
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </Form>
                </Modal>
            </CardBody>
        </Card>
    );
}
