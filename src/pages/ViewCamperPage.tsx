import { useParams } from "react-router";
import {
    useCamperProfileQuery,
    useRotarianReviewQuery, useGetUserEmailQuery, useUrlToDocumentQuery, useCamperStatusQuery, useRotaryClubQuery, useDocumentTemplatesByCampQuery,
    useCamperDocumentQuery
} from "../queries/queries";
import { formatPhoneNumber, getCamperAddress, getCamperBirthdate, getCamperName } from "../utils/fields";
import { Table } from "react-bootstrap";
import { ThinSpacer } from "../components/ThinSpacer";
import { PlaceholderElement } from "../components/PlaceholderElement";
import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import { DocumentTemplateSchemaType } from "../api/apiDocuments";

const FileDisplay = ({ camperUserSub, template }: { camperUserSub?: string | null, template: DocumentTemplateSchemaType }) => {
    const { data: thisDocument, isPending: isPendingThisDocument } = useCamperDocumentQuery(camperUserSub, template.id);
    const { data: url } = useUrlToDocumentQuery(thisDocument?.filepath);

    const filename = useMemo(() => thisDocument?.filepath?.split("/").pop(), [thisDocument?.filepath]);

    return (
        <tr>
            <td><b>{template.name}{template.required ? " (Required)" : ""}:</b></td>
            <td>
                <PlaceholderElement props={{ xs: 7 }} isLoading={isPendingThisDocument}>
                    {filename ?
                        <a target="_blank" href={url}>{filename}</a>
                        :
                        (template.type === "mail" && thisDocument?.received ? 
                            <div className="text-success"><FontAwesomeIcon icon={faCheck} className="me-1" />Received</div> 
                            : 
                            <div className="text-danger"><FontAwesomeIcon icon={faXmark} className="me-1" />Missing</div>)}
                </PlaceholderElement>
            </td>
        </tr>
    )
}

export function ViewCamperPage() {
    const { camperSub } = useParams();

    const { data: camperProfile, isPending: isPendingCamperProfile } = useCamperProfileQuery(camperSub);
    const { data: rotarianReview } = useRotarianReviewQuery(camperSub);
    const { data: userEmail, isPending: isUserEmailPending } = useGetUserEmailQuery(camperSub);
    const { data: camperStatus } = useCamperStatusQuery(camperSub);
    const { data: rotaryClub, isPending: isRotaryClubPending } = useRotaryClubQuery(camperProfile?.rotaryClubId);

    const { data: documentTemplates } = useDocumentTemplatesByCampQuery(camperProfile?.campId);

    const documentsComplete = camperStatus?.documentsComplete;

    const {
        data: urlToCamperApplication
    } = useUrlToDocumentQuery(camperProfile?.applicationFilepath);
    // console.log(Object.keys(camperProfile ?? {}));

    const appFilename = useMemo(() => camperProfile?.applicationFilepath?.split("/").pop(), [camperProfile?.applicationFilepath]);

    return (
        <div>
            <h3>Camper Information</h3>
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

                    {documentTemplates?.map(template => (
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


                    <tr><td colSpan={2}><ThinSpacer /></td></tr>

                    <tr>
                        <td><b>Name:</b></td>
                        <td>{getCamperName(camperProfile)}</td>
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

                    <tr><td colSpan={2}><ThinSpacer /></td></tr>

                    <tr>
                        <td><b>Parent 1:</b></td>
                        <td>{camperProfile?.parent1FirstName} {camperProfile?.parent1LastName}</td>
                    </tr>
                    <tr>
                        <td><b>Parent 1 Email:</b></td>
                        <td><a href={`mailto:${camperProfile?.parent1Email}`}>{camperProfile?.parent1Email}</a></td>
                    </tr>
                    <tr>
                        <td><b>Parent 1 Phone:</b></td>
                        <td>{formatPhoneNumber(camperProfile?.parent1Phone)}</td>
                    </tr>
                    <tr>
                        <td><b>Parent 2:</b></td>
                        <td>{camperProfile?.parent2FirstName} {camperProfile?.parent2LastName}</td>
                    </tr>
                    <tr>
                        <td><b>Parent 2 Email:</b></td>
                        <td><a href={`mailto:${camperProfile?.parent2Email}`}>{camperProfile?.parent2Email}</a></td>
                    </tr>
                    <tr>
                        <td><b>Parent 2 Phone:</b></td>
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

                    <tr><td colSpan={2}><ThinSpacer /></td></tr>

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
        </div>
    )
}