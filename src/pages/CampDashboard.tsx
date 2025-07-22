import React, { useState } from 'react';
import { Button, Card, Row, Col, Alert, Badge, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CamperTableView } from '../components/CamperTableView';
import { ControlBar } from '../components/ControlBar';

export const CampDashboard: React.FC = () => {
    const [showAddCamperModal, setShowAddCamperModal] = useState(false);
    const navigate = useNavigate();

    const handleBackToAdmin = () => {
        navigate('/admin');
    };

    return (
        <div className="camp-dashboard">
            <div className="d-flex align-items-center mb-4">
                <Button 
                    variant="outline-secondary" 
                    onClick={handleBackToAdmin}
                    className="me-3"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Back to Admin
                </Button>
                <h1 className="mb-0">Camp Dashboard</h1>
            </div>
            <p>Manage campers, view applications, and oversee the RYLA program.</p>
            
            <Alert variant="info">
                <h4>RYLA 2025 Camp Management</h4>
                <p>Camp dates: June 22nd - June 25th, 2025</p>
                <p>Location: Camp Hinds, Raymond, ME</p>
                <p>Application deadline: January 10th, 2025</p>
            </Alert>

            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h3>Total Campers</h3>
                            <h2 className="text-primary">0</h2>
                            <small>Registered</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h3>Applications</h3>
                            <h2 className="text-warning">0</h2>
                            <small>Pending Review</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h3>Approved</h3>
                            <h2 className="text-success">0</h2>
                            <small>Ready for Camp</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h3>Documents</h3>
                            <h2 className="text-info">0</h2>
                            <small>Complete</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <ControlBar setShowAddCamperModal={setShowAddCamperModal} />
            
            <CamperTableView />
        </div>
    );
}; 