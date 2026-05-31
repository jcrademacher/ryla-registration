import React, { useContext, useRef, useState } from 'react';
import { Container, Spinner, Alert, Badge, Form } from 'react-bootstrap';
import { useSearchParams, Link } from 'react-router';
import { useRotaryClubQuery } from '../queries/queries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPencil } from '@fortawesome/free-solid-svg-icons';
import { ThinSpacer } from '../components/ThinSpacer';
import { AuthContext } from '../App';
import { isUserAdmin } from '../api/auth';
import { useUpdateRotaryClubMutation } from '../queries/adminMutations';
import { useQueryClient } from '@tanstack/react-query';
import { emitToast, ToastType } from '../utils/notifications';
import { RotaryClubSchemaType } from '../api/apiRotaryClub';
import { RotarianTable } from './RotarianDirectory';

export const RotaryClubDetailsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const clubId = searchParams.get('id');
    const authContext = useContext(AuthContext);
    const isAdmin = isUserAdmin(authContext.groups);
    const queryClient = useQueryClient();

    const { data: rotaryClub, isLoading: isLoadingClub, error: clubError } = useRotaryClubQuery(clubId);

    const [editingField, setEditingField] = useState<string | null>(null);
    const editCancelledRef = useRef(false);
    const { mutate: updateClub } = useUpdateRotaryClubMutation();

    const handleUpdateClubSetting = (field: string, value: boolean | number) => {
        if (!rotaryClub) return;

        queryClient.setQueryData(['rotaryClub', clubId], (old: RotaryClubSchemaType) => ({
            ...old,
            [field]: value,
        }));
        updateClub(
            { id: rotaryClub.id, [field]: value },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['rotaryClub'] });
                    emitToast('Club setting updated', ToastType.Success);
                },
                onError: () => {
                    emitToast('Failed to update setting', ToastType.Error);
                },
            }
        );
    };

    if (!clubId) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    No club ID provided. Please select a club from the management page.
                </Alert>
                <Link to="/admin/rotary-clubs" className="btn btn-primary">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Back to Rotary Clubs
                </Link>
            </Container>
        );
    }

    if (isLoadingClub) {
        return (
            <Container className="mt-4">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <Spinner animation="border" role="status" />
                        <p className="mt-2">Loading club details...</p>
                    </div>
                </div>
            </Container>
        );
    }

    if (clubError) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    Error loading club details: {clubError?.message}
                </Alert>
                <Link to="/admin/rotary-clubs" className="btn btn-primary">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Back to Rotary Clubs
                </Link>
            </Container>
        );
    }

    if (!rotaryClub) {
        return (
            <Container className="mt-4">
                <Alert variant="warning">
                    Rotary club not found.
                </Alert>
                <Link to="/admin/rotary-clubs" className="btn btn-primary">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Back to Rotary Clubs
                </Link>
            </Container>
        );
    }

    return (
        <Container>

            <h3>{rotaryClub.name} Rotary Club</h3>
            <ThinSpacer />


            {/* Club Information Card */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <div className="mb-2 d-flex align-items-center gap-2">
                        <strong>Requires Application:</strong>
                        {editingField === 'requiresApplication' ? (
                            <Form.Select
                                size="sm"
                                style={{ width: 'auto' }}
                                autoFocus
                                defaultValue={rotaryClub.requiresApplication ? 'true' : 'false'}
                                onChange={(e) => {
                                    handleUpdateClubSetting('requiresApplication', e.target.value === 'true');
                                    setEditingField(null);
                                }}
                                onBlur={() => setEditingField(null)}
                                onKeyDown={(e) => { if (e.key === 'Escape') setEditingField(null); }}
                            >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </Form.Select>
                        ) : (
                            <>
                                <Badge bg={rotaryClub.requiresApplication ? 'success' : 'danger'}>
                                    {rotaryClub.requiresApplication ? 'Yes' : 'No'}
                                </Badge>
                                {isAdmin && (
                                    <FontAwesomeIcon
                                        icon={faPencil}
                                        className="text-primary"
                                        size="xs"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setEditingField('requiresApplication')}
                                    />
                                )}
                            </>
                        )}
                    </div>
                    <div className="mb-2 d-flex align-items-center gap-2">
                        <strong>Requires Interview:</strong>
                        {editingField === 'requiresInterview' ? (
                            <Form.Select
                                size="sm"
                                style={{ width: 'auto' }}
                                autoFocus
                                value={rotaryClub.requiresInterview ? 'true' : 'false'}
                                onChange={(e) => {
                                    handleUpdateClubSetting('requiresInterview', e.target.value === 'true');
                                    setEditingField(null);
                                }}
                                onBlur={() => setEditingField(null)}
                                onKeyDown={(e) => { if (e.key === 'Escape') setEditingField(null); }}
                            >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </Form.Select>
                        ) : (
                            <>
                                <Badge bg={rotaryClub.requiresInterview ? 'success' : 'danger'}>
                                    {rotaryClub.requiresInterview ? 'Yes' : 'No'}
                                </Badge>
                                {isAdmin && (
                                    <FontAwesomeIcon
                                        icon={faPencil}
                                        className="text-primary"
                                        size="xs"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setEditingField('requiresInterview')}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="mb-2 d-flex align-items-center gap-2">
                        <strong>Required Number of Letters:</strong>
                        {editingField === 'numRequiredLetters' ? (
                            <Form.Control
                                type="number"
                                size="sm"
                                min={0}
                                max={5}
                                autoFocus
                                style={{ width: '80px' }}
                                defaultValue={rotaryClub.numRequiredLetters ?? 0}
                                onBlur={(e) => {
                                    if (!editCancelledRef.current) {
                                        const val = Math.min(5, Math.max(0, parseInt(e.target.value) || 0));
                                        if (val !== (rotaryClub.numRequiredLetters ?? 0)) {
                                            handleUpdateClubSetting('numRequiredLetters', val);
                                        }
                                    }
                                    editCancelledRef.current = false;
                                    setEditingField(null);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        (e.target as HTMLInputElement).blur();
                                    } else if (e.key === 'Escape') {
                                        editCancelledRef.current = true;
                                        (e.target as HTMLInputElement).blur();
                                    }
                                }}
                            />
                        ) : (
                            <>
                                <span>{rotaryClub.numRequiredLetters || 0}</span>
                                {isAdmin && (
                                    <FontAwesomeIcon
                                        icon={faPencil}
                                        className="text-primary"
                                        size="xs"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setEditingField('numRequiredLetters')}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Rotarian Members */}

            <h5>Club Representatives</h5>
            <ThinSpacer />

            <p>
                Coordinators and Rotarians can read applications, recommendations, and files, but only Coordinators can make decisions to admit, reject, or transfer applicants.
            </p>

            <RotarianTable rotaryClubId={clubId} />
        </Container>
    );
};


