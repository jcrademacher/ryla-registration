import { faEye, faFileAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Dropdown } from "react-bootstrap";
import { Table as TanstackTable } from "@tanstack/table-core";
import { CamperProfileRowData } from "./CampManagementPage";
import { useCampQuery } from "../../queries/adminQueries";
import { useDocumentTemplatesByCampQuery } from "../../queries/queries";
import { useMemo, useState } from "react";
import { ConfirmationModal } from "../../components/modals";
import { DocumentTemplateSchemaType } from "../../api/apiDocuments";
import { useUploadMultipleCamperDocumentsMutation } from "../../queries/mutations";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { emitToast, ToastType } from "../../utils/notifications";


export function TableActions({ table }: { table: TanstackTable<CamperProfileRowData> }) {
    // Check if any rows are selected
    const hasSelectedRows = table.getSelectedRowModel().rows.length > 0;

    const [selectedDocument, setSelectedDocument] = useState<DocumentTemplateSchemaType | null>(null);

    const { data: camp } = useCampQuery();
    const {
        data: documentTemplates
    } = useDocumentTemplatesByCampQuery(camp?.id);

    const mailedDocuments = useMemo(
        () => documentTemplates?.filter(doc => doc.type === "mail") || [], [documentTemplates]);

    const navigate = useNavigate();

    const selectedCampers = table.getSelectedRowModel().rows.map(row => row.original);

    return (
        <>
            <div className="camp-actions">
                <Button
                    size="sm"
                    disabled={!hasSelectedRows}
                    onClick={() => {
                        navigate(`/camper-view/${selectedCampers[0].userSub}`);
                    }}
                >
                    <FontAwesomeIcon icon={faEye} />
                </Button>
                <Dropdown
                    title="Actions"
                >
                    <Dropdown.Toggle
                        size="sm"
                        disabled={!hasSelectedRows}
                    >
                        <FontAwesomeIcon icon={faFileAlt} />
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="menu">
                        {mailedDocuments.map(doc => (
                            <Dropdown.Item
                                key={doc.id}
                                disabled={!hasSelectedRows}
                                onClick={() => setSelectedDocument(doc)}
                            >
                                Mark "{doc.name}" as received...
                            </Dropdown.Item>
                        ))}
                        <Dropdown.Item disabled={!hasSelectedRows}>Change form status...</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

            </div>

            <ConfirmDocumentReceivedModal
                table={table}
                onClose={() => setSelectedDocument(null)}
                documentTemplate={selectedDocument}
            />
        </>
    )
}

interface ConfirmDocumentReceivedModalProps {
    table: TanstackTable<CamperProfileRowData>;
    onClose: () => void;
    documentTemplate: DocumentTemplateSchemaType | null;
}

function ConfirmDocumentReceivedModal({
    table,
    onClose,
    documentTemplate
}: ConfirmDocumentReceivedModalProps) {
    const selectedCampers = table.getSelectedRowModel().rows.map(row => row.original);

    const { mutate: uploadDocuments, isPending: isUploadingDocuments } = useUploadMultipleCamperDocumentsMutation();
    const queryClient = useQueryClient();

    const handleConfirm = () => {
        // TODO: Backend integration will go here
        console.log('Marking as received:', selectedCampers);

        if (!documentTemplate) {
            console.warn("No document template selected");
            return;
        }

        uploadDocuments({
            objects: selectedCampers.map(camper => ({
                document: {
                    camperUserSub: camper.userSub,
                    templateId: documentTemplate.id,
                    received: true,
                    owner: camper.userSub
                }
            })),
        },
        {
            onSuccess: () => {
                selectedCampers.forEach(camper => {
                    queryClient.invalidateQueries({ queryKey: ['camperStatus', camper.userSub] });
                });

                emitToast(`'${documentTemplate.name}' marked as received for ${selectedCampers.length} campers`, ToastType.Success);
            },
            onSettled: () => {
                onClose();
            }
        }
    );
    };

    return (
        <ConfirmationModal
            show={!!documentTemplate}
            onClose={onClose}
            title="Mark Form as Received"
            confirmButtonText="Confirm"
            confirmButtonVariant="primary"
            onConfirm={handleConfirm}
            isLoading={isUploadingDocuments}
        >

            The following camper(s) will have their "{documentTemplate?.name}" document marked as received:
            <ul>
                {selectedCampers.map(camper => (
                    <li key={camper.userSub}>{camper.firstName} {camper.lastName}</li>
                ))}
            </ul>
            Are you sure you want to do this?
        </ConfirmationModal>
    );
}
