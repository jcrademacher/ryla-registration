import { useContext, useState } from 'react';
import { Badge, Form, Dropdown, Modal, Button, Container } from 'react-bootstrap';
import { createColumnHelper } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../App';
import { useSetUserGroupMutation } from '../queries/mutations';
import { AuthGroup } from '../../amplify/auth/utils';
import { FormModal } from '../components/modals';
import { SpinnerButton } from '../utils/button';
import { emitToast, ToastType } from '../utils/notifications';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ThinSpacer } from '../components/ThinSpacer';
import { RotarianProfileWithGroupType } from '../api/apiRotarianProfile';
import { useListRotariansInfiniteQuery } from '../queries/queries';
import { SearchablePaginatedTable } from '../components/table';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

const columnHelper = createColumnHelper<RotarianProfileWithGroupType>();

const baseColumns = [
    columnHelper.accessor(row => {
        if (row.firstName && row.lastName) return `${row.firstName} ${row.lastName}`;
        return 'N/A';
    }, {
        id: 'name',
        header: 'Name',
    }),
    columnHelper.accessor('email', {
        header: 'Email',
    }),
    columnHelper.accessor('clubName', {
        header: 'Club',
    }),
    columnHelper.accessor('group', {
        header: 'Role',
        cell: ({ getValue }) => {
            const group = getValue();

            switch(group) {
                case 'COORDINATORS':
                    return <Badge bg="primary">{group}</Badge>;
                case 'ROTARIANS':
                    return <Badge bg="secondary">{group}</Badge>;
                default:
                    return <small className="text-danger">
                        <FontAwesomeIcon icon={faTriangleExclamation} className="me-1" />
                        Orphaned profile
                    </small>;
            }
        },
    }),
];

export function RotarianTable({ rotaryClubId }: { rotaryClubId?: string | null }) {
    const rotariansQuery = useListRotariansInfiniteQuery(rotaryClubId);
    const authContext = useContext(AuthContext);
    const queryClient = useQueryClient();

    type ChangeGroupFormType = { group: string };
    const [selectedProfile, setSelectedProfile] = useState<RotarianProfileWithGroupType | null>(null);
    const changeGroupForm = useForm<ChangeGroupFormType>({ defaultValues: { group: '' } });
    const { mutate: setUserGroup, isPending: isChangingGroup } = useSetUserGroupMutation();

    const handleCloseChangeGroup = () => {
        setSelectedProfile(null);
        changeGroupForm.reset();
    };

    const handleChangeGroup: SubmitHandler<ChangeGroupFormType> = (data) => {
        if (!selectedProfile?.userSub) return;
        setUserGroup(
            { userSub: selectedProfile.userSub, group: data.group as AuthGroup | 'CAMPERS' },
            {
                onSettled: () => handleCloseChangeGroup(),
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['rotariansWithGroup', rotaryClubId] });
                    emitToast('Updated role', ToastType.Success);
                },
            }
        );
    };

    return (
        
        <>
            <SearchablePaginatedTable<RotarianProfileWithGroupType>
                query={rotariansQuery}
                columns={baseColumns}
                renderActions={(profile) => {
                    const isSelf = authContext.attributes.sub === profile.userSub;
                    if (isSelf) return <small className="text-muted">(You)</small>;
                    return (
                        <div className="text-end">
                            <Dropdown>
                                <Dropdown.Toggle variant="link" size="sm" className="p-0">
                                    <FontAwesomeIcon icon={faEllipsisV} />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => {
                                        changeGroupForm.reset();
                                        setSelectedProfile(profile);
                                    }}>
                                        Change role...
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    );
                }}
            />

            {selectedProfile && (
                <FormModal
                    show={!!selectedProfile}
                    onClose={handleCloseChangeGroup}
                    title="Change Role"
                >
                    <Form onSubmit={changeGroupForm.handleSubmit(handleChangeGroup)}>
                        <Modal.Body>
                            <div className="mb-3">
                                Current role: {selectedProfile.group ?? 'ROTARIANS'}
                            </div>
                            <Form.Select
                                defaultValue=""
                                {...changeGroupForm.register('group', { required: true })}
                            >
                                <option value="" disabled>Select...</option>
                                <option value="ROTARIANS">ROTARIANS</option>
                                <option value="COORDINATORS">COORDINATORS</option>
                            </Form.Select>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="light" onClick={handleCloseChangeGroup}>Cancel</Button>
                            <SpinnerButton
                                variant="primary"
                                type="submit"
                                disabled={isChangingGroup || !changeGroupForm.watch('group')}
                                loading={isChangingGroup}
                            >
                                Change
                            </SpinnerButton>
                        </Modal.Footer>
                    </Form>
                </FormModal>
            )}
        </>
    );
}

export function RotarianDirectory() {
    return (
        <Container>
            <h3>Rotarian Directory</h3>
            <ThinSpacer />
            <RotarianTable rotaryClubId={null} />
        </Container>
    );
}
