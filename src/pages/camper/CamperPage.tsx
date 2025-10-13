import React, { useCallback, useContext, useMemo } from 'react';
import { Alert, Badge, Placeholder, Tab, Tabs } from 'react-bootstrap';
import { AuthContext } from '../../App';
import {
    faCircle,
    faCheck,
    faEllipsis,
    faTimes,
    faCircleInfo,
} from '@fortawesome/free-solid-svg-icons';
import { Navigate, Route, Routes, useNavigate, useLocation, Link } from 'react-router';
import { useCamperProfileQuery, useCamperYearQuery, useRotarianReviewQuery } from '../../queries/queries';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { CamperProfile } from './CamperProfile';
import { CamperRotaryClubReview } from './CamperRotaryClubReview';
import { CamperImportantDocuments } from './CamperDocuments';
import { CamperApplicationView } from './CamperApplication';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../styles/camper-page.scss';
import { CampSchemaType } from '../../api/apiCamp';
import { createFromISO, formatDateFullWithTime } from '../../utils/datetime';
import { CamperProfileSchemaType } from '../../api/apiCamperProfile';


const ApplicationTabs = () => {
    const authContext = useContext(AuthContext);
    const { data: camperProfile } = useCamperProfileQuery(authContext.attributes.sub);
    const { data: rotarianReview } = useRotarianReviewQuery(authContext.attributes.sub);
    const location = useLocation();
    const navigate = useNavigate();

    // Extract the last part of the pathname to determine active tab
    const pathSegments = location.pathname.split('/');
    const activeTab = pathSegments[pathSegments.length - 1] || 'profile';

    type StepState = "incomplete" | "complete" | "in-progress" | "rejected";

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
        if (profileComplete && applicationComplete && (!rotarianReviewStatus)) {
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
                }
                else if (rotarianReview?.review === "REJECTED") {
                    return "rejected";
                }
                else if (camperProfile?.applicationComplete) {
                    return "in-progress";
                }
                return "incomplete";
            case "important-documents":
                if (rotarianReview?.review === "APPROVED" && camperProfile?.documentsComplete) {
                    return "complete";
                }
                else if (rotarianReview?.review === "APPROVED") {
                    return "in-progress";
                }
                return "incomplete"
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
            case "rejected":
                return <FontAwesomeIcon icon={faTimes} className="text-danger" />;
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

    const {
        data: camperProfile,
        isLoading: isLoadingCamperProfile,
        isSuccess: isSuccessCamperProfile
    } = useCamperProfileQuery(authContext.attributes.sub);

    const {
        data: camperYear,
        isLoading: isLoadingCamperYear,
        isSuccess: isSuccessCamperYear
    } = useCamperYearQuery(camperProfile ?? null);

    const isLoading = useMemo(() => isLoadingCamperProfile || isLoadingCamperYear, [isLoadingCamperProfile, isLoadingCamperYear]);
    const isSuccess = useMemo(() => isSuccessCamperProfile && isSuccessCamperYear, [isSuccessCamperProfile, isSuccessCamperYear]);

    let Content;

    if (isLoading) {
        Content = (
            <Placeholder animation="glow">
                Loading information... <br />
                <Placeholder xs={7} /> {' '}
                <Placeholder xs={4} /> {' '}
                <Placeholder xs={4} /> {' '}
                <Placeholder xs={6} /> {' '}
                <Placeholder xs={8} /> {' '}
            </Placeholder>
        )
    }
    else if (isSuccess && camperYear) {
        Content = (
            <>
                <CampInformation camperYear={camperYear} />
                <CamperProfileView camperYear={camperYear} camperProfile={camperProfile ?? null} />
            </>
        )
    }
    else if (isSuccess && !camperYear) {
        Content = (
            <CampInformation camperYear={null} />
        )
    }
    else {
        Content = (
            <Alert variant="danger">
                <h5>Could not fetch camp or profile information</h5>
                <p>Please try again later.</p>
            </Alert>
        )
    }

    return (
        <div className="side-pad-10">
            <h3>Camper Portal</h3>
            <p>Welcome to the camper portal. Here you can manage your application and view program information.</p>

            {Content}
        </div>
    );
};

interface CamperProfileViewProps {
    camperYear: CampSchemaType | null;
    camperProfile: CamperProfileSchemaType | null;
}

function CamperProfileView({ camperProfile }: CamperProfileViewProps) {
    const authContext = useContext(AuthContext);
    // const navigate = useNavigate();

    const {
        data: rotarianReview,
        isPending: isPendingRotarianReview
    } = useRotarianReviewQuery(authContext.attributes.sub);

    // useEffect(() => {
    //     if (camperProfile?.profileComplete && !camperProfile?.applicationComplete && !rotarianReview?.review) {
    //         navigate('/camper/application');
    //     }
    //     else if (camperProfile?.applicationComplete && !rotarianReview?.review) {
    //         navigate('/camper/rotary-club-review');
    //     }
    //     else if (rotarianReview?.review === "APPROVED") {
    //         navigate('/camper/important-documents');
    //     }
    // }, [camperProfile, rotarianReview]);

    return (
        <div>
            <ApplicationTabs />
            <div id="camper-content">
                <Routes>
                    <Route path="*" element={<Navigate to="/camper/profile" replace />} />
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
                            hasAccess={isPendingRotarianReview || rotarianReview?.review === "APPROVED"}
                            fallbackPath="/camper/rotary-club-review"
                        >
                            <CamperImportantDocuments />
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </div>

    )
}

function CampInformation({ camperYear }: { camperYear: CampSchemaType | null }) {

    if (!camperYear) {
        return (<div>
            <Alert variant="danger">
                <h4>RYLA is not accepting applications at this time</h4>
                <p>Please check back in the future for updates.</p>
            </Alert>
        </div>);
    }

    const startDate = useMemo(() => createFromISO(camperYear.startDate), [camperYear.startDate]);
    const endDate = useMemo(() => createFromISO(camperYear.endDate), [camperYear.endDate]);
    const applicationDeadline = useMemo(() => createFromISO(camperYear.applicationDeadline), [camperYear.applicationDeadline]);

    let DeadlineStatus;

    if (applicationDeadline.diffNow().toMillis() > 0) {
        DeadlineStatus = (
            <Alert variant="success">
                <FontAwesomeIcon icon={faCircleInfo} /> RYLA is currently accepting applications for {startDate.year}!
            </Alert>
        )
    }
    else {
        DeadlineStatus = (
            <Alert variant="warning">
                <FontAwesomeIcon icon={faCircleInfo} /> The application deadline has passed for {startDate.year}.
                You may no longer modify your profile or application materials.
                If accepted by your rotary club, please proceed to the{' '}
                <Link to="/camper/important-documents">Important Documents</Link> tab to complete the final steps for registration.
            </Alert>
        )
    }

    return (
        <div>
            <p>RYLA {startDate.year} will take place from {formatDateFullWithTime(startDate)} to {formatDateFullWithTime(endDate)} at Camp Hinds in Raymond, ME.
                <br />
                <strong>Applications are due by {formatDateFullWithTime(applicationDeadline)}.</strong>
            </p>
            <ul>
                <li>You must complete the profile and application materials sections below for your application to be considered.</li>
                <li>This application does not indicate acceptance into the program.</li>
                <li>You will be notified by email if you are accepted. The rotary club review tab will also be updated to reflect the status of your application.</li>
                <li>This application is the vital information that is needed for your Rotary Club to accept and grant your scholarship to attend RYLA {startDate.year}.</li>
            </ul>


            {DeadlineStatus}
        </div>
    )
}