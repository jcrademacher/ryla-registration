import React, { useState } from 'react';
import { Card, Row, Col, Form, Modal, Button, Placeholder, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { faCalendar, faPlus, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CampSchemaType, CreateCampSchemaType } from '../api/apiCamp';
import '../styles/camp-dashboard.scss';
import { FormModal } from '../components/modals';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SpinnerButton, IconButton } from '../utils/button';
import { useCreateCampMutation } from '../queries/adminMutations';
import { useListCampsQuery } from '../queries/adminQueries';
import { useQueryClient } from '@tanstack/react-query';
import { createEDT, formatCampDates } from '../utils/datetime';
import { DateTime } from 'luxon';



// Add Camp Card Component
interface AddCampCardProps {
    onClick: () => void;
}

const AddCampCard: React.FC<AddCampCardProps> = ({ onClick }) => {
    return (
        <IconButton
            variant="primary"
            icon={faPlus}
            onClick={onClick}
        >
            Add Camp
        </IconButton>
    );
};

// Camp Year Card Component
interface CampYearCardProps {
    camp: CampSchemaType;
    onClick: (campId: string) => void;
}

// Placeholder card for loading state


interface CampYearCardPlaceholderProps { }

export const CampYearCardPlaceholder: React.FC<CampYearCardPlaceholderProps> = () => (
    <Col md={4} lg={3}>
        <Card className="h-100">
            <Card.Header>
                <Placeholder as="h5" animation="glow">
                    <Placeholder xs={6} />
                </Placeholder>
            </Card.Header>
            <Card.Body>


                <Placeholder animation="glow">
                    <Placeholder xs={7} />
                </Placeholder>
                <br />
                <Placeholder as="small" animation="glow">
                    <Placeholder xs={7} />
                </Placeholder>
                <br />
                <Placeholder as="small" animation="glow">
                    <Placeholder xs={5} />
                </Placeholder>


            </Card.Body>
        </Card>
    </Col>
);


const CampYearCard: React.FC<CampYearCardProps> = ({ camp, onClick }) => {


    const campDates = formatCampDates(camp);

    return (
        <Col md={4} lg={3}>
            <Card
                className="camp-card"
                onClick={() => onClick(camp.id)}
                style={{ cursor: 'pointer' }}
            >
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{camp.name}</h5>
                </Card.Header>
                <Card.Body>
                    <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                            <FontAwesomeIcon icon={faCalendar} className="text-muted me-2" />
                            <small className="text-muted">{campDates}</small>
                        </div>
                    </div>

                    {/* <Row className="text-center">
                        <Col xs={6}>
                            <div className="d-flex align-items-center justify-content-center mb-1">
                                <FontAwesomeIcon icon={faUsers} className="text-primary me-1" />
                                <span className="fw-bold">0</span>
                            </div>
                            <small className="text-muted">Campers</small>
                        </Col>
                        <Col xs={6}>
                            <div className="d-flex align-items-center justify-content-center mb-1">
                                <FontAwesomeIcon icon={faFileAlt} className="text-warning me-1" />
                                <span className="fw-bold">0</span>
                            </div>
                            <small className="text-muted">Pending</small>
                        </Col>
                    </Row>

                    <Row className="text-center mt-2">
                        <Col xs={6}>
                            <div className="d-flex align-items-center justify-content-center mb-1">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-success me-1" />
                                <span className="fw-bold">0</span>
                            </div>
                            <small className="text-muted">Approved</small>
                        </Col>
                        <Col xs={6}>
                            <div className="d-flex align-items-center justify-content-center mb-1">
                                <FontAwesomeIcon icon={faFileAlt} className="text-info me-1" />
                                <span className="fw-bold">0</span>
                            </div>
                            <small className="text-muted">Complete</small>
                        </Col>
                    </Row> */}
                </Card.Body>
            </Card>
        </Col>
    );
};

type CreateCampForm = {
    name: string;
    startDate: string;
    endDate: string;
    applicationDeadline: string;
    applicationOpenDate: string;
}

export const CampDashboard: React.FC = () => {
    const [showAddCampModal, setShowAddCampModal] = useState(false);
    const queryClient = useQueryClient();
    const { data: camps, isLoading: isLoadingCamps } = useListCampsQuery();
    const { mutate: createCamp, isPending: isCreatingCamp } = useCreateCampMutation(camps);

    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateCampForm>();

    const onCampCreate: SubmitHandler<CreateCampForm> = async (data: CreateCampForm) => {
        const startDateObj = createEDT(data.startDate);
        const endDateObj = createEDT(data.endDate);
        
        const startDate = startDateObj.toISO();
        const endDate = endDateObj.toISO();
        const applicationDeadline = createEDT(data.applicationDeadline).toISO();
        const applicationOpenDate = createEDT(data.applicationOpenDate).toISO();

        const newCamp: CreateCampSchemaType = {
            name: data.name,
            startDate: startDate ?? "",
            endDate: endDate ?? "",
            applicationDeadline: applicationDeadline ?? "",
            applicationOpenDate: applicationOpenDate ?? ""
        }

        console.log('newCamp', newCamp);

        createCamp(newCamp, {
            onSuccess: () => {
                setShowAddCampModal(false);
                queryClient.invalidateQueries({ queryKey: ['camps'] });
                reset();
            },
            onError: (error) => {
                console.error('Error creating camp:', error);
            }
        });
    };

    const onCampCreateCancel = () => {
        setShowAddCampModal(false);
        reset();
    };

    const handleCampClick = (campId: string) => {
        navigate(`/admin/camps/${campId}`);
    };

    return (
        <div className="camp-dashboard">
            <h3>Camp Dashboard</h3>
            <p>Manage RYLA camps by year and view camp statistics.</p>

            {/* Add Camp Button */}
            <div className="mb-4">
                <AddCampCard onClick={() => setShowAddCampModal(true)} />
            </div>

            <Row className="g-4">
                {isLoadingCamps ? (
                    <CampYearCardPlaceholder />
                ) : (
                    camps?.map((camp) => (
                        <CampYearCard key={camp.id} camp={camp} onClick={handleCampClick} />
                    ))
                )}
            </Row>
            <FormModal
                show={showAddCampModal}
                onClose={onCampCreateCancel}
                title="Add New Camp"
            >
                <Form onSubmit={handleSubmit(onCampCreate)}>
                    <Modal.Body>
                        <Row>
                            <Col xs={12}>
                                <Form.Group>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        {...register('name', { required: true })}
                                        isInvalid={!!errors.name}
                                        placeholder="e.g. RYLA 2026"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.name?.message || 'Camp name is required'}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={6}>
                                <Form.Group>
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        {...register('startDate', {
                                            required: true,
                                            validate: (startDate, { endDate }) => {
                                                const startDateObj = createEDT(startDate);
                                                const endDateObj = createEDT(endDate);

                                                if (startDateObj < DateTime.now()) {
                                                    return 'Start date must be after today';
                                                }
                                                else if (startDateObj > endDateObj) {
                                                    return 'Start date must be before end date';
                                                }

                                                return true;
                                            }
                                        })}
                                        isInvalid={!!errors.startDate}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.startDate?.message || 'Start date is required'}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col xs={6}>
                                <Form.Group>
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        {...register('endDate', {
                                            required: true,
                                            validate: (endDate, { startDate }) => {
                                                if (!endDate) {
                                                    return 'End date is required';
                                                }
                                                if (!startDate) {
                                                    return 'Start date must be set first';
                                                }
                                                // Check if endDate is at least 1 week after startDate
                                                const start = DateTime.fromISO(startDate);
                                                const end = DateTime.fromISO(endDate);
                                                if (end.diff(start, 'days').days > 7) {
                                                    return 'End date must be less than 1 week after start date';
                                                }
                                                return true;
                                            }
                                        })}
                                        isInvalid={!!errors.endDate}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.endDate?.message || 'End date is required'}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={6}>
                                <Form.Group>
                                    <Form.Label>Application Open Date</Form.Label>
                                    <Form.Control 
                                        type="datetime-local" 
                                        {...register('applicationOpenDate', {
                                            required: true,
                                            validate: (applicationOpenDate, { applicationDeadline }) => {
                                                const applicationDeadlineObj = createEDT(applicationDeadline);
                                                const applicationOpenDateObj = createEDT(applicationOpenDate);

                                                if(applicationOpenDateObj > applicationDeadlineObj) {
                                                    return 'Application open date must be before application deadline';
                                                }
                                                return true;
                                            }
                                        })} 
                                        isInvalid={!!errors.applicationOpenDate}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.applicationOpenDate?.message || 'Application open date is required'}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col xs={6}>
                                <Form.Group>
                                    <Form.Label>Application Deadline</Form.Label>
                                    <Form.Control 
                                        type="datetime-local" 
                                        {...register('applicationDeadline', {
                                            required: true,
                                            validate: (applicationDeadline, { startDate }) => {
                                                const startDateObj = createEDT(startDate);
                                                const applicationDeadlineObj = createEDT(applicationDeadline);

                                                if(applicationDeadlineObj > startDateObj) {
                                                    return 'Application deadline must be before start date';
                                                }
                                                return true;
                                            }
                                        })} 
                                        isInvalid={!!errors.applicationDeadline}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.applicationDeadline?.message || 'Application deadline is required'}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <br />
                        <Row>
                            <Col xs={12}>
                                <Alert variant="info">
                                    <FontAwesomeIcon icon={faCircleInfo} /> The time zone for camp dates is Eastern Time (EDT/EST). 
                                    These dates will be displayed to campers and rotarians as the start (dropoff time) and end (pickup time) dates of camp.
                                </Alert>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <Alert variant="info">
                                    <FontAwesomeIcon icon={faCircleInfo} /> Once you create a new camp year, the camper page will indicate that applications are open for this camp year.
                                </Alert>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={onCampCreateCancel}>Cancel</Button>
                        <SpinnerButton
                            variant="primary"
                            type="submit"
                            loading={isCreatingCamp}
                        >
                            Create
                        </SpinnerButton>
                    </Modal.Footer>

                </Form>
            </FormModal>

            {/* Add Camp Modal would go here */}
            {/* TODO: Implement modal for adding new camp years */}
        </div>
    );
}; 