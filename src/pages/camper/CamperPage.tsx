import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Alert, Badge, Placeholder, Tab, Tabs } from 'react-bootstrap';
import { AuthContext } from '../../App';
import {
    faCircle,
    faCheck,
    faEllipsis,
} from '@fortawesome/free-solid-svg-icons';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router';
import { useCamperProfileQuery, useRotarianReviewQuery } from '../../queries/queries';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { CamperProfile } from './CamperProfile';
import { CamperRotaryClubReview } from './CamperRotaryClubReview';
import { CamperImportantDocuments } from './CamperDocuments';
import { CamperApplicationView } from './CamperApplication';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../styles/camper-page.scss';


const ApplicationTabs = () => {
    const authContext = useContext(AuthContext);
    const { data: camperProfile } = useCamperProfileQuery(authContext.attributes.sub);
    const { data: rotarianReview } = useRotarianReviewQuery(authContext.attributes.sub);
    const location = useLocation();
    const navigate = useNavigate();

    // Extract the last part of the pathname to determine active tab
    const pathSegments = location.pathname.split('/');
    const activeTab = pathSegments[pathSegments.length - 1] || 'profile';

    type StepState = "incomplete" | "complete" | "in-progress";

    const registrationStatus = useMemo(() => {
        const profileComplete = camperProfile?.profileComplete;
        const applicationComplete = camperProfile?.applicationComplete;
        const documentsComplete = camperProfile?.documentsComplete;
        const rotarianReviewStatus = rotarianReview?.review;

        if (profileComplete && applicationComplete && documentsComplete && rotarianReviewStatus === "APPROVED") {
            return {
                message: "Ready to attend RYLA!",
                color: "primary"
            };
        }
        if (profileComplete && applicationComplete && rotarianReviewStatus === "APPROVED" && !documentsComplete) {
            return {
                message: "Documents incomplete",
                color: "warning"
            };
        }
        if (rotarianReview?.review === "REJECTED") {
            return {
                message: "Application rejected",
                color: "danger"
            };
        }
        if (profileComplete && applicationComplete && (rotarianReviewStatus === "PENDING" || !rotarianReviewStatus)) {
            return {
                message: "Application pending rotarian review",
                color: "warning"
            };
        }
        if (profileComplete && !applicationComplete) {
            return {
                message: "Application incomplete",
                color: "warning"
            };
        }
        return {
            message: "Profile incomplete",
            color: "warning"
        };
    }, [camperProfile, rotarianReview]);

    const getStepState = useCallback((sectionKey: string): StepState => {
        switch (sectionKey) {
            case "profile":
                if (camperProfile && !camperProfile.profileComplete) {
                    return "in-progress";
                } else if (camperProfile && camperProfile.profileComplete) {
                    return "complete";
                }
                return "incomplete";
            case "application":
                if (camperProfile?.applicationComplete) {
                    return "complete";
                } else if (camperProfile?.profileComplete) {
                    return "in-progress";
                }
                return "incomplete";
            case "rotary-club-review":
                if (rotarianReview?.review === "APPROVED") {
                    return "complete";
                } else if (camperProfile?.applicationComplete) {
                    return "in-progress";
                }
                return "incomplete";
            case "important-documents":
                if (rotarianReview?.review === "APPROVED") {
                    return "complete";
                }
                return "incomplete";
            default:
                return "incomplete";
        }
    }, [camperProfile, rotarianReview]);

    const getStatusIcon = useCallback((stepState: StepState) => {
        switch (stepState) {
            case "complete":
                return <FontAwesomeIcon icon={faCheck} className="text-success" />;
            case "in-progress":
                return <FontAwesomeIcon icon={faEllipsis} className="text-warning" />;
            case "incomplete":
                return <FontAwesomeIcon icon={faCircle} className="text-muted" />;
        }
    }, []);

    const isTabDisabled = useCallback((sectionKey: string): boolean => {
        switch (sectionKey) {
            case "profile":
                return false; // Always accessible
            case "application":
                return !camperProfile?.profileComplete;
            case "rotary-club-review":
                return !camperProfile?.applicationComplete;
            case "important-documents":
                return rotarianReview?.review !== "APPROVED";
            default:
                return true;
        }
    }, [camperProfile, rotarianReview]);

    const handleTabSelect = useCallback((key: string | null) => {
        if (key && !isTabDisabled(key)) {
            navigate(`/camper/${key}`);
        }
    }, [navigate, isTabDisabled]);

    return (
        <div>
            <strong>Registration Status: <Badge bg={registrationStatus.color}>{registrationStatus.message}</Badge></strong>
            <Tabs
                activeKey={activeTab}
                onSelect={handleTabSelect}
                className="mt-3"
            >
                <Tab
                    eventKey="profile"
                    title={
                        <span>
                            {getStatusIcon(getStepState("profile"))}
                            <span className="ms-2 text-primary">Profile</span>
                        </span>
                    }
                    disabled={isTabDisabled("profile")}

                />
                <Tab
                    eventKey="application"
                    title={
                        <span>
                            {getStatusIcon(getStepState("application"))}
                            <span className="ms-2">Application Materials</span>
                        </span>
                    }
                    disabled={isTabDisabled("application")}
                />
                <Tab
                    eventKey="rotary-club-review"
                    title={
                        <span>
                            {getStatusIcon(getStepState("rotary-club-review"))}
                            <span className="ms-2">Rotary Club Review</span>
                        </span>
                    }
                    disabled={isTabDisabled("rotary-club-review")}
                />
                <Tab
                    eventKey="important-documents"
                    title={
                        <span>
                            {getStatusIcon(getStepState("important-documents"))}
                            <span className="ms-2">Important Documents</span>
                        </span>
                    }
                    disabled={isTabDisabled("important-documents")}
                />
            </Tabs>
        </div>
    );
};



export const CamperPage: React.FC = () => {

    const authContext = useContext(AuthContext);

    const { data: camperProfile, isLoading, isSuccess } = useCamperProfileQuery(authContext.attributes.sub);

    const {
        data: rotarianReview
    } = useRotarianReviewQuery(authContext.attributes.sub);

    const IndexRoute = () => {
        if (isLoading) {
            return (
                <Placeholder animation="glow">
                    Fetching profile... <br />
                    <Placeholder xs={7} /> {' '}
                    <Placeholder xs={4} /> {' '}
                    <Placeholder xs={4} /> {' '}
                    <Placeholder xs={6} /> {' '}
                    <Placeholder xs={8} /> {' '}
                </Placeholder>
            )
        }

        else if (isSuccess) {
            return <Navigate to="/camper/profile" replace />
        }
        else {
            return <h3>Error loading camper profile. Please try again later.</h3>
        }
    }

    return (
        <div id="camper-page">
            <h3>Camper Portal</h3>
            <p>Welcome to the camper portal. Here you can manage your application and view program information.</p>

            <Alert variant="success">
                <h3>RYLA is currently accepting applications for 2025!</h3>
                <p>RYLA 2025 will take place from June 22nd to June 25th, 2025 at Camp Hinds in Raymond, ME.
                    <br />
                    <strong>Applications are due by January 10th, 2025.</strong>
                </p>
                <ul>
                    <li>This application does not indicate acceptance into the program.</li>
                    <li>You will be notified by email if you are accepted.</li>
                    <li>This application is the vital information that is needed for your Rotary Club to accept and grant your scholarship to attend RYLA 2025.</li>
                </ul>

            </Alert>

            <ApplicationTabs />
            <div id="camper-content">
                <Routes>
                    <Route path="*" element={<IndexRoute />} />
                    {
                        isSuccess && (
                            <>
                                <Route path="/profile" element={<CamperProfile />} />
                                <Route path="/application" element={
                                    <ProtectedRoute
                                        hasAccess={camperProfile?.profileComplete}
                                        fallbackPath="/camper/profile"
                                    >
                                        <CamperApplicationView />
                                    </ProtectedRoute>
                                } />
                                <Route path="/rotary-club-review" element={
                                    <ProtectedRoute
                                        hasAccess={camperProfile?.applicationComplete}
                                        fallbackPath="/camper/application"
                                    >
                                        <CamperRotaryClubReview />
                                    </ProtectedRoute>
                                } />
                                <Route path="/important-documents" element={
                                    <ProtectedRoute
                                        hasAccess={rotarianReview?.review === "APPROVED"}
                                        fallbackPath="/camper/rotary-club-review"
                                    >
                                        <CamperImportantDocuments />
                                    </ProtectedRoute>
                                } />
                            </>
                        )
                    }

                </Routes>
            </div>
        </div>
    );
}; 