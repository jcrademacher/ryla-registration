import React, { useContext } from 'react';
import { emitToast, ToastType } from '../utils/notifications';
import { ThinSpacer } from '../components/ThinSpacer';
import { AuthContext } from '../App';
import { AccountSettings } from '@aws-amplify/ui-react';
import { Container } from 'react-bootstrap';

export const ProfilePage: React.FC = () => {
    // const [isSubmitting, setIsSubmitting] = useState(false);
    const authContext = useContext(AuthContext);


    return (
        <Container>

                    <h4>User Profile</h4>
                    <ThinSpacer />
                    

                    <div className="mb-3">
                        <b>Email:</b> {authContext?.attributes?.email || 'Not available'}
                        <br />
                        <b>Groups:</b> {authContext?.groups || 'Not available'}
                    </div>
           
                    
                    <div className="mb-4">
                        <h5>Change Password</h5>
                        <ThinSpacer />
                        <AccountSettings.ChangePassword 
                            onSuccess={() => {
                                emitToast('Password updated', ToastType.Success);
                            }}
                        />
            </div>
        </Container>
    );
};

