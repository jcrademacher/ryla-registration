import { useContext, useState } from 'react';
import { Spinner, Alert, Dropdown, Modal, Button, Form, Card } from 'react-bootstrap';
import { faCheck, faEllipsisV, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useListUsersQuery, useListGroupRequestsQuery, useListRotaryClubsQuery } from '../queries/queries';
import { FormModal } from '../components/modals';
import { useSetUserGroupMutation, useDeleteUserMutation } from '../queries/mutations';
import { useDecideGroupRequestMutation } from '../queries/adminMutations';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../App';
import { SpinnerButton } from '../utils/button';
import { SubmitHandler, useForm } from 'react-hook-form';
import { AUTH_GROUPS, AuthGroup } from '../../amplify/auth/utils';
import { PlaceholderElement } from '../components/PlaceholderElement';
import { createColumnHelper } from '@tanstack/react-table';
import { DateTime } from 'luxon';
import { UserProfile } from '../api/auth';
import { GroupRequestSchemaType } from '../api/apiGroupRequest';
import { createFromISO } from '../utils/datetime';
import { emitToast, ToastType } from '../utils/notifications';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Container } from 'react-bootstrap';
import { SearchablePaginatedTable } from '../components/table';

type ChangeGroupFormType = {
    groupName: string | null;
}

type DeleteUserFormType = {
    email: string;
}

// function RequestCell({ user, openRequest }: { user: UserProfile, openRequest?: (user: UserProfile, groupRequest: AuthGroup) => void }) {

//     return (
//         <div>
//             {user.request === "ROTARIANS" ?
//                 <Badge bg="warning" style={{ cursor: 'pointer' }} onClick={() => openRequest?.(user, "ROTARIANS")}>Rotarian Request</Badge>
//                 : <></>}
//         </div>
//     )
// }

function ActionsCell({ user, changeGroup, deleteUser }: { user: UserProfile, changeGroup?: (user: UserProfile) => void, deleteUser?: (user: UserProfile) => void }) {
    const authContext = useContext(AuthContext);

    if (authContext.attributes.sub !== user.userSub) {
        return (
            <div className="text-end">
                <Dropdown>
                    <Dropdown.Toggle variant="link" size="sm" className="p-0">
                        <FontAwesomeIcon icon={faEllipsisV} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => changeGroup?.(user)}>
                            Change group...
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => deleteUser?.(user)} className="text-danger">
                            Delete
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        )
    }
    else {
        return <div className="text-end">
            <small className="text-muted">(You)</small>
        </div>
    }
}

interface GroupRequestCardProps {
    request: GroupRequestSchemaType;
}

function GroupRequestCard({ request }: GroupRequestCardProps) {
    const { data: rotaryClubs } = useListRotaryClubsQuery();
    const { mutate: decideGroupRequest, isPending: isDecidingGroupRequest } = useDecideGroupRequestMutation();

    const queryClient = useQueryClient();

    // Placeholder functions for group request actions
    const handleApproveGroupRequest = () => {
        decideGroupRequest({ request, decision: "approve" }, {
            onSettled: () => {
                queryClient.invalidateQueries({ queryKey: ["users"] });
                queryClient.invalidateQueries({ queryKey: ["groupRequests"] });
            },
            onSuccess: () => {
                emitToast(`Approved request`, ToastType.Success);
            }
        });

    };

    const handleDenyGroupRequest = () => {
        decideGroupRequest({ request, decision: "reject" }, {
            onSettled: () => {
                queryClient.invalidateQueries({ queryKey: ["users"] });
                queryClient.invalidateQueries({ queryKey: ["groupRequests"] });
            },
            onSuccess: () => {
                emitToast(`Denied account request`, ToastType.Success);
            }
        });
    }

    return (
        <Card className={isDecidingGroupRequest ? "opacity-50" : ""}>
            <Card.Body className="d-flex flex-column position-relative">
                {isDecidingGroupRequest && (
                    <div className="position-absolute top-50 start-50 translate-middle d-flex justify-content-center align-items-center">
                        <Spinner animation="border" role="status" />
                    </div>
                )}
                <div className="d-flex flex-row justify-content-between align-items-center mb-1">
                    <b>{request.firstName} {request.lastName}</b>
                    <span>
                        <FontAwesomeIcon
                            icon={faCheck}
                            className="text-success"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleApproveGroupRequest()}
                            title="Approve Request"
                        />
                        <FontAwesomeIcon
                            icon={faXmark}
                            className="text-danger ms-3"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleDenyGroupRequest()}
                            title="Deny Request"
                        />
                    </span>
                </div>
                <small className="text-muted">
                    <div className="text-nowrap">Email: {request.email}</div>
                    <div>Requesting to join: {request.group}</div>
                    <div>Rotary Club:&nbsp;
                        <PlaceholderElement
                            isLoading={!rotaryClubs}
                            props={{ xs: 8 }}
                        >
                            {rotaryClubs?.find((club) => club.id === request.rotaryClubId)?.name ?? 'N/A'}
                        </PlaceholderElement>
                    </div>
                </small>
                {/* <div className="d-flex gap-2 mt-auto">

                </div> */}
            </Card.Body>
        </Card>
    );
}

interface GroupRequestCarouselProps {
    groupRequests: GroupRequestSchemaType[];
}

function GroupRequestCarousel({ groupRequests }: GroupRequestCarouselProps) {
    if (groupRequests.length === 0) {
        return null;
    }

    return (
        <div className="mb-3">
            <h6 className="mb-2">Pending Account Requests ({groupRequests.length})</h6>
            <div className="d-flex flex-row justify-content-left overflow-x-auto">
                {groupRequests.map((request) => (
                    <div className="me-2" key={request.userSub}>
                        <GroupRequestCard
                            request={request}
                        />
                    </div>

                ))}
            </div>
        </div>
    );
}

const columnHelper = createColumnHelper<UserProfile>();

const userColumns = [
    columnHelper.accessor('email', {
        header: "Email",
    }),
    columnHelper.accessor('groupNames', {
        header: "Groups",
        cell: (props) => props.getValue().join(", "),
    }),
    columnHelper.accessor('createdAt', {
        header: "Created At",
        cell: (props) => createFromISO(props.getValue()).toLocaleString(DateTime.DATETIME_MED),
    }),
    columnHelper.accessor('verified', {
        header: "Verified",
        cell: (props) => props.getValue() ? "Yes" : "No",
    }),
]

export function UserManagement() {
    const usersQuery = useListUsersQuery();
    const { data: groupRequestsData } = useListGroupRequestsQuery();
    const queryClient = useQueryClient();

    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [showChangeGroup, setShowChangeGroup] = useState(false);

    const { mutate: setUserGroup, isPending: isChangingGroup } = useSetUserGroupMutation();
    const { mutate: deleteUser, isPending: isDeletingUser } = useDeleteUserMutation();

    const changeGroupForm = useForm<ChangeGroupFormType>({ defaultValues: { groupName: "" } });
    const deleteUserForm = useForm<DeleteUserFormType>();

    const handleCloseDeleteModal = () => {
        setShowConfirmDelete(false);
        setSelectedUser(null);
        deleteUserForm.reset();
    };

    const handleCloseChangeGroupModal = () => {
        setShowChangeGroup(false);
        setSelectedUser(null);
        changeGroupForm.reset();
    };

    const handleDeleteUser: SubmitHandler<DeleteUserFormType> = (data) => {
        if (data.email !== selectedUser?.email) {
            emitToast('The email address entered does not match the selected user. Aborting.', ToastType.Error);
            return;
        }
        if (!selectedUser?.userSub) {
            emitToast('No user selected. Aborting.', ToastType.Error);
            return;
        }
        deleteUser({ userSub: selectedUser.userSub }, {
            onSettled: () => handleCloseDeleteModal(),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
        });
    };

    const handleChangeGroup: SubmitHandler<ChangeGroupFormType> = (data) => {
        if (!selectedUser?.userSub) return;
        setUserGroup({ userSub: selectedUser.userSub, group: data.groupName as AuthGroup }, {
            onSettled: () => handleCloseChangeGroupModal(),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["users"] });
                emitToast(`Updated group`, ToastType.Success);
            },
        });
    };

    return (
        <Container className="user-management">
            <h3>User Management</h3>
            <p>Manage user accounts, roles, and permissions.</p>

            <GroupRequestCarousel groupRequests={groupRequestsData ?? []} />

            <SearchablePaginatedTable<UserProfile>
                query={usersQuery}
                columns={userColumns}
                renderActions={(user) => (
                    <ActionsCell
                        user={user}
                        changeGroup={(u) => { setSelectedUser(u); setShowChangeGroup(true); changeGroupForm.reset(); }}
                        deleteUser={(u) => { setSelectedUser(u); setShowConfirmDelete(true); deleteUserForm.reset(); }}
                    />
                )}
            />

            {showConfirmDelete && (
                <FormModal
                    show={showConfirmDelete}
                    onClose={handleCloseDeleteModal}
                    title="Confirm Delete User"
                >
                    <Form onSubmit={deleteUserForm.handleSubmit(handleDeleteUser)}>
                        <Modal.Body>
                            <Alert variant="danger">
                                <FontAwesomeIcon icon={faTriangleExclamation} />
                                <b>Warning:</b> This action cannot be undone. Deleting a user
                                will remove any and all data associated with the user, such as camper profiles, rotarian profiles, and rotarian reviews.
                            </Alert>
                            <Form.Group>
                                <Form.Label>Enter the user's email address to confirm deletion</Form.Label>
                                <Form.Control
                                    type="text"
                                    {...deleteUserForm.register("email", { required: true })}
                                    isInvalid={selectedUser?.email !== deleteUserForm.watch("email")}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please enter the correct email address.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="light" onClick={handleCloseDeleteModal}>Cancel</Button>
                            <SpinnerButton
                                loading={isDeletingUser}
                                variant="danger"
                                type="submit"
                                disabled={selectedUser?.email !== deleteUserForm.watch("email")}
                            >
                                Delete
                            </SpinnerButton>
                        </Modal.Footer>
                    </Form>
                </FormModal>
            )}

            {showChangeGroup && (
                <FormModal
                    show={showChangeGroup}
                    onClose={handleCloseChangeGroupModal}
                    title="Change Group"
                >
                    <Form onSubmit={changeGroupForm.handleSubmit(handleChangeGroup)}>
                        <Modal.Body>
                            <div className="mb-3">
                                Current groups: {selectedUser ? selectedUser.groupNames.length > 0 ? selectedUser.groupNames.join(", ") : "CAMPERS" : "No user selected."}
                            </div>
                            <Form.Select {...changeGroupForm.register("groupName", { required: true })}>
                                <option value="" disabled>Select...</option>
                                <option value="CAMPERS">CAMPERS</option>
                                {AUTH_GROUPS.map((group) => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                            </Form.Select>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="light" onClick={handleCloseChangeGroupModal}>Cancel</Button>
                            <SpinnerButton
                                variant="primary"
                                type="submit"
                                disabled={isChangingGroup || changeGroupForm.watch("groupName") === ""}
                                loading={isChangingGroup}
                            >
                                Change
                            </SpinnerButton>
                        </Modal.Footer>
                    </Form>
                </FormModal>
            )}
        </Container>
    );
}