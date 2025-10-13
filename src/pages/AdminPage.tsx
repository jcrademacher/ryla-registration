import React from 'react';
import { Button, Card, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { faUsers, faCampground, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/admin-page.scss';

export const AdminPage: React.FC = () => {
    const navigate = useNavigate();

    const handleNavigateToUserManagement = () => {
        navigate('/admin/user-management');
    };

    const handleNavigateToCampDashboard = () => {
        navigate('/admin/camps');
    };

    const handleNavigateToRotaryClubManagement = () => {
        navigate('/admin/rotary-clubs');
    };

    return (
        <div className="admin-page">
            <h1>Admin Dashboard</h1>
            <p>Welcome to the admin panel. Select an area to manage:</p>
            
            <Row className="d-flex justify-content-evenly flex-wrap">

                <Card className="h-50 admin-card" onClick={handleNavigateToUserManagement} style={{ cursor: 'pointer' }}>
                    <Card.Body className="text-center">
                        <FontAwesomeIcon icon={faUsers} size="3x" className="text-primary mb-3" />
                        <Card.Title>User Management</Card.Title>
                        <Card.Text>
                            Manage user accounts, roles, and permissions.
                        </Card.Text>
                        <Button variant="primary">
                            Manage Users
                        </Button>
                    </Card.Body>
                </Card>

            

                <Card className="h-50 admin-card" onClick={handleNavigateToCampDashboard} style={{ cursor: 'pointer' }}>
                    <Card.Body className="text-center">
                        <FontAwesomeIcon icon={faCampground} size="3x" className="text-primary mb-3" />
                        <Card.Title>Registration</Card.Title>
                        <Card.Text>
                            Manage camper applications, documents, and registration status.
                        </Card.Text>
                        <Button variant="primary" className="text-white">
                            Go To Dashboard
                        </Button>
                    </Card.Body>
                </Card>

                <Card className="h-50 admin-card" onClick={handleNavigateToRotaryClubManagement} style={{ cursor: 'pointer' }}>
                    <Card.Body className="text-center">
                        <FontAwesomeIcon icon={faUserGroup} size="3x" className="text-primary mb-3" />
                        <Card.Title>Rotary Club Management</Card.Title>
                        <Card.Text>
                            Manage rotary clubs and their settings.
                        </Card.Text>
                        <Button variant="primary" className="text-white">
                            <FontAwesomeIcon icon={faUserGroup} className="me-2" />
                            Manage Clubs
                        </Button>
                    </Card.Body>
                </Card>
                
            </Row>
        </div>
    );
}; 