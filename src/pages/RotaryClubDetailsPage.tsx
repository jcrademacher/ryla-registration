import React from 'react';
import { Container, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import { useSearchParams, Link } from 'react-router';
import { useRotaryClubQuery, useRotarianProfilesByClubQuery, useGetUserQuery } from '../queries/queries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { ThinSpacer } from '../components/ThinSpacer';
import { RotarianProfileSchemaType } from '../api/apiRotarianProfile';
import { PlaceholderElement } from '../components/PlaceholderElement';


export const RotaryClubDetailsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const clubId = searchParams.get('id');

    const { data: rotaryClub, isLoading: isLoadingClub, error: clubError } = useRotaryClubQuery(clubId);
    const { data: rotarianProfiles, isLoading: isLoadingRotarians, error: rotariansError } = useRotarianProfilesByClubQuery(clubId);

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

    if (isLoadingClub || isLoadingRotarians) {
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

    if (clubError || rotariansError) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    Error loading club details: {clubError?.message || rotariansError?.message}
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
                    <p className="mb-2">
                        <strong>Requires Application:</strong>{' '}
                        <Badge bg={rotaryClub.requiresApplication ? 'success' : 'danger'}>
                            {rotaryClub.requiresApplication ? 'Yes' : 'No'}
                        </Badge>
                    </p>
                    <p className="mb-2">
                        <strong>Requires Interview:</strong>{' '}
                        <Badge bg={rotaryClub.requiresInterview ? 'success' : 'danger'}>
                            {rotaryClub.requiresInterview ? 'Yes' : 'No'}
                        </Badge>
                    </p>
                </div>
                <div className="col-md-6">
                    <p className="mb-2">
                        <strong>Required Number of Letters:</strong> {rotaryClub.numRequiredLetters || 0}
                    </p>
                </div>
            </div>

            {/* Rotarian Members */}

            <h5>Club Representatives ({rotarianProfiles?.length || 0})</h5>
            <ThinSpacer />

            {rotarianProfiles && rotarianProfiles.length > 0 ? (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Groups</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rotarianProfiles.map((profile) => (
                            <RotarianRow key={profile.userSub} profile={profile} />
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p className="text-muted mb-0">No club representatives found.</p>
            )}
        </Container>
    );
};

function RotarianRow({ profile }: { profile: RotarianProfileSchemaType }) {
    const { data: user, isPending: isPendingUser } = useGetUserQuery(profile.userSub);

    return (
        <tr key={profile.userSub}>
            <td>
                {profile.firstName && profile.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : 'N/A'}
            </td>
            <td>{profile.email}</td>
            <td>
                <PlaceholderElement isLoading={isPendingUser} props={{ xs: 7 }}>
                    {user ? user?.groupNames?.map((name) => {
                        return <Badge key={name} bg={name === "COORDINATORS" ? "primary" : "secondary"}>{name}</Badge>
                    })
                : 
                <span className="text-danger">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="me-1" />
                    Orphaned profile
                </span>
                }
                </PlaceholderElement>
            </td>
        </tr>
    )
}

