import { useContext, useMemo, useState } from 'react';
import { Table, Spinner, Alert, Dropdown, Placeholder, Badge, Modal, Button, Form } from 'react-bootstrap';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useListUsersQuery, useRotarianProfileQuery } from '../queries/queries';
import { useListGroupsForUserQuery } from '../queries/queries';
import { ConfirmationModal, FormModal } from '../components/modals';
import { useSetUserGroupMutation, useDeleteUserMutation, useSetUserAsRotarianMutation } from '../queries/mutations';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../App';
import { SpinnerButton } from '../utils/button';
import { SubmitHandler, useForm } from 'react-hook-form';
import { AUTH_GROUPS, AuthGroup } from '../../amplify/auth/utils';
import { getUserEmailFromAttr, getUserSubFromAttr } from '../api/auth';
import { formatDateFull } from '../utils/datetime';

type ChangeGroupFormType = {
    group: AuthGroup | "CAMPERS";
}

type DeleteUserFormType = {
    email: string;
}

function UserRow({ user }: { user: any }) {

    const authContext = useContext(AuthContext);

    const { data: userGroups, isLoading: isGroupsLoading } = useListGroupsForUserQuery(getUserSubFromAttr(user.Attributes));
    const { data: rotarianProfile } = useRotarianProfileQuery(getUserSubFromAttr(user.Attributes));
    const { mutate: setUserGroup } = useSetUserGroupMutation();
    const { mutate: setUserAsRotarian } = useSetUserAsRotarianMutation();
    const { mutate: deleteUser } = useDeleteUserMutation();
    const queryClient = useQueryClient();
    // console.log(userGroups);

    const userSub = useMemo(() => getUserSubFromAttr(user.Attributes), [user]);
    const userEmail = useMemo(() => getUserEmailFromAttr(user.Attributes), [user]);

    const getUserStatus = (user: any) => {
        return user.UserStatus;
    };

    const isEmailVerified = (user: any) => {
        const verifiedAttr = user.Attributes.find((attr: any) => attr.Name === 'email_verified');
        return verifiedAttr?.Value === 'true';
    };

    const [showConfirmRotarian, setShowConfirmRotarian] = useState(false);
    const [addingRotarian, setAddingRotarian] = useState(false);

    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [deletingUser, setDeletingUser] = useState(false);

    const [showChangeGroup, setShowChangeGroup] = useState(false);
    const [changingGroup, setChangingGroup] = useState(false);

    const changeGroupForm = useForm<ChangeGroupFormType>({
        values: {
            group: userGroups?.[0] ?? "CAMPERS"
        }
    });

    const deleteUserForm = useForm<DeleteUserFormType>();

    const handleChangeGroup: SubmitHandler<ChangeGroupFormType> = async (data) => {
        setChangingGroup(true);
        setUserGroup({ userSub: getUserSubFromAttr(user.Attributes), group: data.group }, {
            onSettled: () => {
                setChangingGroup(false);
                setShowChangeGroup(false);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["userGroups", userSub] });
            }
        });
    }

    const handleConfirmRotarian = () => {
        setAddingRotarian(true);
        // TODO: Implement confirm functionality
        setUserAsRotarian(getUserSubFromAttr(user.Attributes),
            {
                onSettled: () => {
                    setAddingRotarian(false);
                    setShowConfirmRotarian(false);
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["userGroups", userSub] });
                    queryClient.invalidateQueries({ queryKey: ["rotarianProfile", userSub] });
                }
            }
        );
    };

    const handleDeleteUser: SubmitHandler<DeleteUserFormType> = () => {
        setDeletingUser(true);
        // TODO: Implement delete functionality

        deleteUser({ user, userGroups }, {
            onSettled: () => {
                setDeletingUser(false);
                setShowConfirmDelete(false);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["users"] });
            }
        });
    };


    return (
        <tr>
            <td>{userEmail}</td>
            <td>{isGroupsLoading ?
                <Placeholder animation='glow'>
                    <Placeholder xs={7} />
                </Placeholder>
                : userGroups?.join(", ")} {' '}
            </td>
            <td>
                {(rotarianProfile && !rotarianProfile.approved) ?
                    <Badge bg="warning" style={{ cursor: 'pointer' }} onClick={() => setShowConfirmRotarian(true)}>Rotarian Request</Badge>
                    : <></>}
            </td>
            <td>{getUserStatus(user)}</td>
            <td>{formatDateFull(user.UserCreateDate)}</td>
            <td>{isEmailVerified(user) ? 'Yes' : 'No'}</td>
            <td className="text-end">
                <Dropdown>
                    <Dropdown.Toggle variant="link" size="sm" className="p-0">
                        <FontAwesomeIcon icon={faEllipsisV} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setShowChangeGroup(true)}>
                            Change group...
                        </Dropdown.Item>
                        {authContext.attributes.sub !== userSub && (
                            <Dropdown.Item onClick={() => setShowConfirmDelete(true)} className="text-danger">
                                Delete
                            </Dropdown.Item>
                        )}
                    </Dropdown.Menu>
                </Dropdown>
            </td>
            <ConfirmationModal
                show={showConfirmRotarian}
                onClose={() => setShowConfirmRotarian(false)}
                onConfirm={() => handleConfirmRotarian()}
                title="Confirm Rotarian Request"
                isLoading={addingRotarian}
            >
                <p>This user is requesting to be a rotarian:</p>
                <Alert variant="secondary">
                    <div><b>Name:</b> {rotarianProfile?.firstName} {rotarianProfile?.lastName}</div>
                    <div><b>Email:</b> {userEmail}</div>
                    <div><b>Rotary Club:</b> {rotarianProfile?.rotaryClub}</div>
                </Alert>
                <div>Are you sure you want to confirm this request?</div>
            </ConfirmationModal>
            <FormModal
                show={showConfirmDelete}
                onClose={() => setShowConfirmDelete(false)}
                title="Confirm Delete User"
            >
                <Form onSubmit={deleteUserForm.handleSubmit(handleDeleteUser)}>
                    <Modal.Body>
                        <p>Are you sure you want to delete this user?</p>
                        <p className="text-danger">Warning: This action cannot be undone.</p>
                        <Form.Group>
                            <Form.Label>Enter the user's email address to confirm deletion</Form.Label>
                            <Form.Control
                                type="text"
                                {...deleteUserForm.register("email", { required: true })}
                                isInvalid={userEmail !== deleteUserForm.watch("email")}
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter the correct email address.
                            </Form.Control.Feedback>
                        </Form.Group>

                        
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowConfirmDelete(false)}>Cancel</Button>
                        <SpinnerButton
                            loading={deletingUser}
                            variant="primary"
                            type="submit"
                            disabled={userEmail !== deleteUserForm.watch("email")}
                        >
                            Delete
                        </SpinnerButton>
                    </Modal.Footer>
                </Form>
            </FormModal>
            <FormModal
                show={showChangeGroup}
                onClose={() => setShowChangeGroup(false)}
                title="Change Group"
            >
                <Form onSubmit={changeGroupForm.handleSubmit(handleChangeGroup)}>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Group</Form.Label>
                            <Form.Select {...changeGroupForm.register("group")}>
                                {AUTH_GROUPS.map((group: AuthGroup) => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                                <option key="CAMPERS" value="CAMPERS">CAMPERS</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowChangeGroup(false)}>Cancel</Button>
                        <SpinnerButton
                            loading={changingGroup}
                            variant="primary"
                            type="submit"
                        >
                            Change Group
                        </SpinnerButton>
                    </Modal.Footer>
                </Form>
            </FormModal>
        </tr>
    )
}

export function UserManagement() {
    const { data: usersData, isLoading, error, isSuccess } = useListUsersQuery();

    if (isLoading) {
        return (
            <div className="user-management">
                <h1>User Management</h1>
                <div className="text-center mt-4">
                    <Spinner animation="border" role="status" />
                    <p className="mt-2">Loading users...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-management">
                <h1>User Management</h1>
                <Alert variant="danger" className="mt-3">
                    Error loading users: {error.message}
                </Alert>
            </div>
        );
    }

    if (isSuccess) {

        return (
            <div className="user-management">
                <h1>User Management</h1>

                <p>Manage user accounts, roles, and permissions.</p>

                <Table bordered hover>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Group</th>
                            <th>Requests</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Verified</th>
                            <th className="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersData?.Users?.map((user: any) => (
                            <UserRow key={user?.Username} user={user} />
                        ))}
                    </tbody>
                </Table>
            </div>
        );
    }
}