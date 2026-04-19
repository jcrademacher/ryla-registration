import { useParams } from "react-router";
import {
    useCamperProfileQuery,
    useRotarianReviewQuery, useGetUserEmailQuery, useUrlToDocumentQuery, useRotaryClubQuery, useDocumentTemplatesByCampQuery,
    useCamperDocumentQuery,
    useRecommendationsQuery,
    useDocumentStatusQuery
} from "../queries/queries";
import { formatPhoneNumber, getCamperAddress, getCamperBirthdate, getCamperName, getFilepathFilename } from "../utils/fields";
import { Table, OverlayTrigger, Tooltip, Container } from "react-bootstrap";
import { ThinSpacer } from "../components/ThinSpacer";
import { PlaceholderElement } from "../components/PlaceholderElement";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { DocumentTemplateSchemaType } from "../api/apiDocuments";

const FileDisplay = ({ camperUserSub, template }: { camperUserSub?: string | null, template: DocumentTemplateSchemaType }) => {
    const { data: thisDocument, isPending: isPendingThisDocument } = useCamperDocumentQuery(camperUserSub, template.id);
    const { data: url } = useUrlToDocumentQuery(thisDocument?.filepath);

    const filename = useMemo(() => thisDocument?.filepath?.split("/").pop(), [thisDocument?.filepath]);

    let mailedDisplayStatus;
    let fileStatus;

    if (thisDocument?.received && thisDocument?.approved) {
        fileStatus = (
            <OverlayTrigger
                placement="left"
                overlay={<Tooltip id="tooltip-received-approved">Received and Approved</Tooltip>}
            >
                <FontAwesomeIcon icon={faCheck} className="text-success me-1" />
            </OverlayTrigger>
        );
        mailedDisplayStatus = <div className="text-success"><FontAwesomeIcon icon={faCheck} className="me-1" />Received & Approved</div>;
    }
    else if (thisDocument?.received && !thisDocument?.approved) {
        fileStatus = (
            <OverlayTrigger
                placement="left"
                overlay={<Tooltip id="tooltip-received-not-approved">Received but Not Approved</Tooltip>}
            >
                <FontAwesomeIcon icon={faCircleExclamation} className="text-warning me-1" />
            </OverlayTrigger>
        );
        mailedDisplayStatus = <div className="text-warning"><FontAwesomeIcon icon={faCircleExclamation} className="me-1" />Received & Not Approved</div>;
    }
    else {
        fileStatus = (
            <OverlayTrigger
                placement="left"
                overlay={<Tooltip id="tooltip-not-received">Not Received</Tooltip>}
            >
                <FontAwesomeIcon icon={faXmark} className="text-danger me-1" />
            </OverlayTrigger>
        );
        mailedDisplayStatus = <div className="text-danger"><FontAwesomeIcon icon={faXmark} className="me-1" />Missing</div>;
    }

    return (
        <tr>
            <td><b>{template.name}{template.required ? " (Required)" : ""}:</b></td>
            <td>
                <PlaceholderElement props={{ xs: 7 }} isLoading={isPendingThisDocument}>
                    {filename ?
                        (<>{fileStatus}<a target="_blank" href={url}>{filename}</a></>)
                        :
                        (template.type === "mail" ?
                            mailedDisplayStatus
                            :
                            <div className="text-danger">{fileStatus}Missing</div>)}
                </PlaceholderElement>
            </td>
        </tr>
    )
}

const RecommendationDisplay = ({ filepath }: { filepath?: string | null }) => {
    const { data: url } = useUrlToDocumentQuery(filepath);
    const filename = useMemo(() => getFilepathFilename(filepath), [filepath]);

    if (!filename) {
        return <div className="text-danger"><FontAwesomeIcon icon={faXmark} className="me-1" />Missing</div>;
    }

    return <div><a target="_blank" href={url}>{filename}</a></div>;
}

export function ViewCamperPage() {
    const { camperSub } = useParams();

    const { data: camperProfile, isPending: isPendingCamperProfile } = useCamperProfileQuery(camperSub);
    const { data: rotarianReview } = useRotarianReviewQuery(camperSub);
    const { data: userEmail, isPending: isUserEmailPending } = useGetUserEmailQuery(camperSub);
    const { data: documentsComplete } = useDocumentStatusQuery(camperSub, camperProfile?.campId);
    const { data: rotaryClub, isPending: isRotaryClubPending } = useRotaryClubQuery(camperProfile?.rotaryClubId);

    const { data: documentTemplates } = useDocumentTemplatesByCampQuery(camperProfile?.campId);

    const {
        data: urlToCamperApplication
    } = useUrlToDocumentQuery(camperProfile?.applicationFilepath);
    // console.log(Object.keys(camperProfile ?? {}));


    const appFilename = useMemo(() => getFilepathFilename(camperProfile?.applicationFilepath), [camperProfile?.applicationFilepath]);

    const { data: recs, isPending: isPendingRec } = useRecommendationsQuery(camperSub);

    if(isPendingCamperProfile) {
        return (
            <Container>
                <PlaceholderElement props={{ xs: 4, as: "h3" }} isLoading={true}>
                    <h3></h3>
                </PlaceholderElement>
                <ThinSpacer />
                <PlaceholderElement props={{ xs: 8 }} isLoading={true}>
                    <span></span>
                </PlaceholderElement>
                <br />
                <PlaceholderElement props={{ xs: 6 }} isLoading={true}>
                    <span></span>
                </PlaceholderElement>
                <PlaceholderElement props={{ xs: 8 }} isLoading={true}>
                    <span></span>
                </PlaceholderElement>
                <br />
                <PlaceholderElement props={{ xs: 6 }} isLoading={true}>
                    <span></span>
                </PlaceholderElement>
                <br /><br />
                <PlaceholderElement props={{ xs: 8 }} isLoading={true}>
                    <span></span>
                </PlaceholderElement>
                <br />
                <PlaceholderElement props={{ xs: 6 }} isLoading={true}>
                    <span></span>
                </PlaceholderElement>
            </Container>
        );
    }

    return (
        <Container>
            <div className="d-flex align-items-center justify-content-between">
                <h3>
                    {getCamperName(camperProfile)} {camperProfile?.highSchool ? `(${camperProfile?.highSchool})` : ''}
                </h3>
                
                {/* <Button variant="light" size="sm" onClick={() => { 
                    if(!camperSub) {
                        emitToast('Camper Sub is required. Check auth flow', ToastType.Error);
                        return;
                    }
                    generateCamperPdf(camperSub);
                }}>
                    <FontAwesomeIcon
                        size="sm"
                        className="me-2"
                        icon={faDownload}
                    />
                    Download Package
                </Button> */}
            </div>

            <span style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                {camperProfile?.profileComplete ? (
                    <span className="badge bg-success">Profile Complete</span>
                ) : (
                    <span className="badge bg-warning text-dark">Profile Incomplete</span>
                )}
                {camperProfile?.applicationComplete ? (
                    <span className="badge bg-success">Application Complete</span>
                ) : (
                    <span className="badge bg-warning text-dark">Application Incomplete</span>
                )}
                {rotarianReview?.review === "APPROVED" ? (
                    <span className="badge bg-success">Rotarian Approved</span>
                ) : rotarianReview?.review === "REJECTED" ? (
                    <span className="badge bg-danger">Rotarian Rejected</span>
                ) : (
                    <span className="badge bg-warning text-dark">Rotarian Review Incomplete</span>
                )}
                {documentsComplete ? (
                    <span className="badge bg-success">Documents Complete</span>
                ) : (
                    <span className="badge bg-warning text-dark">Documents Incomplete</span>
                )}
            </span>

            <Table className="camper-information-table">
                <tbody>
                    <tr><td colSpan={2}>
                        <h5>Application Files</h5>
                        {/* <small className="text-muted">
                            Club requires {rotaryClub?.requiresApplication ? "an application essay" : "no application essay"},&nbsp; 
                            {((rotaryClub?.numRequiredLetters ?? 0) > 0) ? (rotaryClub?.numRequiredLetters ?? 0) + " letters of recommendation" : "no letters of recommendation"},
                            and {rotaryClub?.requiresInterview ? "an interview" : "no interview"}.
                        </small> */}
                        <ThinSpacer />
                    </td></tr>
                    <tr>
                        <td><b>Application ({rotaryClub?.requiresApplication ? "Required" : "Optional"}):</b></td>
                        <td>
                            <PlaceholderElement props={{ xs: 7 }} isLoading={isPendingCamperProfile}>
                                {appFilename ?
                                    <a target="_blank" href={urlToCamperApplication}>{appFilename}</a>
                                    :
                                    <div className="text-danger"><FontAwesomeIcon icon={faXmark} className="me-1" />Missing</div>}
                            </PlaceholderElement>
                        </td>
                    </tr>
                    {isPendingRec ? (
                        <tr>
                            <td><b>Letters of Recommendation ({(rotaryClub?.numRequiredLetters ?? 0) > 0 ? "Required" : "Optional"}):</b></td>
                            <td>
                                <PlaceholderElement props={{ xs: 7 }} isLoading={true}>
                                    <div></div>
                                </PlaceholderElement>
                            </td>
                        </tr>
                    ) : recs && recs.length > 0 ? (
                        recs.map((rec, index) => {
                            const letterNumber = index + 1;
                            const isRequired = letterNumber <= (rotaryClub?.numRequiredLetters ?? 0);
                            return (
                                <tr key={rec.id || index}>
                                    <td><b>Letter {letterNumber} ({isRequired ? "Required" : "Optional"}):</b></td>
                                    <td>
                                        <RecommendationDisplay filepath={rec.filepath} />
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td><b>Letters of Recommendation ({(rotaryClub?.numRequiredLetters ?? 0) > 0 ? "Required" : "Optional"}):</b></td>
                            <td>
                                <div className="text-danger"><FontAwesomeIcon icon={faXmark} className="me-1" />Missing</div>
                            </td>
                        </tr>
                    )}

                    <tr><td colSpan={2}>
                        <br/>
                        <h5>Documents</h5>
                        <ThinSpacer />
                    </td></tr>

                    {documentTemplates?.filter(template => template.type !== "viewonly").map(template => (
                        <FileDisplay
                            key={template.id}
                            camperUserSub={camperSub}
                            template={template}
                        />
                    ))}


                    {/* <FileDisplay
                        title="Letter of Recommendation" 
                        filename={camperProfile?.letterOfRecommendationFilepath?.split("/").pop()} 
                        url={urlToLetterOfRecommendation} 
                        isPending={isCamperProfilePending} 
                    /> */}


                    <tr><td colSpan={2}>
                        <br/>
                        <h5>Camper Information</h5>
                        <ThinSpacer />
                    </td></tr>

                    <tr>
                        <td><b>First Name:</b></td>
                        <td>{camperProfile?.firstName}</td>
                    </tr>
                    <tr>
                        <td><b>Middle Initial:</b></td>
                        <td>{camperProfile?.middleInitial}</td>
                    </tr>
                    <tr>
                        <td><b>Last Name:</b></td>
                        <td>{camperProfile?.lastName}</td>
                    </tr>
                    <tr>
                        <td><b>Nickname:</b></td>
                        <td>{camperProfile?.nickname}</td>
                    </tr>
                    <tr>
                        <td><b>Email:</b></td>
                        <td>
                            <PlaceholderElement props={{ xs: 7 }} isLoading={isUserEmailPending}>
                                <a href={`mailto:${userEmail}`}>{userEmail}</a>
                            </PlaceholderElement>
                        </td>
                    </tr>
                    <tr>
                        <td><b>Gender:</b></td>
                        <td>{camperProfile?.gender}</td>
                    </tr>
                    <tr>
                        <td><b>Birthdate:</b></td>
                        <td>{getCamperBirthdate(camperProfile)}</td>
                    </tr>
                    <tr>
                        <td><b>High School:</b></td>
                        <td>{camperProfile?.highSchool}</td>
                    </tr>
                    <tr>
                        <td><b>Phone:</b></td>
                        <td>{formatPhoneNumber(camperProfile?.phone)}</td>
                    </tr>
                    <tr>
                        <td><b>Address:</b></td>
                        <td>{getCamperAddress(camperProfile)}</td>
                    </tr>
                    <tr>
                        <td><b>Sponsoring Rotary Club:</b></td>
                        <td>
                            <PlaceholderElement props={{ xs: 7 }} isLoading={isRotaryClubPending}>
                                {rotaryClub?.name}
                            </PlaceholderElement>
                        </td>
                    </tr>

                    <tr>
                        <td><b>Parent/Guardian 1:</b></td>
                        <td>{camperProfile?.parent1FirstName} {camperProfile?.parent1LastName}</td>
                    </tr>
                    <tr>
                        <td><b>Parent/Guardian 1 Email:</b></td>
                        <td><a href={`mailto:${camperProfile?.parent1Email}`}>{camperProfile?.parent1Email}</a></td>
                    </tr>
                    <tr>
                        <td><b>Parent/Guardian 1 Phone:</b></td>
                        <td>{formatPhoneNumber(camperProfile?.parent1Phone)}</td>
                    </tr>
                    <tr>
                        <td><b>Parent/Guardian 2:</b></td>
                        <td>{camperProfile?.parent2FirstName} {camperProfile?.parent2LastName}</td>
                    </tr>
                    <tr>
                        <td><b>Parent/Guardian 2 Email:</b></td>
                        <td><a href={`mailto:${camperProfile?.parent2Email}`}>{camperProfile?.parent2Email}</a></td>
                    </tr>
                    <tr>
                        <td><b>Parent/Guardian 2 Phone:</b></td>
                        <td>{formatPhoneNumber(camperProfile?.parent2Phone)}</td>
                    </tr>
                    <tr>
                        <td><b>Emergency Contact:</b></td>
                        <td>{camperProfile?.emergencyContactName}</td>
                    </tr>
                    <tr>
                        <td><b>Emergency Contact Phone:</b></td>
                        <td>{formatPhoneNumber(camperProfile?.emergencyContactPhone)}</td>
                    </tr>
                    <tr>
                        <td><b>Emergency Contact Relationship:</b></td>
                        <td>{camperProfile?.emergencyContactRelationship}</td>
                    </tr>

                    <tr>
                        <td><b>Guidance Counselor Name:</b></td>
                        <td>{camperProfile?.guidanceCounselorName}</td>
                    </tr>
                    <tr>
                        <td><b>Guidance Counselor Email:</b></td>
                        <td><a href={`mailto:${camperProfile?.guidanceCounselorEmail}`}>{camperProfile?.guidanceCounselorEmail}</a></td>
                    </tr>
                    <tr>
                        <td><b>Guidance Counselor Phone:</b></td>
                        <td>{formatPhoneNumber(camperProfile?.guidanceCounselorPhone)}</td>
                    </tr>
                    <tr>
                        <td><b>Dietary Restrictions:</b></td>
                        <td>{camperProfile?.dietaryRestrictions}</td>
                    </tr>
                    <tr>
                        <td><b>Dietary Restrictions Notes:</b></td>
                        <td>{camperProfile?.dietaryRestrictionsNotes}</td>
                    </tr>


                </tbody>
            </Table>
        </Container>
    )
}