import React, { useCallback, useContext, useMemo } from 'react';
import { Alert, Badge, Placeholder, Tab, Tabs } from 'react-bootstrap';
import { AuthContext } from '../../App';
import {
    faCircle,
    faCheck,
    faEllipsis,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router';
import { useCamperProfileQuery, useCamperYearQuery, useDocumentStatusQuery, useRotarianReviewQuery } from '../../queries/queries';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { CamperProfile } from './CamperProfile';
import { CamperRotaryClubReview } from './CamperRotaryClubReview';
import { CamperImportantDocuments } from './CamperDocuments';
import { CamperApplicationView } from './CamperApplication';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../styles/camper-page.scss';
import { createFromISO, formatDateFullWithTime } from '../../utils/datetime';
import { getCampApplicationStatus } from '../../utils/camp';
import { NotAcceptingApplications, PreDeadline, PastDeadlineCamper } from '../../components/alerts';


const ApplicationTabs = () => {
    const authContext = useContext(AuthContext);
    const { data: rotarianReview } = useRotarianReviewQuery(authContext.attributes.sub);
    const location = useLocation();
    const navigate = useNavigate();

    const { data: camperProfile } = useCamperProfileQuery(authContext.attributes.sub);
    const { data: documentsComplete } = useDocumentStatusQuery(camperProfile?.campId, authContext.attributes.sub);


    // Extract the last part of the pathname to determine active tab
    const pathSegments = location.pathname.split('/');
    const activeTab = pathSegments[pathSegments.length - 1] || 'profile';

    type StepState = "incomplete" | "complete" | "in-progress" | "rejected";

    const registrationStatus = useMemo(() => {
        const profileComplete = camperProfile?.profileComplete;
        const applicationComplete = camperProfile?.applicationComplete;
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

    const getStepState = (sectionKey: string) => {
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
                if (rotarianReview?.review === "APPROVED" && documentsComplete) {
                    return "complete";
                }
                else if (rotarianReview?.review === "APPROVED") {
                    return "in-progress";
                }
                return "incomplete"
            default:
                return "incomplete";
        }
    };

    const getStatusIcon = (stepState: StepState) => {
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
    };

    const isTabDisabled = (sectionKey: string) => {
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
    };

    const handleTabSelect = useCallback((key: string | null) => {
        if (key && !isTabDisabled(key)) {
            navigate(`/camper/${key}`);
        }
    }, [navigate, isTabDisabled]);

    return (
        <div>
            <strong>Registration Status: <Badge bg={registrationStatus.color} className={registrationStatus.color === "light" ? "text-dark" : ""}>{registrationStatus.message}</Badge></strong>
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

// camper year cases:
// either camperProfile exists or it does not
// IF PROFILE DOES EXIST: 
// --- easy case, simply get the camper year given the campId
// IF PROFILE DOES NOT EXIST:
// 1. Find camp with the nearest start date in the future
// 2. create profile with this camp id

// application window status rules:
// case 1: Applications are not open yet (should indicate that platform is not accepting applications)
// case 2: Applications are open but the deadline has not yet passed (accepting!)
// case 3: Deadline has passed but camp has not ended yet (warning students, but should still allow acceptance)
// -- indicate in admin table that camper submitted late
// case 4: Camp has ended (no longer accepting applications)


export const CamperPage: React.FC = () => {

    const {
        isLoading,
        isSuccess
    } = useCamperYearQuery();

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
    else if(isSuccess) {
        Content = (
            <>
                <CampInformation/>
            </>
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

function CamperProfileView() {
    const authContext = useContext(AuthContext);
    // const navigate = useNavigate();

    const { data: camperProfile } = useCamperProfileQuery(authContext.attributes.sub);

    const {
        data: rotarianReview,
        isPending: isPendingRotarianReview
    } = useRotarianReviewQuery();

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



function CampInformation() {

    const {
        data: camperYear
    } = useCamperYearQuery();

    const applicationStatus = useMemo(() => getCampApplicationStatus(camperYear), [camperYear]);

    if (applicationStatus === "not-accepting") {
        return <NotAcceptingApplications />;
    }

    const startDate = useMemo(() => createFromISO(camperYear?.startDate ?? ""), [camperYear?.startDate]);
    const endDate = useMemo(() => createFromISO(camperYear?.endDate ?? ""), [camperYear?.endDate]);
    const applicationDeadline = useMemo(() => createFromISO(camperYear?.applicationDeadline ?? ""), [camperYear?.applicationDeadline]);
    
    let DeadlineStatus;

    if (applicationStatus === "accepting") {
        DeadlineStatus = PreDeadline;
    }
    else {
        DeadlineStatus = PastDeadlineCamper;
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


            <DeadlineStatus/>
            <CamperProfileView/>
        </div>
    )
}