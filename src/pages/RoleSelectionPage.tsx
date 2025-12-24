import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { Form, Alert, Card, Row, Col, Placeholder, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../App';
import { emitToast, ToastType } from '../utils/notifications';
import { SpinnerButton } from '../utils/button';
import { useCreateGroupRequestMutation, useSetUserAsCamperMutation } from '../queries/mutations';
import { refreshAuthSession } from '../api/auth';
import { useGroupRequestQuery, useListRotaryClubsQuery } from '../queries/queries';
import { useQueryClient } from '@tanstack/react-query';
import { GroupRequestSchemaType } from '../api/apiGroupRequest';
// import { useSelectUserRoleMutation } from '../queries/mutations';

type Role = 'CAMPER' | 'ROTARIAN';

interface RoleSelectForm {
    role: Role;
    firstName: string;
    lastName: string;
    rotaryClubId: string | null;
}

export const RoleSelectionPage: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roleSelectionComplete, setRoleSelectionComplete] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // const selectUserRoleMutation = useSelectUserRoleMutation();
    const authContext = useContext(AuthContext);
    const queryClient = useQueryClient();

    const { 
        data: groupRequests, 
        isPending: isPendingGroupRequests
    } = useGroupRequestQuery(authContext.attributes.sub);

    const { mutate: createGroupRequest } = useCreateGroupRequestMutation();
    const setUserAsCamper = useSetUserAsCamperMutation();
    const { data: rotaryClubs, isPending: isPendingRotaryClubs } = useListRotaryClubsQuery();

    // const { mutate: sendRotarianRequestEmail } = useSendRotarianRequestEmailMutation();

    const handleAuthRefresh = useCallback(async () => {
        await refreshAuthSession(true);
        queryClient.invalidateQueries({ queryKey: ["user", authContext.attributes.sub]});
    }, [authContext.attributes.sub, queryClient]);

    // Set up interval to call handleAuthRefresh every 5 seconds after role selection is complete
    useEffect(() => {
        if (roleSelectionComplete || (groupRequests)) {
            // Start the interval
            intervalRef.current = setInterval(() => {
                handleAuthRefresh();
            }, 5000);

            // Cleanup interval on unmount or when roleSelectionComplete changes
            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            };
        }
    }, [roleSelectionComplete, handleAuthRefresh, groupRequests]);

    const FirstRequestView = () => {
        const {
            register,
            handleSubmit,
            watch,
            formState: { errors }
        } = useForm<RoleSelectForm>();

        const onSubmit = async (data: RoleSelectForm) => {
            if (!data.role) {
                emitToast('Please select a role', ToastType.Error);
                return;
            }

            setIsSubmitting(true);


            // await selectUserRoleMutation.mutateAsync({
            //     userSub: authContext.attributes.sub ?? '',
            //     role: data.role
            // });

            // Redirect based on role
            if (data.role === 'ROTARIAN') {
                createGroupRequest({
                    group: 'ROTARIANS',
                    userSub: authContext.attributes.sub ?? '',
                    email: authContext.attributes.email ?? '',
                    firstName: data.firstName,
                    lastName: data.lastName,
                    rotaryClubId: data.rotaryClubId
                }, {
                    onSuccess: async () => {
                        await handleAuthRefresh();
                        setRoleSelectionComplete(true);
                    },
                    onSettled: () => {
                        queryClient.invalidateQueries({ queryKey: ["groupRequest"] });
                    }
                });
            } else {
                setUserAsCamper.mutate(authContext.attributes.sub ?? '', {
                    onSuccess: async () => {
                        await handleAuthRefresh();
                        setRoleSelectionComplete(true);
                    }
                });
                // navigate('/camper/profile');
            }

            // window.location.reload();
            // console.log(await refreshAuthSession(true));
            // queryClient.invalidateQueries({ queryKey: ["user", authContext.attributes.sub]});
            // window.location.reload();
        };

        const selectedRole = watch('role');

        return (
            <div>
                <p className="text-center mb-4">
                    Please select your role to continue with the registration process.
                </p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">


                        <div className="mb-3">
                            <Form.Check
                                type="radio"
                                id="camper-role"
                                {...register('role', { required: 'Please select a role' })}
                                value="CAMPER"
                                label="Camper - I am a student applying to attend RYLA"
                            />
                        </div>

                        <div className="mb-3">
                            <Form.Check
                                type="radio"
                                id="rotarian-role"
                                {...register('role', { required: 'Please select a role' })}
                                value="ROTARIAN"
                                label="Rotarian - I am a Rotary Club member"
                            />
                        </div>
                        {errors.role && (
                            <div className="text-danger small">{errors.role.message}</div>
                        )}
                    </div>

                    {selectedRole == "ROTARIAN" && (
                        <div className="mb-4">
                            <Alert variant="info">
                                <strong>Rotarian Access Required:</strong> To register as a Rotarian,
                                a system administrator must approve your account.
                                Fill out the form below to request access.
                            </Alert>
                            <div className="mb-3">
                                <Form.Label htmlFor="firstName">First Name</Form.Label>
                                <Form.Control
                                    id="firstName"
                                    type="text"
                                    placeholder="Enter your first name"
                                    {...register('firstName', { required: 'First name is required' })}
                                    isInvalid={!!errors.firstName}
                                />
                                {errors.firstName && (
                                    <div className="text-danger small">{errors.firstName.message}</div>
                                )}
                            </div>
                            <div className="mb-3">
                                <Form.Label htmlFor="lastName">Last Name</Form.Label>
                                <Form.Control
                                    id="lastName"
                                    type="text"
                                    placeholder="Enter your last name"
                                    {...register('lastName', { required: 'Last name is required' })}
                                    isInvalid={!!errors.lastName}
                                />
                                {errors.lastName && (
                                    <div className="text-danger small">{errors.lastName.message}</div>
                                )}
                            </div>
                            <div className="mb-3">
                                <Form.Label htmlFor="rotaryClub">Rotary Club</Form.Label>
                                <div className="d-flex align-items-center">

                                <Form.Select
                                    {...register("rotaryClubId", { required: true })}
                                    isInvalid={!!errors.rotaryClubId}
                                    defaultValue=""
                                    disabled={isPendingRotaryClubs}
                                >
                                    <option disabled value="">
                                        {isPendingRotaryClubs ? "Loading clubs..." : "Select..."}
                                    </option>
                                    {rotaryClubs?.map((club) => (
                                        <option key={club.id} value={club.id}>
                                            {club.name}
                                        </option>
                                    ))}
                                </Form.Select>
                                {isPendingRotaryClubs && (

                                    <Spinner animation="border" size="sm" />
                                )}
                            </div>
                            </div>
                        </div>
                    )}

                    <div className="d-grid">
                        <SpinnerButton
                            type="submit"
                            variant="primary"
                            size="lg"
                            loading={isSubmitting}
                        >
                            Continue
                        </SpinnerButton>
                    </div>
                </form>
            </div>
        )
    };

    return (
        <div className="container mt-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card>
                        <Card.Header>
                            <h3 className="text-center mb-0">Account Setup</h3>
                        </Card.Header>
                        <Card.Body>
                            {isPendingGroupRequests ? 
                                <Placeholder animation='glow'><Placeholder xs={8}/> </Placeholder>
                            : (groupRequests ? <PostRequestView groupRequests={[groupRequests]} /> : <FirstRequestView />)}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}; 

function PostRequestView({ groupRequests }: { groupRequests: GroupRequestSchemaType[] }) {
    const { data: rotaryClubs } = useListRotaryClubsQuery();

    return (
        <div>
            <p>Your account request has been submitted. Open requests:</p>
            {groupRequests.map((request) => (
                <Alert key={request.userSub} variant="info">
                    <div><b>Group:</b> {request.group}</div>
                    <div><b>First Name:</b> {request.firstName}</div>
                    <div><b>Last Name:</b> {request.lastName}</div>
                    <div><b>Email:</b> {request.email}</div>
                    <div><b>Rotary Club:</b> {rotaryClubs?.find((club) => club.id === request.rotaryClubId)?.name ?? 'N/A'}</div>
                </Alert>
            ))}
            Your account is being reviewed. You will be notified by email when your account is approved.
        </div>
    );
}