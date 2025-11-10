import React, { useContext } from 'react';
import { emitToast, ToastType } from '../utils/notifications';
import { ThinSpacer } from '../components/ThinSpacer';
import { AuthContext } from '../App';
import { AccountSettings } from '@aws-amplify/ui-react';

export const ProfilePage: React.FC = () => {
    // const [isSubmitting, setIsSubmitting] = useState(false);
    const authContext = useContext(AuthContext);

    // const {
    //     register,
    //     handleSubmit,
    //     formState: { errors },
    //     watch,
    //     reset
    // } = useForm<PasswordChangeForm>();

    // const newPassword = watch('newPassword');

    // const onSubmit = async (data: PasswordChangeForm) => {
    //     setIsSubmitting(true);
    //     try {
    //         await updatePassword({
    //             oldPassword: data.oldPassword,
    //             newPassword: data.newPassword
    //         });
    //         emitToast('Password updated successfully', ToastType.Success);
    //         reset();
    //     } catch (error: any) {
    //         console.error('Error updating password:', error);
    //         if (error.name === 'NotAuthorizedException') {
    //             emitToast('Incorrect current password', ToastType.Error);
    //         } else if (error.name === 'InvalidPasswordException') {
    //             emitToast('New password does not meet requirements', ToastType.Error);
    //         } else if (error.name === 'LimitExceededException') {
    //             emitToast('Too many attempts. Please try again later', ToastType.Error);
    //         } else {
    //             emitToast('Failed to update password. Please try again.', ToastType.Error);
    //         }
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    return (
        <div className="side-pad-20">
            
                    <h4>User Profile</h4>
                    <ThinSpacer />
                    

                    <div className="mb-3">
                        
                        <b>Email:</b> {authContext?.attributes?.email || 'Not available'}

                    </div>
                    
                    <div className="mb-4">
                        <h5>Change Password</h5>
                        <ThinSpacer />
                        <AccountSettings.ChangePassword 
                            onSuccess={() => {
                                emitToast('Password updated', ToastType.Success);
                            }}
                        />

                        {/* <Form onSubmit={handleSubmit(onSubmit)}>
                            <Form.Group className="mb-3" controlId="oldPassword">
                                <Form.Label>Current Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter current password"
                                    {...register('oldPassword', {
                                        required: 'Current password is required'
                                    })}
                                    isInvalid={!!errors.oldPassword}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.oldPassword?.message}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="newPassword">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter new password"
                                    {...register('newPassword', {
                                        required: 'New password is required',
                                        minLength: {
                                            value: 8,
                                            message: 'Password must be at least 8 characters'
                                        },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                                            message: 'Password must contain uppercase, lowercase, number, and special character'
                                        }
                                    })}
                                    isInvalid={!!errors.newPassword}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.newPassword?.message}
                                </Form.Control.Feedback>
                                <Form.Text className="text-muted">
                                    Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="confirmPassword">
                                <Form.Label>Confirm New Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Confirm new password"
                                    {...register('confirmPassword', {
                                        required: 'Please confirm your password',
                                        validate: (value) =>
                                            value === newPassword || 'Passwords do not match'
                                    })}
                                    isInvalid={!!errors.confirmPassword}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.confirmPassword?.message}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <div className="d-grid">
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Password'
                                    )}
                                </Button>
                            </div>
                        </Form> */}
            </div>
        </div>
    );
};

