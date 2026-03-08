import { faEye, faFileAlt, faClockRotateLeft, faEnvelope, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Dropdown, Form, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Table as TanstackTable } from "@tanstack/table-core";
import { CamperProfileRowData } from "../../api/apiCamperTable";
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
import { useApproveDocumentEmailMutation, useRejectDocumentEmailMutation } from "../../queries/emailMutations";
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

    const [showCampInfo, setShowCampInfo] = useState(false);

    const { data: camp } = useCampQuery();
    const {
        data: documentTemplates
    } = useDocumentTemplatesByCampQuery(camp?.id);

    const mailedDocuments = useMemo(
        () => documentTemplates?.filter(doc => doc.type === "mail") || [], [documentTemplates]);

    const navigate = useNavigate();

    const selectedCampers = table.getSelectedRowModel().rows.map(row => row.original);

    const openMailto = (emails: string[]) => {
        const valid = emails.filter(Boolean);
        if (valid.length > 0) {
            window.location.href = `mailto:?bcc=${valid.join(',')}`;
        } else {
            emitToast("No email addresses found for the selected group", ToastType.Warning);
        }
    };

    return (
        <>
            <div className="camp-actions">
                <Button
                    size="sm"
                    onClick={() => setShowCampInfo(true)}
                >
                    <FontAwesomeIcon icon={faCircleInfo} className="me-1" />
                </Button>
                <Dropdown
                    title="Emails"
                >
                    <Dropdown.Toggle
                        size="sm"
                    >
                        <FontAwesomeIcon icon={faEnvelope} className="me-1" />
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="menu">
                        <Dropdown.Item
                            disabled={!hasSelectedRows}
                            title="Emails the selected students"
                            onClick={() => openMailto(
                                selectedCampers.map(camper => camper.email)
                            )}
                        >
                            Email selected students...
                        </Dropdown.Item>

                        <Dropdown.Divider />
                        
                        <Dropdown.Item
                            onClick={() => openMailto(
                                table.getCoreRowModel().rows.map(row => row.original.email)
                            )}
                        >
                            Email all students...
                        </Dropdown.Item>
                        <OverlayTrigger
                            placement="right"
                            delay={{ show: 500, hide: 0 }}
                            overlay={<Tooltip>Emails all students who have been admitted by their rotary club</Tooltip>}
                        >
                            <Dropdown.Item
                                onClick={() => openMailto(
                                    table.getCoreRowModel().rows
                                        .filter(row => row.original.rotarianReview === "APPROVED")
                                        .map(row => row.original.email)
                                )}
                            >
                                Email admitted students...
                            </Dropdown.Item>
                        </OverlayTrigger>
                        <OverlayTrigger
                            placement="right"
                            delay={{ show: 500, hide: 0 }}
                            overlay={<Tooltip>Emails all students who have completed their applications</Tooltip>}
                        >
                            <Dropdown.Item
                                onClick={() => openMailto(
                                    table.getCoreRowModel().rows
                                        .filter(row => row.original.applicationComplete)
                                        .map(row => row.original.email)
                                )}
                            >
                                Email applied students...
                            </Dropdown.Item>
                        </OverlayTrigger>
                    </Dropdown.Menu>
                </Dropdown>
                <div
                    style={{
                        width: "1px",
                        background: "#dee2e6",
                        height: "50%",
                        alignSelf: "center",
                        margin: "0 5px"
                    }}
                />
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
                                Approve "{doc.name}"...
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
            <CampInfoModal
                table={table}
                onClose={() => setShowCampInfo(false)}
                show={showCampInfo}
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
    const { mutate: approveDocumentEmail } = useApproveDocumentEmailMutation();
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
                    approved: true
                }
            })),
        },
            {
                onSuccess: () => {
                    selectedCampers.forEach(camper => {
                        approveDocumentEmail({
                            templateName: documentTemplate?.name ?? '',
                            to: [camper.email, camper.parent1Email, camper.parent2Email],
                        });
                    });

                    emitToast(`'${documentTemplate.name}' approved for ${selectedCampers.length} campers`, ToastType.Success);
                },
                onSettled: () => {
                    queryClient.invalidateQueries({ queryKey: ['camperDataAdmin'] });
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
    statusAction: 'approve' | 'reject' | 'missing';
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
                updates = { 
                    approved: true,
                    received: true
                };
                break;
            case 'reject':
                updates = { approved: false };
                break;
            case 'missing':
                updates = { received: false };
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
                console.log('selectedDocument', selectedDocument);
                console.log('selectedTemplate', selectedTemplate);
                // Invalidate relevant queries
                if (data.statusAction === 'reject') {
                    rejectDocumentEmail({
                        docName: getFilepathFilename(selectedDocument?.filepath) ?? '',
                        templateName: selectedTemplate?.name ?? '',
                        to: [selectedCamper.email, selectedCamper.parent1Email, selectedCamper.parent2Email],
                        message: data.message,
                        replyTo: authContext.attributes.email
                    });
                }
                else if (data.statusAction === 'approve') {
                    approveDocumentEmail({
                        templateName: selectedTemplate?.name ?? '',
                        to: [selectedCamper.email, selectedCamper.parent1Email, selectedCamper.parent2Email],
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
                queryClient.invalidateQueries({ queryKey: ['camperDataAdmin'] });
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
                    queryClient.invalidateQueries({ queryKey: ['camperDataAdmin'] });
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
                            <option value="reject">Mark Incomplete</option>
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

    const queryClient = useQueryClient();

    const selectedCampers = table.getSelectedRowModel().rows.map(row => row.original);

    const onSubmit: SubmitHandler<ChangeReviewStatusForm> = (data) => {
        console.log(data);
        decideCampers({ 
            campers: selectedCampers.map(camper => {

                return ({ camperSub: camper.userSub, decision: data.status === 'undo' ? null : data.status })

            })},

            {
                onSettled: () => {
                    queryClient.invalidateQueries({ queryKey: ['camperDataAdmin'] });
                    onCancel()
                },
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


interface CampInfoModalProps {
    table: TanstackTable<CamperProfileRowData>;
    onClose: () => void;
    show: boolean;
}

function CampInfoModal({
    table,
    onClose,
    show
}: CampInfoModalProps) {
    const allRows = table.getCoreRowModel().rows.map(row => row.original);

    const stats = useMemo(() => {
        const total = allRows.length;
        const profilesCompleted = allRows.filter(r => r.profileComplete).length;
        const applicationsCompleted = allRows.filter(r => r.applicationComplete).length;
        const admitted = allRows.filter(r => r.rotarianReview === "APPROVED").length;
        const rejected = allRows.filter(r => r.rotarianReview === "REJECTED").length;
        const readyForCamp = allRows.filter(r =>
            r.profileComplete && r.applicationComplete && r.rotarianReview === "APPROVED" && r.documentsComplete
        ).length;

        return { total, profilesCompleted, applicationsCompleted, admitted, rejected, readyForCamp };
    }, [allRows]);

    return (
        <Modal show={show} centered onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Camp Information</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex justify-content-center gap-5 mb-4">
                    <div className="text-center">
                        <div className="display-4 fw-bold">{stats.total}</div>
                        <div className="text-muted">Total Accounts</div>
                    </div>
                    <div className="text-center">
                        <div className="display-4 fw-bold text-success">{stats.readyForCamp}</div>
                        <div className="text-muted">Ready for Camp</div>
                    </div>
                </div>

                <div className="d-flex flex-column gap-2">
                    {([
                        { label: 'Profiles completed', value: stats.profilesCompleted, info: 'Students who have filled out basic profile information' },
                        { label: 'Applications submitted', value: stats.applicationsCompleted, info: 'Students who have submitted an application' },
                        { label: 'Admitted students', value: stats.admitted, info: 'Students who have been admitted by their rotary club' },
                        { label: 'Ready for camp', value: stats.readyForCamp, info: 'Students with a complete profile, submitted application, rotary club admission, and all documents completed' },
                    ] as const).map(({ label, value, info }) => (
                        <div key={label} className="d-flex justify-content-between align-items-center">
                            <span className="d-flex align-items-center gap-1">
                                {label}
                                <OverlayTrigger
                                    placement="right"
                                    delay={{ show: 300, hide: 0 }}
                                    overlay={<Tooltip>{info}</Tooltip>}
                                >
                                    <FontAwesomeIcon icon={faCircleInfo} className="text-muted" style={{ fontSize: '0.75rem', cursor: 'pointer' }} />
                                </OverlayTrigger>
                            </span>
                            <span className="fw-bold">{value}</span>
                        </div>
                    ))}
                </div>
            </Modal.Body>
        </Modal>
    );
}