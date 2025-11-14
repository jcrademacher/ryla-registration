import { faEye, faFileAlt, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Dropdown, Form, Modal } from "react-bootstrap";
import { Table as TanstackTable } from "@tanstack/table-core";
import { CamperProfileRowData } from "./CampManagementPage";
import { useCampQuery } from "../../queries/adminQueries";
import { useDocumentTemplatesByCampQuery, useCamperDocumentsQuery } from "../../queries/queries";
import { useContext, useMemo, useState } from "react";
import { ConfirmationModal } from "../../components/modals";
import { DocumentTemplateSchemaType } from "../../api/apiDocuments";
import { useUploadMultipleCamperDocumentsMutation, useUploadCamperDocumentMutation, useUpdateMultipleProfilesMutation, useDecideCampersMutation } from "../../queries/mutations";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { emitToast, ToastType } from "../../utils/notifications";
import { useForm, SubmitHandler } from "react-hook-form";
import { useApproveDocumentEmailMutation, useReceivedDocumentEmailMutation, useRejectDocumentEmailMutation } from "../../queries/emailMutations";
import { getFilepathFilename } from "../../utils/fields";
import { AuthContext } from "../../App";
import { DateTime } from "luxon";
import { getCamperName } from "../../utils/fields";
import { SpinnerButton } from "../../utils/button";
import { RotarianReviewDecision } from "../../api/apiRotarianReview";


export function TableActions({ table }: { table: TanstackTable<CamperProfileRowData> }) {
    // Check if any rows are selected
    const hasSelectedRows = table.getSelectedRowModel().rows.length > 0;
    const hasOneSelectedRow = table.getSelectedRowModel().rows.length === 1;

    const [selectedDocument, setSelectedDocument] = useState<DocumentTemplateSchemaType | null>(null);
    const [showChangeDocumentStatus, setShowChangeDocumentStatus] = useState(false);

    const [showChangeApplicationStatus, setShowChangeApplicationStatus] = useState(false);
    const [showChangeReviewStatus, setShowChangeReviewStatus] = useState(false);

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
                    <FontAwesomeIcon icon={faEye} className="me-1" />
                </Button>
                <Dropdown
                    title="Status"
                >
                    <Dropdown.Toggle
                        size="sm"
                        disabled={!hasSelectedRows}
                    >
                        <FontAwesomeIcon icon={faClockRotateLeft} className="me-1" />
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="menu">
                        <Dropdown.Item
                            disabled={!hasSelectedRows}
                            onClick={() => setShowChangeApplicationStatus(true)}
                        >
                            Change application status{selectedCampers.length > 1 ? 'es' : ''}...
                        </Dropdown.Item>
                        <Dropdown.Item
                            disabled={!hasSelectedRows}
                            onClick={() => setShowChangeReviewStatus(true)}
                        >
                            Change review status{selectedCampers.length > 1 ? 'es' : ''}...
                        </Dropdown.Item>

                    </Dropdown.Menu>


                </Dropdown>
                <Dropdown
                    title="Documents"
                >
                    <Dropdown.Toggle
                        size="sm"
                        disabled={!hasSelectedRows}
                    >
                        <FontAwesomeIcon icon={faFileAlt} className="me-1" />
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
                        <Dropdown.Item
                            disabled={!hasOneSelectedRow}
                            onClick={() => setShowChangeDocumentStatus(true)}
                        >
                            Change document status...
                        </Dropdown.Item>
                    </Dropdown.Menu>

                </Dropdown>
                

            </div>

            <ConfirmDocumentReceivedModal
                table={table}
                onClose={() => setSelectedDocument(null)}
                documentTemplate={selectedDocument}
            />
            <ChangeDocumentStatusModal
                table={table}
                onClose={() => setShowChangeDocumentStatus(false)}
                show={showChangeDocumentStatus}
            />
            <ChangeApplicationStatusModal
                table={table}
                onClose={() => setShowChangeApplicationStatus(false)}
                show={showChangeApplicationStatus}
            />
            <ChangeReviewStatusModal
                table={table}
                onClose={() => setShowChangeReviewStatus(false)}
                show={showChangeReviewStatus}
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
    const { mutate: receivedDocumentEmail } = useReceivedDocumentEmailMutation();
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
                    received: true
                }
            })),
        },
            {
                onSuccess: () => {
                    selectedCampers.forEach(camper => {
                        queryClient.invalidateQueries({ queryKey: ['documentStatus', camper.campId, camper.userSub] });

                        receivedDocumentEmail({
                            templateName: documentTemplate?.name ?? '',
                            to: [camper.email, camper.parent1Email],
                        });
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
                    <li key={camper.userSub}>{getCamperName(camper)}</li>
                ))}
            </ul>
            Are you sure you want to do this?
        </ConfirmationModal>
    );
}

interface ChangeDocumentStatusModalProps {
    table: TanstackTable<CamperProfileRowData>;
    onClose: () => void;
    show: boolean;
}

type ChangeDocumentStatusForm = {
    templateId: string;
    statusAction: 'approve' | 'reject' | 'missing' | 'received';
    message?: string;
}

function ChangeDocumentStatusModal({
    table,
    onClose,
    show
}: ChangeDocumentStatusModalProps) {
    const selectedCampers = table.getSelectedRowModel().rows.map(row => row.original);
    const selectedCamper = selectedCampers[0]; // Should only be one since we require hasOneSelectedRow

    const { data: camperDocuments, isPending: isPendingDocuments } = useCamperDocumentsQuery(selectedCamper?.userSub);
    const { data: camp } = useCampQuery();
    const { data: documentTemplates } = useDocumentTemplatesByCampQuery(camp?.id);

    const { mutate: uploadDocument, isPending: isUpdating } = useUploadCamperDocumentMutation();
    const { mutate: rejectDocumentEmail } = useRejectDocumentEmailMutation();
    const { mutate: approveDocumentEmail } = useApproveDocumentEmailMutation();
    const { mutate: receivedDocumentEmail } = useReceivedDocumentEmailMutation();

    const queryClient = useQueryClient();

    const authContext = useContext(AuthContext);

    const form = useForm<ChangeDocumentStatusForm>({
        defaultValues: {
            templateId: '',
            statusAction: 'approve'
        }
    });

    const selectedTemplateIsMailed = documentTemplates?.some(doc => doc.id === form.watch('templateId') && doc.type === 'mail');
    const selectedTemplate = documentTemplates?.find(doc => doc.id === form.watch('templateId'));

    const selectedDocument = camperDocuments?.find(d => d.templateId === form.watch('templateId'));

    const onSubmit: SubmitHandler<ChangeDocumentStatusForm> = (data) => {
        if (!selectedCamper) {
            emitToast("No camper selected", ToastType.Error);
            return;
        }

        let updates: { approved?: boolean; received?: boolean } = {};

        switch (data.statusAction) {
            case 'approve':
                updates = { approved: true };
                break;
            case 'reject':
                updates = { approved: false };
                break;
            case 'missing':
                updates = { received: false };
                break;
            case 'received':
                updates = { received: true };
                break;
        }

        uploadDocument({
            document: {
                camperUserSub: selectedCamper.userSub,
                templateId: data.templateId,
                received: updates.received,
                approved: updates.approved
            },
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['camperDocuments', selectedCamper.userSub] });
                // Invalidate relevant queries
                if (data.statusAction === 'reject') {
                    console.log('selectedDocument', selectedDocument);
                    console.log('selectedTemplate', selectedTemplate);

                    rejectDocumentEmail({
                        docName: getFilepathFilename(selectedDocument?.filepath) ?? '',
                        templateName: selectedTemplate?.name ?? '',
                        to: [selectedCamper.email, selectedCamper.parent1Email],
                        message: data.message,
                        replyTo: authContext.attributes.email
                    });
                }
                else if (data.statusAction === 'approve') {
                    approveDocumentEmail({
                        templateName: selectedTemplate?.name ?? '',
                        to: [selectedCamper.email, selectedCamper.parent1Email],
                        replyTo: authContext.attributes.email
                    });
                }
                else if (data.statusAction === 'received') {
                    receivedDocumentEmail({
                        templateName: selectedTemplate?.name ?? '',
                        to: [selectedCamper.email, selectedCamper.parent1Email],
                        replyTo: authContext.attributes.email
                    });
                }

                // if(data.statusAction === 'reject') {    
                //     rejectDocument({
                //         document: {
                //             camperUserSub: selectedCamper.userSub,
                //             templateId: data.templateId,
                //             received: updates.received,
                //             approved: updates.approved
                //         }
                //     });
                // }
                emitToast(`Document status updated for ${selectedCamper.firstName} ${selectedCamper.lastName}`, ToastType.Success);
            },
            onSettled: () => {
                form.reset();
                onClose();
            },
            onError: (error) => {
                console.error('Error updating document status:', error);
                emitToast("Failed to update document status", ToastType.Error);
            }
        });
    };

    return (
        <Modal show={show} size="lg" centered onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Change Document Status</Modal.Title>
            </Modal.Header>
            <Form onSubmit={form.handleSubmit(onSubmit)}>
                <Modal.Body>
                    <div className="mb-3">
                        <strong>Camper:</strong> {selectedCamper?.firstName} {selectedCamper?.lastName}
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Select Document</Form.Label>
                        <Form.Select
                            {...form.register('templateId', { required: 'Please select a document' })}
                            isInvalid={!!form.formState.errors.templateId}
                            disabled={isPendingDocuments}
                        >
                            <option value="" disabled>Choose a document...</option>
                            {documentTemplates?.map(doc => {
                                const isMailed = doc.type === 'mail';
                                const isUploaded = camperDocuments?.some(d => d.templateId === doc.id && d.filepath);

                                return (
                                    <option key={doc.id} value={doc.id} disabled={!(isMailed || isUploaded)}>
                                        {doc.name}
                                    </option>
                                );
                            })}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {form.formState.errors.templateId?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Action</Form.Label>
                        <Form.Select
                            {...form.register('statusAction', { required: 'Please select an action' })}
                            isInvalid={!!form.formState.errors.statusAction}
                        >
                            <option value="" disabled>Choose...</option>
                            <option
                                value="approve"
                            >
                                Approve Document
                            </option>
                            <option
                                value="reject"
                            >
                                Reject Document
                            </option>
                            <option
                                value="missing"
                                disabled={!selectedTemplateIsMailed}
                            >
                                Mark as Missing
                            </option>
                            <option
                                value="received"
                                disabled={!selectedTemplateIsMailed}
                            >
                                Mark as Received
                            </option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {form.formState.errors.statusAction?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    {form.watch("statusAction") === "reject" && (
                        <Form.Group className="mb-3">
                            <Form.Label>Message (optional)</Form.Label>
                            <Form.Control
                                as="textarea" rows={3} placeholder="Enter a message to email to the camper" {...form.register('message')} />
                        </Form.Group>
                    )}

                    {selectedTemplate && (
                        <div className="alert alert-info">
                            <strong>Current Status:</strong><br />
                            Received: {camperDocuments?.some(d => d.templateId === selectedTemplate.id && d.received) ? 'Yes' : 'No'}<br />
                            Approved: {camperDocuments?.some(d => d.templateId === selectedTemplate.id && d.approved) ? 'Yes' : 'No'}<br />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={onClose}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isUpdating}
                    >
                        {isUpdating ? 'Updating...' : 'Update Status'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

interface ChangeStatusModalProps {
    table: TanstackTable<CamperProfileRowData>;
    onClose: () => void;
    show: boolean;
}

type ChangeStatusForm = {
    status: 'approve' | 'reject' | null;
}

function ChangeApplicationStatusModal({
    table,
    onClose,
    show
}: ChangeStatusModalProps) {

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm<ChangeStatusForm>({ defaultValues: { status: null } });

    const { mutate: updateMultipleProfiles, isPending } = useUpdateMultipleProfilesMutation();

    const queryClient = useQueryClient();

    const onCancel = () => {
        reset();
        onClose();
    }

    const onSubmit: SubmitHandler<ChangeStatusForm> = (data) => {
        console.log(data);
        updateMultipleProfiles(
            selectedCampers.map(camper => ({
                userSub: camper.userSub,
                applicationComplete: data.status === 'approve' ? true : false,
                applicationSubmittedAt: data.status === 'approve' ? DateTime.now().toISO() : null
            })),
            {
                onSuccess: () => {
                    
                    emitToast(`Application status updated for ${selectedCampers.length} camper(s)`, ToastType.Success);
                },
                onSettled: () => {
                    selectedCampers.forEach(camper => { 
                        queryClient.invalidateQueries({ queryKey: ['documentStatus', camper.campId, camper.userSub] });
                    });
                    onCancel();
                }
            }
        );
    }

    const selectedCampers = table.getSelectedRowModel().rows.map(row => row.original);

    return (
        <Modal show={show} size="lg" centered onHide={onCancel}>
            <Modal.Header closeButton>
                <Modal.Title>Change Application Status</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    The following camper(s) will have their application status changed:
                    <ul>
                        {selectedCampers.map(camper => (
                            <li key={camper.userSub}>{getCamperName(camper)}</li>
                        ))}
                    </ul>
                    <Form.Group className="mb-3">
                        <Form.Select {
                            ...register('status', { required: true })}
                            isInvalid={!!errors.status}
                        >
                            <option value="" disabled>Choose...</option>
                            <option value="approve">Approve</option>
                            <option value="reject">Reject</option>
                        </Form.Select>
                    </Form.Group>
                    <p>Are you sure you want to do this?</p>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={onCancel}>Cancel</Button>
                    <SpinnerButton
                        type="submit"
                        variant="primary"
                        disabled={isPending || watch('status') === null}
                        loading={isPending}
                    >
                        Update Status
                    </SpinnerButton>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

type ChangeReviewStatusForm = {
    status: RotarianReviewDecision | 'undo' | null;
}

function ChangeReviewStatusModal({
    table,
    onClose,
    show
}: ChangeStatusModalProps) {

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm<ChangeReviewStatusForm>({ defaultValues: { status: null } });

    const { mutate: decideCampers, isPending } = useDecideCampersMutation();

    const onCancel = () => {
        reset();
        onClose();
    }

    const selectedCampers = table.getSelectedRowModel().rows.map(row => row.original);

    const onSubmit: SubmitHandler<ChangeReviewStatusForm> = (data) => {
        console.log(data);
        decideCampers({ 
            campers: selectedCampers.map(camper => {

                return ({ camperSub: camper.userSub, decision: data.status === 'undo' ? null : data.status })

            })},

            {
                onSettled: () => onCancel(),
                onSuccess: () => {
                    emitToast(`Review status updated for ${selectedCampers.length} camper(s)`, ToastType.Success);
                }
            }
        );
    }

    

    return (
        <Modal show={show} size="lg" centered onHide={onCancel}>
            <Modal.Header closeButton>
                <Modal.Title>Change Review Status</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    The following camper(s) will have their review status changed:
                    <ul>
                        {selectedCampers.map(camper => (
                            <li key={camper.userSub}>{getCamperName(camper)}</li>
                        ))}
                    </ul>
                    <Form.Group className="mb-3">
                        <Form.Select {
                            ...register('status', { required: true })}
                            isInvalid={!!errors.status}
                        >
                            <option value="" disabled>Choose...</option>
                            <option value="APPROVED">Admit</option>
                            <option value="REJECTED">Reject</option>
                            <option value="undo">Undo</option>
                        </Form.Select>
                    </Form.Group>
                    <p><b>Note:</b> No action will cause an email to be sent to the camper.</p>
                    <p>Are you sure you want to do this?</p>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={onCancel}>Cancel</Button>
                    <SpinnerButton
                        type="submit"
                        variant="primary"
                        disabled={isPending || watch('status') === null}
                        loading={isPending}
                    >
                        Update Status
                    </SpinnerButton>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
