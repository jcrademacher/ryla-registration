import { useContext, useState } from 'react';
import { Table, Spinner, Alert, Dropdown, Placeholder, Badge } from 'react-bootstrap';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useListUsersQuery, useRotarianProfileQuery } from '../queries/queries';
import { useListGroupsForUserQuery } from '../queries/queries';
import { ConfirmationModal } from '../components/modals';
import { useSetUserAsRotarianMutation, useDeleteUserMutation } from '../queries/mutations';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../App';

function UserRow({ user }: { user: any }) {

    const authContext = useContext(AuthContext);

    const { data: userGroups, isLoading: isGroupsLoading } = useListGroupsForUserQuery(user?.Username);
    const { data: rotarianProfile } = useRotarianProfileQuery(user?.Username);
    const { mutate: setUserGroup } = useSetUserAsRotarianMutation();
    const { mutate: deleteUser } = useDeleteUserMutation();
    const queryClient = useQueryClient();
    // console.log(userGroups);

    const getUserEmail = (user: any) => {
        return user.Attributes.find((attr: any) => attr.Name === 'email')?.Value || 'No email';
    };

    const getUserStatus = (user: any) => {
        return user.UserStatus;
    };

    const isEmailVerified = (user: any) => {
        const verifiedAttr = user.Attributes.find((attr: any) => attr.Name === 'email_verified');
        return verifiedAttr?.Value === 'true';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const [showConfirmRotarian, setShowConfirmRotarian] = useState(false);
    const [addingRotarian, setAddingRotarian] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [deletingUser, setDeletingUser] = useState(false);
   

    const handleConfirmRotarian = () => {
        setAddingRotarian(true);
        // TODO: Implement confirm functionality
        setUserGroup({ userSub: user.Username, group: "ROTARIANS" },
            {
                onSettled: () => {
                    setAddingRotarian(false);
                    setShowConfirmRotarian(false);
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["userGroups", user.Username] });
                    queryClient.invalidateQueries({ queryKey: ["rotarianProfile", user.Username] });
                }
            }
        );
    };

    const handleDeleteUser = (user: any) => {
        setDeletingUser(true);
        // TODO: Implement delete functionality
        deleteUser(user.Username, {
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
            <td>{getUserEmail(user)}</td>
            <td>{isGroupsLoading ? 
                <Placeholder animation='glow'>
                    <Placeholder xs={7} />
                </Placeholder> 
                : userGroups.Groups.map((g: { GroupName: string }) => g.GroupName).join(", ")} {' '}
            </td>
            <td>
                {(rotarianProfile && !rotarianProfile.approved) ? 
                    <Badge bg="warning" style={{ cursor: 'pointer' }} onClick={() => setShowConfirmRotarian(true)}>Rotarian Request</Badge> 
                    : <></>}
            </td>
            <td>{getUserStatus(user)}</td>
            <td>{formatDate(user.UserCreateDate)}</td>
            <td>{isEmailVerified(user) ? 'Yes' : 'No'}</td>
            <td className="text-end">
                <Dropdown>
                    <Dropdown.Toggle variant="link" size="sm" className="p-0">
                        <FontAwesomeIcon icon={faEllipsisV} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => {}}>
                            Change group...
                        </Dropdown.Item>
                        {authContext.attributes.sub !== user.Username && (
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
                    <div><b>Email:</b> {getUserEmail(user)}</div>
                    <div><b>Rotary Club:</b> {rotarianProfile?.rotaryClub}</div>
                </Alert>
                <div>Are you sure you want to confirm this request?</div>
            </ConfirmationModal>
            <ConfirmationModal
                show={showConfirmDelete}
                onClose={() => setShowConfirmDelete(false)}
                onConfirm={() => handleDeleteUser(user)}
                title="Confirm Delete User"
                isLoading={deletingUser}
            >
                <p>Are you sure you want to delete this user?</p>
            </ConfirmationModal>
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

    if(isSuccess) {

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
                            <UserRow key={user?.Username} user={user}/>
                        ))}
                    </tbody>
                </Table>
            </div>
        );
    }
}