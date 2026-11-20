import { Form } from '@inertiajs/react';
import { useRef, useState } from 'react';
import ProfileController from '@/actions/App/Modules/Auth/Controllers/ProfileController';
import { PasswordField } from '@/components/password-field';
import {
    Alert,
    AlertContent,
    AlertDescription,
    AlertIndicator,
    AlertTitle,
} from '@/components/tailgrids/core/alert';
import { Button } from '@/components/tailgrids/core/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/tailgrids/core/card';
import {
    Dialog,
    DialogBody,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/tailgrids/core/dialog';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Delete account</CardTitle>
                <CardDescription>
                    Delete your account and all of its resources
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Alert status="error" className="max-w-none">
                    <AlertIndicator />
                    <AlertContent>
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>
                            Please proceed with caution, this cannot be undone.
                        </AlertDescription>
                    </AlertContent>
                </Alert>
            </CardContent>

            <CardFooter className="flex justify-end pt-6">
                <Button
                    variant="danger"
                    onPress={() => setIsOpen(true)}
                    data-test="delete-user-button"
                >
                    Delete account
                </Button>
            </CardFooter>

            <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
                <DialogHeader>
                    <DialogTitle>
                        Are you sure you want to delete your account?
                    </DialogTitle>
                    <DialogDescription>
                        Once your account is deleted, all of its resources and
                        data will also be permanently deleted. Please enter your
                        password to confirm you would like to permanently delete
                        your account.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    noValidate
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
                            <DialogBody className="mt-4 mb-6">
                                <PasswordField
                                    name="password"
                                    label="Password"
                                    inputRef={passwordInput}
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    error={errors.password}
                                />
                            </DialogBody>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    appearance="outline"
                                    onPress={() => setIsOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="danger"
                                    disabled={processing}
                                    pending={processing}
                                    data-test="confirm-delete-user-button"
                                >
                                    Delete account
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </Dialog>
        </Card>
    );
}
