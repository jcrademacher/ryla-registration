import { useParams, Link } from "react-router";
import { useState } from "react";
import {
    useCamperProfileQuery,
    useRotarianReviewQuery,
    useGetUserEmailQuery,
    useRotaryClubQuery,
    useDocumentTemplatesByCampQuery,
    useCamperDocumentQuery,
    useRecommendationsQuery,
    useDocumentStatusQuery,
    useListRotariansWithGroupQuery,
} from "../queries/queries";
import { emitToast, ToastType } from "../utils/notifications";
import { useUpdateCamperDocumentStatusMutation, useUploadCamperApplicationMutation, useUploadCamperDocumentMutation, useUploadRecommendationMutation } from "../queries/mutations";
import { isUserAdmin } from "../api/auth";
import {
    formatPhoneNumber,
    getCamperAddress,
    getCamperBirthdate,
    getCamperName,
} from "../utils/fields";
import { useCallback } from "react";
import { TransferProgressEvent } from "aws-amplify/storage";
import {
    OverlayTrigger,
    Tooltip,
    Container,
    Row,
    Col,
    Card,
    Badge,
    Alert,
    Placeholder,
    Form
} from "react-bootstrap";
import { ThinSpacer } from "../components/ThinSpacer";
import { PlaceholderElement } from "../components/PlaceholderElement";
import { useContext, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
    faCheck,
    faCircleExclamation,
    faBuilding,
    faFileAlt,
    faFolderOpen,
    faUser,
    faAddressBook,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { useQueryClient } from "@tanstack/react-query";
import { DocumentTemplateSchemaType } from "../api/apiDocuments";
import "../styles/camper-page.scss";
import { AuthContext } from "../App";
import { CamperProfileSchemaType } from "../api/apiCamperProfile";
import { ConfirmationModal } from "../components/modals";
import { useForm } from "react-hook-form";
import { FileInputGroup } from "../components/forms";

interface InfoRowProps {
    label: string;
    children: React.ReactNode;
}

const InfoRow = ({ label, children }: InfoRowProps) => (
    <div className="view-camper-info-row">
        <div className="view-camper-info-label">{label}</div>
        <div className="view-camper-info-value">{children || <span className="text-muted">—</span>}</div>
    </div>
);

type DocumentModificationAction = 'approve' | 'reject' | 'missing' | 'upload';

const DocumentDisplay = ({
    camper,
    template,
}: {
    camper?: CamperProfileSchemaType | null;
    template: DocumentTemplateSchemaType;
}) => {
    const authContext = useContext(AuthContext);
    const isAdmin = isUserAdmin(authContext?.groups);

    const { mutate: uploadDocument, isPending: isUploading } = useUploadCamperDocumentMutation();

    const { data: thisDocument, isPending: isPendingThisDocument } = useCamperDocumentQuery(
        camper?.userSub,
        template.id
    );

    const queryClient = useQueryClient();

    let mailedDisplayStatus;
    let fileStatus;
    let button1;
    let button2; 

    const [showDocumentModificationModal, setShowDocumentModificationModal] = useState<DocumentModificationAction | null>(null);

    let approveButton = (
        <a href="#" title="Approve Document" onClick={(e) => { e.preventDefault(); setShowDocumentModificationModal('approve'); }}>
            <FontAwesomeIcon icon={faCheck}/>
        </a>
    );

    let rejectButton = (
        <a href="#" title="Mark Problem" onClick={(e) => { e.preventDefault(); setShowDocumentModificationModal('reject'); }}>
            <FontAwesomeIcon icon={faTriangleExclamation}/>
        </a>
    );

    let markAsMissingButton = (
        <a href="#" title="Mark as Missing" onClick={(e) => { e.preventDefault(); setShowDocumentModificationModal('missing'); }}>
            <FontAwesomeIcon icon={faXmark}/>
        </a>
    );

    if (thisDocument?.received && thisDocument?.approved) {
        fileStatus = (
            <OverlayTrigger
                placement="left"
                overlay={<Tooltip id="tooltip-received-approved">Received and Approved</Tooltip>}
            >
                <FontAwesomeIcon icon={faCheck} className="text-success me-1" />
            </OverlayTrigger>
        );
        mailedDisplayStatus = (
            <div className="text-success">
                Received & Approved
            </div>
        );

        if(template.type === "mail") {
            button1 = rejectButton;
            button2 = markAsMissingButton;
        }
        else {
            button1 = rejectButton;
        }

    } else if (thisDocument?.received && !thisDocument?.approved) {
        fileStatus = (
            <OverlayTrigger
                placement="left"
                overlay={<Tooltip id="tooltip-received-not-approved">Received but Not Approved</Tooltip>}
            >
                <FontAwesomeIcon icon={faCircleExclamation} className="text-warning me-1" />
            </OverlayTrigger>
        );
        mailedDisplayStatus = (
            <div className="text-warning">
                Received & Not Approved
            </div>
        );

        if(template.type === "mail") {
            button1 = approveButton;
            button2 = markAsMissingButton;
        }
        else {
            button1 = approveButton;
        }
    } else {
        fileStatus = (
            <OverlayTrigger
                placement="left"
                overlay={<Tooltip id="tooltip-not-received">Not Received</Tooltip>}
            >
                <FontAwesomeIcon icon={faXmark} className="text-danger me-1" />
            </OverlayTrigger>
        );
        mailedDisplayStatus = (
            <div className="text-danger">
                {/* <FontAwesomeIcon icon={faXmark} className="me-1" /> */}
                Missing
            </div>
        );

        if(template.type === "mail") {
            button1 = approveButton;
            button2 = rejectButton;
        }
        else {
            button1 = approveButton;
        }
    }

    const submitHandler = useCallback((file: File, onProgress?: (event: TransferProgressEvent) => void, onSettled?: () => void) => {
        if (!camper) {
            emitToast("No camper selected", ToastType.Error);
            return;
        }

        uploadDocument({
            document: {
                camperUserSub: camper.userSub,
                templateId: template.id,
                received: true,
                approved: true,
            },
            file,
            identityId: camper.identityId,
            onProgress,
        }, {
            onSuccess: () => {
                emitToast(`Document uploaded for ${getCamperName(camper)}`, ToastType.Success);
                queryClient.invalidateQueries({ queryKey: ['camperDataAdmin'] });
                queryClient.invalidateQueries({ queryKey: ['camperDocument', camper.userSub] });
            },
            onSettled: () => {
                onSettled?.();
            },
            onError: (error) => {
                emitToast(`Failed to upload document: ${error.message}`, ToastType.Error);
            }
        });
    }, [camper, template.id]);


    let documentButtons = (
        <>
            {button1}
            {button2}
        </>
    );

    return (
        <InfoRow label={`${template.name}${template.required ? " (Required)" : ""}`}>
            <PlaceholderElement props={{ xs: 7 }} isLoading={isPendingThisDocument}>
                <div className="d-flex align-items-center">
                    {/* <div className="d-flex align-items-center"> */}
                    {fileStatus}
                        {template.type === "mail" ? (
                            <div className='flex-grow-1 d-flex align-items-center justify-content-between'>
                                {mailedDisplayStatus}
                                {isAdmin && <div className='d-flex align-items-center gap-3'>
                                    {documentButtons}
                                </div>}
                            </div>
                        ) : (
                            <>
                                
                                <FileInputGroup
                                    isAdmin={isAdmin}
                                    filepath={thisDocument?.filepath}
                                    submitHandler={submitHandler}
                                    isPending={isUploading}
                                    defaultViewFile={true}
                                >
                                    {documentButtons}
                                </FileInputGroup>
                            </>
                        )}
                    {/* </div> */}
                    
                </div>
            </PlaceholderElement>
            <ConfirmDocumentModificationModal
                camper={camper}
                onClose={() => setShowDocumentModificationModal(null)}
                documentTemplate={template}
                action={showDocumentModificationModal}
            />
        </InfoRow>
    );
};

type RotaryClubLike = {
    name?: string | null;
    requiresApplication?: boolean | null;
    requiresInterview?: boolean | null;
    numRequiredLetters?: number | null;
} | null | undefined;

const SponsoringClubCard = ({
    rotaryClubId,
    rotaryClub,
    isRotaryClubPending,
}: {
    rotaryClubId?: string | null;
    rotaryClub: RotaryClubLike;
    isRotaryClubPending: boolean;
}) => {
    const {
        data: rotarians,
        isPending: isRotariansPending,
        isError: isRotariansError,
    } = useListRotariansWithGroupQuery(rotaryClubId);

    const sortedRotarians = useMemo(() => {
        const list = [...(rotarians ?? [])];
        // Coordinators first, then by last/first name
        list.sort((a, b) => {
            const aIsCoord = a.group === "COORDINATORS" ? 0 : 1;
            const bIsCoord = b.group === "COORDINATORS" ? 0 : 1;
            if (aIsCoord !== bIsCoord) return aIsCoord - bIsCoord;
            const aName = `${a.lastName ?? ""} ${a.firstName ?? ""}`.trim().toLowerCase();
            const bName = `${b.lastName ?? ""} ${b.firstName ?? ""}`.trim().toLowerCase();
            return aName.localeCompare(bName);
        });
        return list;
    }, [rotarians]);

    let rotariansSection;
    if (!rotaryClubId) {
        rotariansSection = null;
    } else if (isRotariansError) {
        rotariansSection = (
            <Alert variant="danger" className="mb-0 py-2 small">
                Could not load club rotarians.
            </Alert>
        );
    } else if (isRotariansPending) {
        rotariansSection = (
            <Placeholder animation="glow">
                <Placeholder xs={8} /> <br />
                <Placeholder xs={6} /> <br />
                <Placeholder xs={7} />
            </Placeholder>
        );
    } else if (sortedRotarians.length === 0) {
        rotariansSection = (
            <div className="text-muted small">No rotarians are assigned to this club.</div>
        );
    } else {
        rotariansSection = (
            <ul className="view-camper-coordinator-list">
                {sortedRotarians.map((r) => {
                    const name = [r.firstName, r.lastName]
                        .filter(Boolean)
                        .join(" ")
                        .trim();
                    const isCoordinator = r.group === "COORDINATORS";
                    return (
                        <li key={r.userSub}>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <span>
                                    {name || <span className="text-muted fw-normal">(Unnamed)</span>}
                                </span>
                                <Badge bg={isCoordinator ? "primary" : "secondary"} className="text-uppercase" style={{ fontSize: "0.65rem" }}>
                                    {isCoordinator ? "Coordinator" : ""}
                                </Badge>
                            </div>
                            <a href={`mailto:${r.email}`} className="small">
                                {r.email}
                            </a>
                        </li>
                    );
                })}
            </ul>
        );
    }

    return (
        <Card className="mb-3">
            <Card.Header className="d-flex align-items-center">
                <FontAwesomeIcon icon={faBuilding} className="me-2 text-secondary" />
                <strong>Sponsoring Club</strong>
            </Card.Header>
            <Card.Body>
                <PlaceholderElement props={{ xs: 8 }} isLoading={isRotaryClubPending}>
                    {rotaryClub ? (
                        <>
                            <div className="h5 mb-2">
                                <Link to={`/admin/rotary-club-details?id=${rotaryClubId}`}>
                                    {rotaryClub.name}
                                </Link>
                            </div>
                        </>
                    ) : (
                        <span className="text-muted">No sponsoring club set.</span>
                    )}
                </PlaceholderElement>

                {rotaryClub && (
                    <>
                        <div className="view-camper-info-row">
                            <div className="view-camper-info-label">Rotarians</div>
                            <div className="view-camper-info-value">{rotariansSection}</div>
                        </div>
                    </>
                )}
            </Card.Body>
        </Card>
    );
};

export function ViewCamperPage() {
    const { camperSub } = useParams();

    const authContext = useContext(AuthContext);
    const isAdmin = isUserAdmin(authContext?.groups);

    const { data: camperProfile, isPending: isPendingCamperProfile } = useCamperProfileQuery(camperSub);
    const { data: rotarianReview } = useRotarianReviewQuery(camperSub);
    const { data: userEmail, isPending: isUserEmailPending } = useGetUserEmailQuery(camperSub);
    const { data: documentsComplete } = useDocumentStatusQuery(camperSub, camperProfile?.campId);
    const { data: rotaryClub, isPending: isRotaryClubPending } = useRotaryClubQuery(camperProfile?.rotaryClubId);

    const { data: documentTemplates, isPending: isPendingDocumentTemplates } = useDocumentTemplatesByCampQuery(camperProfile?.campId);


    const { data: recs, isPending: isPendingRec } = useRecommendationsQuery(camperSub);

    const queryClient = useQueryClient();
    const { mutate: uploadApplication, isPending: isUploadingApplication } = useUploadCamperApplicationMutation();
    const { mutate: uploadRec, isPending: isUploadingRec } = useUploadRecommendationMutation();

    const applicationUploadHandler = useCallback((file: File, onProgress?: (event: TransferProgressEvent) => void, onSettled?: () => void) => {
        uploadApplication({ file, userSub: camperSub, onProgress }, {
            onSuccess: () => {
                emitToast("Application uploaded", ToastType.Success);
                queryClient.invalidateQueries({ queryKey: ['camperProfile', camperSub] });
            },
            onSettled,
            onError: (error) => {
                emitToast(`Failed to upload application: ${error.message}`, ToastType.Error);
            }
        });
    }, [camperSub, uploadApplication, queryClient]);

    const createRecUploadHandler = useCallback((recId: string) => {
        return (file: File, onProgress?: (event: TransferProgressEvent) => void, onSettled?: () => void) => {
            if (!camperSub) {
                emitToast("No camper selected", ToastType.Error);
                return;
            }
            uploadRec({ recId, camperUserSub: camperSub, file, onProgress }, {
                onSuccess: () => {
                    emitToast("Recommendation uploaded", ToastType.Success);
                    queryClient.invalidateQueries({ queryKey: ['recommendations', camperSub] });
                },
                onSettled,
                onError: (error) => {
                    emitToast(`Failed to upload recommendation: ${error.message}`, ToastType.Error);
                }
            });
        };
    }, [camperSub, uploadRec, queryClient]);

    if (isPendingCamperProfile) {
        return (
            <Container className="view-camper-page">
                <PlaceholderElement props={{ xs: 4, as: "h3" }} isLoading={true}>
                    <h3></h3>
                </PlaceholderElement>
                <ThinSpacer />
                <Row>
                    <Col xs={12} lg={7}>
                        <Card className="mb-3">
                            <Card.Body>
                                <Placeholder animation="glow">
                                    <Placeholder xs={6} /> <br />
                                    <Placeholder xs={8} /> <br />
                                    <Placeholder xs={5} />
                                </Placeholder>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} lg={5}>
                        <Card className="mb-3">
                            <Card.Body>
                                <Placeholder animation="glow">
                                    <Placeholder xs={8} /> <br />
                                    <Placeholder xs={6} />
                                </Placeholder>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    const numRequiredLetters = rotaryClub?.numRequiredLetters ?? 0;

    return (
        <Container className="view-camper-page">
            <div>
                <h3 className="mb-0">
                    {getCamperName(camperProfile)}
                </h3>
                <h6 className="text-muted">{camperProfile?.highSchool}</h6>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                {camperProfile?.profileComplete ? (
                    <Badge bg="success">Profile Complete</Badge>
                ) : (
                    <Badge bg="warning" text="dark">Profile Incomplete</Badge>
                )}
                {camperProfile?.applicationComplete ? (
                    <Badge bg="success">Application Complete</Badge>
                ) : (
                    <Badge bg="warning" text="dark">Application Incomplete</Badge>
                )}
                {rotarianReview?.review === "APPROVED" ? (
                    <Badge bg="success">Rotarian Approved</Badge>
                ) : rotarianReview?.review === "REJECTED" ? (
                    <Badge bg="danger">Rotarian Rejected</Badge>
                ) : (
                    <Badge bg="warning" text="dark">Rotarian Review Incomplete</Badge>
                )}
                {documentsComplete ? (
                    <Badge bg="success">Documents Complete</Badge>
                ) : (
                    <Badge bg="warning" text="dark">Documents Incomplete</Badge>
                )}

                {!camperProfile?.active && (
                    <Badge bg="warning" text="dark">Inactive / Hidden</Badge>
                )}
            </div>

            <Row>
                {/* LEFT COLUMN — Camper Information */}
                <Col xs={12} lg={7}>
                    <Card className="mb-3">
                        <Card.Header className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faUser} className="me-2 text-secondary" />
                            <strong>Personal</strong>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col xs={12} sm={6}>
                                    <InfoRow label="First Name">{camperProfile?.firstName}</InfoRow>
                                    <InfoRow label="Middle Initial">{camperProfile?.middleInitial}</InfoRow>
                                    <InfoRow label="Last Name">{camperProfile?.lastName}</InfoRow>
                                    <InfoRow label="Nickname">{camperProfile?.nickname}</InfoRow>
                                    <InfoRow label="Gender">{camperProfile?.gender}</InfoRow>
                                    <InfoRow label="Birthdate">{getCamperBirthdate(camperProfile)}</InfoRow>
                                    <InfoRow label="T-Shirt Size">{camperProfile?.tshirtSize}</InfoRow>
                                </Col>
                                <Col xs={12} sm={6}>
                                    <InfoRow label="Email">
                                        <PlaceholderElement props={{ xs: 7 }} isLoading={isUserEmailPending}>
                                            {userEmail ? <a href={`mailto:${userEmail}`}>{userEmail}</a> : null}
                                        </PlaceholderElement>
                                    </InfoRow>
                                    <InfoRow label="Phone">{formatPhoneNumber(camperProfile?.phone)}</InfoRow>
                                    <InfoRow label="High School">{camperProfile?.highSchool}</InfoRow>
                                    <InfoRow label="Address">{getCamperAddress(camperProfile)}</InfoRow>
                                    <InfoRow label="Dietary Restrictions">{camperProfile?.dietaryRestrictions}</InfoRow>
                                    <InfoRow label="Dietary Notes">{camperProfile?.dietaryRestrictionsNotes}</InfoRow>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="mb-3">
                        <Card.Header className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faAddressBook} className="me-2 text-secondary" />
                            <strong>Contact</strong>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col xs={12} sm={6}>
                                    <div className="fw-semibold mb-1">Parent / Guardian 1</div>
                                    <InfoRow label="Name">
                                        {camperProfile?.parent1FirstName} {camperProfile?.parent1LastName}
                                    </InfoRow>
                                    <InfoRow label="Email">
                                        {camperProfile?.parent1Email ? (
                                            <a href={`mailto:${camperProfile?.parent1Email}`}>
                                                {camperProfile?.parent1Email}
                                            </a>
                                        ) : null}
                                    </InfoRow>
                                    <InfoRow label="Phone">{formatPhoneNumber(camperProfile?.parent1Phone)}</InfoRow>
                                </Col>
                                <Col xs={12} sm={6}>
                                    <div className="fw-semibold mb-1">Parent / Guardian 2</div>
                                    <InfoRow label="Name">
                                        {camperProfile?.parent2FirstName || camperProfile?.parent2LastName ? `${camperProfile?.parent2FirstName} ${camperProfile?.parent2LastName}` : null}
                                    </InfoRow>
                                    <InfoRow label="Email">
                                        {camperProfile?.parent2Email ? (
                                            <a href={`mailto:${camperProfile?.parent2Email}`}>
                                                {camperProfile?.parent2Email}
                                            </a>
                                        ) : null}
                                    </InfoRow>
                                    <InfoRow label="Phone">{formatPhoneNumber(camperProfile?.parent2Phone)}</InfoRow>
                                </Col>
                            </Row>
                            <hr className="my-3" />
                            <Row>
                                <Col xs={12} sm={6}>
                                    <div className="fw-semibold mb-1">Emergency Contact</div>
                                    <InfoRow label="Name">{camperProfile?.emergencyContactName}</InfoRow>
                                    <InfoRow label="Relationship">{camperProfile?.emergencyContactRelationship}</InfoRow>
                                    <InfoRow label="Phone">{formatPhoneNumber(camperProfile?.emergencyContactPhone)}</InfoRow>
                                </Col>
                                <Col xs={12} sm={6}>
                                    <div className="fw-semibold mb-1">Guidance Counselor</div>
                                    <InfoRow label="Name">{camperProfile?.guidanceCounselorName}</InfoRow>
                                    <InfoRow label="Email">
                                        {camperProfile?.guidanceCounselorEmail ? (
                                            <a href={`mailto:${camperProfile?.guidanceCounselorEmail}`}>
                                                {camperProfile?.guidanceCounselorEmail}
                                            </a>
                                        ) : null}
                                    </InfoRow>
                                    <InfoRow label="Phone">
                                        {formatPhoneNumber(camperProfile?.guidanceCounselorPhone)}
                                    </InfoRow>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                </Col>

                {/* RIGHT COLUMN — Club, files */}
                <Col xs={12} lg={5}>
                    <SponsoringClubCard
                        rotaryClubId={camperProfile?.rotaryClubId}
                        rotaryClub={rotaryClub}
                        isRotaryClubPending={isRotaryClubPending}
                    />

                    <Card className="mb-3">
                        <Card.Header className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faFileAlt} className="me-2 text-secondary" />
                            <strong>Application Files</strong>
                        </Card.Header>
                        <Card.Body>
                            <InfoRow label={`Application (${rotaryClub?.requiresApplication ? "Required" : "Optional"})`}>
                                <PlaceholderElement props={{ xs: 7 }} isLoading={isPendingCamperProfile}>
                                    <FileInputGroup
                                        isAdmin={isAdmin}
                                        filepath={camperProfile?.applicationFilepath}
                                        submitHandler={applicationUploadHandler}
                                        isPending={isUploadingApplication}
                                    />
                                </PlaceholderElement>
                            </InfoRow>

                            {isPendingRec ? (
                                <InfoRow label={`Letters of Recommendation (${numRequiredLetters > 0 ? "Required" : "Optional"})`}>
                                    <PlaceholderElement props={{ xs: 7 }} isLoading={true}>
                                        <div></div>
                                    </PlaceholderElement>
                                </InfoRow>
                            ) : recs && recs.length > 0 ? (
                                recs.map((rec, index) => {
                                    const letterNumber = index + 1;
                                    const isRequired = letterNumber <= numRequiredLetters;
                                    return (
                                        <InfoRow
                                            key={rec.id || index}
                                            label={`Letter ${letterNumber} (${isRequired ? "Required" : "Optional"})`}
                                        >
                                            <FileInputGroup
                                                isAdmin={isAdmin}
                                                filepath={rec.filepath}
                                                submitHandler={createRecUploadHandler(rec.id)}
                                                isPending={isUploadingRec}
                                            />
                                        </InfoRow>
                                    );
                                })
                            ) : (
                                <InfoRow label={`Letters of Recommendation (${numRequiredLetters > 0 ? "Required" : "Optional"})`}>
                                    <div className="text-muted fst-italic">
                                        None
                                    </div>
                                </InfoRow>
                            )}
                        </Card.Body>
                    </Card>

                    <Card className="mb-3">
                        <Card.Header className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faFolderOpen} className="me-2 text-secondary" />
                            <strong>Documents</strong>
                        </Card.Header>
                        <Card.Body>
                            {isPendingDocumentTemplates ? (
                                <PlaceholderElement props={{ xs: 7 }} isLoading={true}>
                                    <div></div>
                                </PlaceholderElement>
                            ) : 
                            documentTemplates ? (
                                documentTemplates
                                    .filter((template) => template.type !== "viewonly")
                                    .map((template) => (
                                        <DocumentDisplay
                                            camper={camperProfile}
                                            key={template.id}
                                            template={template}
                                        />
                                    ))
                            ) : (
                                <span className="text-muted">No documents needed for this camp.</span>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

interface ConfirmDocumentReceivedModalProps {
    camper?: CamperProfileSchemaType | null;
    onClose: () => void;
    documentTemplate?: DocumentTemplateSchemaType | null;
    action: DocumentModificationAction | null;
}

function ConfirmDocumentModificationModal({
    camper,
    onClose,
    documentTemplate,
    action,
}: ConfirmDocumentReceivedModalProps) {
    const { mutate: updateCamperDocumentStatus, isPending: isUpdating } = useUpdateCamperDocumentStatusMutation();
   

    const queryClient = useQueryClient();

    const rejectMessageForm = useForm<{ message?: string }>({
        defaultValues: {
            message: ''
        }
    });

    const handleConfirm = () => {
        if (!documentTemplate) {
            console.warn("No document template selected");
            return;
        }

        if(!camper) {
            console.warn("No camper selected");
            return;
        }

        let mutationOptions = {
            onSuccess: () => {
                emitToast(`Document updated`, ToastType.Success);
                queryClient.invalidateQueries({ queryKey: ['camperDocument', camper.userSub, documentTemplate.id] });
                queryClient.invalidateQueries({ queryKey: ['documentStatus', camper.userSub, camper.campId] });
            },
            onSettled: () => {
                onClose();
            }
        };

        switch (action) {
            case 'approve':
                updateCamperDocumentStatus({ camperUserSub: camper.userSub, templateId: documentTemplate.id, action: 'approve' }, mutationOptions);
                break;
            case 'reject':
                updateCamperDocumentStatus({ camperUserSub: camper.userSub, templateId: documentTemplate.id, action: 'reject', message: rejectMessageForm.getValues().message }, mutationOptions);
                break;
            case 'missing':
                updateCamperDocumentStatus({ camperUserSub: camper.userSub, templateId: documentTemplate.id, action: 'missing' }, mutationOptions);
                break;
        }
    };

    return (
        <ConfirmationModal
            show={!!action}
            onClose={onClose}
            title={action === 'approve' ? 'Approve Document' : action === 'reject' ? 'Mark Problem' : 'Mark as Missing'}
            confirmButtonText="Confirm"
            confirmButtonVariant="primary"
            onConfirm={handleConfirm}
            isLoading={isUpdating}
        >
            <p>
                {action === 'approve' ? (
                    `${documentTemplate?.name} will be marked as received and approved for ${camper?.firstName} ${camper?.lastName}. `
                ) : action === 'reject' ? (
                    `${documentTemplate?.name} will be returned to ${camper?.firstName} ${camper?.lastName} for correction. `
                ) : action === 'missing' ? (
                    `${documentTemplate?.name} will be marked as missing for ${camper?.firstName} ${camper?.lastName}. `
                ) : null}
            </p>

            {action === 'reject' ? (
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Message (optional)</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} {...rejectMessageForm.register('message')} 
                            placeholder="Enter a message to email to the camper"
                        />
                    </Form.Group>
                </Form>
            ) : null}

            {action === 'approve' || action === 'reject' ? (
                <p>
                    <strong>Note:</strong> This action will send an email to the student and their parents/guardians.
                </p>
            ) : (
                <p>
                    <strong>Note:</strong> This action will NOT send an email.
                </p>
            )}

            Are you sure you want to do this?
        </ConfirmationModal>
    );
}

// interface UploadDocumentModalProps {
//     camper?: CamperProfileSchemaType | null;
//     onClose: () => void;
//     documentTemplate?: DocumentTemplateSchemaType | null;
//     show: boolean;
// }

// function UploadDocumentModal({
//     camper,
//     onClose,
//     documentTemplate,
//     show
// }: UploadDocumentModalProps) {
//     return (
//         <ConfirmationModal
//             show={show}
//             onClose={onClose}
//             title="Upload Document"
//             confirmButtonText="Done"
//             confirmButtonVariant="primary"
//             isLoading={false}
//         >
//             <FileInputGroup
//                 filepath={camper?.applicationFilepath}
//                 submitHandler={applicationUploadHandler}
//                 isPending={uploadCamperApplicationMutation.isPending}
//             />
//         </ConfirmationModal>
//     );
// }
