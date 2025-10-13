import React, { useContext } from "react";
import { Badge } from "react-bootstrap";
import { useDocumentTemplatesByCampQuery, useCamperYearQuery, useCamperProfileQuery, useUrlToDocumentQuery, useCamperDocumentQuery } from "../../queries/queries";
import { DocumentTemplateSchemaType } from "../../api/apiDocuments";
import { AuthContext } from "../../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThinSpacer } from "../../components/ThinSpacer";
import { FileInputGroup } from "../../components/forms";

import {
    faCheckCircle,
    faXmark
} from "@fortawesome/free-solid-svg-icons";
import { PlaceholderElement } from "../../components/PlaceholderElement";
import { useUploadCamperDocumentMutation } from "../../queries/mutations";
import { CamperProfileSchemaType } from "../../api/apiCamperProfile";
import { emitToast, ToastType } from "../../utils/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { TransferProgressEvent } from "aws-amplify/storage";
// Document Component
interface DocumentComponentProps {
    template: DocumentTemplateSchemaType;
    camperProfile?: CamperProfileSchemaType | null;
}

const DocumentComponent: React.FC<DocumentComponentProps> = ({
    template,
    camperProfile
}) => {
    const { data: url } = useUrlToDocumentQuery(template.filepath ?? "");
    const { data: thisDocument, isPending: isPendingThisDocument } = useCamperDocumentQuery(camperProfile?.userSub, template.id);

    const queryClient = useQueryClient();

    const { mutate: uploadDocument, isPending: isUploadingDocument } = useUploadCamperDocumentMutation();

    const submitHandler = (file: File, onProgress?: (event: TransferProgressEvent) => void, onSettled?: () => void) => {
        if(camperProfile) {
            uploadDocument({
                document: {
                    camperUserSub: camperProfile.userSub,
                    templateId: template.id,
                    received: true,
                },
                file,
                onProgress
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['camperDocuments', camperProfile.userSub] });
                    emitToast("Document uploaded", ToastType.Success);
                },
                onSettled: () => {
                    onSettled?.();
                },
                onError: (error) => {
                    console.error("Mutation error:", error);
                    emitToast(`Error uploading document: ${error.message}`, ToastType.Error);
                }
            });

            console.log("uploading document", file);
        }
    }
    // useEffect(() => {
    //     if(fileWatch && fileWatch.length > 0) {

    //         uploadDocument({
    //             document: {
    //                 camperUserSub: camperProfile.userSub,
    //                 templateId: template.id,
    //             },
    //             file: fileWatch[0]
    //         });

    //         console.log("uploading document", fileWatch[0]);

    //     }
    // }, [fileWatch]);

    const renderSubtitle = () => {
        if (template.type === 'upload') {
            return <small className="text-muted">Must be uploaded here.</small>;
        }
        else if (template.type === 'mail') {
            return <small className="text-muted">Must be mailed to the RYLA address.</small>;
        }
    }


    const renderUploadContent = () => {
        if (template.type === 'upload') {
            return <FileInputGroup 
                filepath={thisDocument?.filepath} 
                submitHandler={submitHandler} 
                isPending={isUploadingDocument || isPendingThisDocument}
            />
        }
    }
    const renderRightContent = () => {
        if(template.type === "viewonly") {
            return null;
        }
        if (thisDocument?.filepath || thisDocument?.received) {
            return <Badge bg="success"><FontAwesomeIcon icon={faCheckCircle} className="me-1" />Received</Badge>
        }
        else {
            return <Badge bg="danger"><FontAwesomeIcon icon={faXmark} className="me-1" />Not received</Badge>
        }
    }

    return (
        <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
            <div>
                <div>
                    <a
                        href={url}
                        target="_blank"
                    >
                        {/* <FontAwesomeIcon icon={faDownload} className="text-muted me-2" /> */}
                        {template.name}
                    </a>
                </div>
                <small className="text-muted">
                    {renderSubtitle()}
                </small>
            </div>
            {renderUploadContent()}
            {renderRightContent()}
        </div>
    );
};

// Main Documents Component
export function CamperImportantDocuments() {
    const authContext = useContext(AuthContext);

    const { data: camperProfile } = useCamperProfileQuery(authContext.attributes.sub);
    const { data: camp } = useCamperYearQuery(camperProfile ?? null);
    const { data: documentTemplates, isPending: isLoadingDocumentTemplates } = useDocumentTemplatesByCampQuery(camp);

    // Separate documents into three categories
    const viewOnlyDocuments = documentTemplates?.filter(doc => doc.type === "viewonly") || [];
    const requiredDocuments = documentTemplates?.filter(doc => doc.required && doc.type !== "viewonly") || [];
    const optionalDocuments = documentTemplates?.filter(doc => !doc.required && doc.type !== "viewonly") || [];

    return (
        <div>
            <div className="mb-4">
                <p className="mb-2">
                    <strong>Please review the following documents & forms to complete your registration for RYLA.</strong>
                </p>
                {/* <ul className="mb-0">
                <li><strong>Information Documents:</strong> For your reference only - no action required</li>
                <li><strong>Required Documents:</strong> Must be completed to finalize your registration</li>
                <li><strong>Optional Documents:</strong> Recommended but not required</li>
            </ul> */}
            </div>

            {/* View Only Documents Section */}

            <div className="mb-4">
                <h5 className="text-info mb-3">
                    Documents ({viewOnlyDocuments.length})

                </h5>
                <ThinSpacer />
                <p className="text-muted mb-3">These documents are provided for your information only. No action is required.
                </p>
                <ul>
                    <PlaceholderElement
                        isLoading={isLoadingDocumentTemplates}
                        props={{ xs: 12 }}
                    >
                        {viewOnlyDocuments.map((template) => (
                            <li key={template.id}>
                                <DocumentComponent
                                    camperProfile={camperProfile}
                                    key={template.id}
                                    template={template}
                                />
                            </li>
                        ))}
                    </PlaceholderElement>

                </ul>
            </div>


            {/* Required Documents Section */}
            <div className="mb-4">
                <h5 className="text-danger mb-3">
                    Required Forms ({requiredDocuments.length})
                </h5>
                <ThinSpacer />
                <p className="text-muted mb-3">These forms must be filled out and resubmitted to finalize your registration.
                    Most can be uploaded here, but some forms must be mailed to the RYLA address.
                </p>
                <ul>
                    <PlaceholderElement
                        isLoading={isLoadingDocumentTemplates}
                        props={{ xs: 12 }}
                    >
                        {requiredDocuments.map((template) => (
                            <li key={template.id}>
                                <DocumentComponent
                                    camperProfile={camperProfile}
                                    key={template.id}
                                    template={template}
                                />
                            </li>
                        ))}
                    </PlaceholderElement>

                </ul>

            </div>


            <div className="mb-4">
                <h5 className="text-secondary mb-3">
                    Optional Forms ({optionalDocuments.length})
                </h5>
                <ThinSpacer />
                <p className="text-muted mb-3">These forms are optional.</p>
                <ul>
                    <PlaceholderElement
                        isLoading={isLoadingDocumentTemplates}
                        props={{ xs: 12 }}
                    >
                        {optionalDocuments.map((template) => (
                            <li key={template.id}>
                                <DocumentComponent
                                    camperProfile={camperProfile}
                                    key={template.id}
                                    template={template}
                                />
                            </li>
                        ))}
                    </PlaceholderElement>
                </ul>

            </div>
        </div>
    );
}

