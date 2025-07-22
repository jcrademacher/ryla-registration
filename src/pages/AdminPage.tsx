import React from 'react';
import { Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { faUsers, faCampground, faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/admin-page.scss';

export const AdminPage: React.FC = () => {
    const navigate = useNavigate();

    const handleNavigateToUserManagement = () => {
        navigate('/admin/user-management');
    };

    const handleNavigateToCampDashboard = () => {
        navigate('/admin/camp-dashboard');
    };

    return (
        <div className="admin-page">
            <h1>Admin Dashboard</h1>
            <p>Welcome to the admin panel. Select an area to manage:</p>
            
            <Row className="mt-4">
                <Col md={6} className="mb-4">
                    <Card className="h-100 admin-card" onClick={handleNavigateToUserManagement} style={{ cursor: 'pointer' }}>
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faUsers} size="3x" className="text-primary mb-3" />
                            <Card.Title>User Management</Card.Title>
                            <Card.Text>
                                Manage user accounts, roles, and permissions.
                            </Card.Text>
                            <Button variant="primary">
                                <FontAwesomeIcon icon={faCog} className="me-2" />
                                Manage Users
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col md={6} className="mb-4">
                    <Card className="h-100 admin-card" onClick={handleNavigateToCampDashboard} style={{ cursor: 'pointer' }}>
                        <Card.Body className="text-center">
                            <FontAwesomeIcon icon={faCampground} size="3x" className="text-secondary mb-3" />
                            <Card.Title>Registration</Card.Title>
                            <Card.Text>
                                Manage camper applications, documents, and registration status.
                            </Card.Text>
                            <Button variant="secondary" className="text-white">
                                <FontAwesomeIcon icon={faCampground} className="me-2" />
                                Go To Dashboard
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}; 