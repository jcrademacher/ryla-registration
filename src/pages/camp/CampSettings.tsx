import { useForm } from "react-hook-form";
import { SubmitHandler } from "react-hook-form";
import { useCampQuery, useListCampsQuery } from "../../queries/adminQueries";
import { useDocumentTemplatesByCampQuery } from "../../queries/queries";
import { UpdateCampSchemaType } from '../../api/apiCamp';
import { DocumentTemplateSchemaType, getUrlToDocument } from '../../api/apiDocuments';
import { useUpdateCampMutation, useUploadDocumentTemplateMutation } from "../../queries/adminMutations";
import { Form, Button, Row as BsRow, Col, Table, Placeholder } from "react-bootstrap";
import { createEDT, createFromISO, formatDateHTML } from "../../utils/datetime";
import { DateTime } from "luxon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faEye, faEdit } from "@fortawesome/free-solid-svg-icons";
import { SpinnerButton } from "../../utils/button";
import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { emitToast, ToastType } from "../../utils/notifications";
import { ThinSpacer } from "../../components/ThinSpacer";
import { useNavigate } from "react-router";



type EditCampForm = {
    startDate: string;
    endDate: string;
    applicationDeadline: string;
}

type DocumentTemplateForm = {
    name: string;
    files: FileList | null;
    type: "viewonly" | "upload" | "mail" | "";
    required: boolean;
}

interface DocumentFormProps {
    values?: DocumentTemplateForm;
    template?: DocumentTemplateSchemaType;
    onDone?: () => void;
}

function DocumentForm({ values, template, onDone }: DocumentFormProps) {
    const queryClient = useQueryClient();

    const { data: camp } = useCampQuery();
    const { mutate: uploadTemplate, isPending: isUploadingTemplate } = useUploadDocumentTemplateMutation();

    // TODO UPDATE OR CREATE BASED ON ID
    const onDocumentSubmit: SubmitHandler<DocumentTemplateForm> = (data) => {
        const newDocument = {
            id: template?.id,
            name: data.name,
            type: data.type || null,
            required: data.required,
            campId: camp?.id ?? "",
        };
        if (data.files && data.files.length > 0) {
            uploadTemplate({ template: newDocument, existingTemplate: template, file: data.files[0] }, {
                onSettled: () => {
                    documentForm.reset();
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['documentTemplatesByCamp', camp?.id] });
                    onDone?.();
                }
            });
        }
    
    };

    const documentForm = useForm<DocumentTemplateForm>({
        values,
        defaultValues: {
            name: "",
            type: "",
            files: null,
            required: false,
        }
    });

    return (
        <Form>
            <Table bordered size="sm">
                <thead>
                    <tr className="table-light">
                        <td>
                            <Form.Control
                                type="text"
                                size="sm"
                                placeholder="Document name"
                                {...documentForm.register('name', { required: 'Document name is required' })}
                                isInvalid={!!documentForm.formState.errors.name}
                            />
                        </td>
                        <td>
                            <Form.Control
                                type="file"
                                size="sm"
                                {...documentForm.register("files", { required: true })}
                                accept=".pdf,.doc,.docx"
                                isInvalid={!!documentForm.formState.errors.files}
                            />
                        </td>
                        <td>
                            <Form.Select
                                size="sm"
                                {...documentForm.register('type', { required: 'Document type is required' })}
                                isInvalid={!!documentForm.formState.errors.type}
                            >
                                <option disabled value="">Select Type</option>
                                <option value="viewonly">View Only</option>
                                <option value="upload">Complete & Upload</option>
                                <option value="mail">Complete & Mail</option>
                            </Form.Select>
                        </td>
                        <td>
                            <Form.Check
                                type="checkbox"
                                label="Required?"
                                {...documentForm.register('required')}
                            />
                        </td>
                        <td>
                            <div className="d-flex gap-1">
                                <SpinnerButton
                                    variant="primary"
                                    size="sm"
                                    onClick={() => documentForm.handleSubmit(onDocumentSubmit)()}
                                    loading={isUploadingTemplate}
                                >
                                    {template?.id ? "Update" : "Add"}
                                </SpinnerButton>
                            </div>
                        </td>
                    </tr>
                </thead>
            </Table>
        </Form>
    )
}

export const CampSettings = () => {
    const { data: camp } = useCampQuery();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: otherCamps } = useListCampsQuery();
    const { mutate: updateCamp, isPending: isUpdatingCamp } = useUpdateCampMutation(otherCamps);

    const { data: documentTemplates, isPending: isPendingDocumentTemplates } = useDocumentTemplatesByCampQuery(camp?.id);


    const { register, handleSubmit, formState: { errors }, reset } = useForm<EditCampForm>({
        values: {
            startDate: formatDateHTML(createFromISO(camp?.startDate ?? "")),
            endDate: formatDateHTML(createFromISO(camp?.endDate ?? "")),
            applicationDeadline: formatDateHTML(createFromISO(camp?.applicationDeadline ?? "")),
        }
    });

    const onDone = () => {
        navigate(`/admin/camps/${camp?.id}`);
    }

    const onSubmit: SubmitHandler<EditCampForm> = (data: EditCampForm) => {
        const startDateObj = createEDT(data.startDate);
        const endDateObj = createEDT(data.endDate);

        const startDate = startDateObj.toISO();
        const endDate = endDateObj.toISO();
        const applicationDeadline = createEDT(data.applicationDeadline).toISO();

        const newCamp: UpdateCampSchemaType = {
            id: camp?.id ?? "",
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            applicationDeadline: applicationDeadline || undefined,
        }

        updateCamp(newCamp, {
            onSettled: () => {
                onDone();
            },
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['camp', data?.id] });
                emitToast('Camp settings updated successfully', ToastType.Success);
            }
        });
    }

    useEffect(() => { console.log("restting"); reset(); }, []);

    let DocumentTable;

    if (documentTemplates && documentTemplates.length > 0) {
        DocumentTable = (
            documentTemplates?.map((doc: DocumentTemplateSchemaType, index: number) => {
                return <DocumentRow doc={doc} key={index} />
            })
        )
    }
    else if (documentTemplates && documentTemplates.length === 0) {
        DocumentTable = (
            <tr>
                <td colSpan={5} className="text-center text-muted">
                    No document templates added yet
                </td>
            </tr>
        )
    }
    else if (isPendingDocumentTemplates) {
        DocumentTable =
            <tr>
                <td colSpan={5}>
                    <Placeholder animation="glow">
                        <Placeholder xs={5} />
                    </Placeholder>
                </td>
            </tr>;
    }
    else {
        DocumentTable = <tr><td colSpan={5} className="text-center text-danger"><strong>Error loading document templates</strong></td></tr>;
    }

    return (
        <div className="side-pad-20">
            <h3>{camp ? `RYLA ${DateTime.fromISO(camp.startDate).year}` : ""} Settings</h3>
            <ThinSpacer />

            <Form onSubmit={handleSubmit(onSubmit)}>

                <BsRow>
                    <Col xs={6}>
                        <Form.Group>
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                {...register('startDate', {
                                    required: true,
                                    validate: (startDate, { endDate }) => {
                                        const startDateObj = createEDT(startDate);
                                        const endDateObj = createEDT(endDate);

                                        if (startDateObj < DateTime.now()) {
                                            return 'Start date must be after today';
                                        }
                                        else if (startDateObj > endDateObj) {
                                            return 'Start date must be before end date';
                                        }

                                        return true;
                                    }
                                })}
                                isInvalid={!!errors.startDate}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.startDate?.message || 'Start date is required'}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col xs={6}>
                        <Form.Group>
                            <Form.Label>End Date</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                {...register('endDate', {
                                    required: true,
                                    validate: (endDate, { startDate }) => {
                                        if (!endDate) {
                                            return 'End date is required';
                                        }
                                        if (!startDate) {
                                            return 'Start date must be set first';
                                        }
                                        // Check if endDate is at least 1 week after startDate
                                        const start = DateTime.fromISO(startDate);
                                        const end = DateTime.fromISO(endDate);
                                        if (end.diff(start, 'days').days > 7) {
                                            return 'End date must be less than 1 week after start date';
                                        }
                                        return true;
                                    }
                                })}
                                isInvalid={!!errors.endDate}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.endDate?.message || 'End date is required'}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </BsRow>
                <BsRow>
                    <Col xs={12}>
                        <Form.Group>
                            <Form.Label>Application Deadline</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                {...register('applicationDeadline', {
                                    required: true,
                                    validate: (applicationDeadline, { startDate }) => {
                                        const startDateObj = createEDT(startDate);
                                        const applicationDeadlineObj = createEDT(applicationDeadline);

                                        if (applicationDeadlineObj > startDateObj) {
                                            return 'Application deadline must be before start date';
                                        }
                                        return true;
                                    }
                                })}
                                isInvalid={!!errors.applicationDeadline}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.applicationDeadline?.message || 'Application deadline is required'}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </BsRow>
                <br />

            </Form>


            {/* Document Templates Section */}
            <BsRow>
                <Col xs={12}>
                    <div className="mb-3">
                        <h5>
                            <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                            Documents
                        </h5>
                        <ThinSpacer />
                        Add documents that campers must complete here. Once documents are added, they can only be modified. They cannot be deleted.  
                    </div>
                    <DocumentForm />
                    <div className="document-templates-table">

                        <Table bordered size="sm">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>File</th>
                                    <th>Type</th>
                                    <th>Required?</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Always show add form row */}


                                {DocumentTable}
                            </tbody>
                        </Table>

                    </div>
                </Col>
            </BsRow>
            <Button
                variant="light"
                onClick={onDone}
                className="me-2"
            >
                Cancel
            </Button>
            <SpinnerButton
                variant="primary"
                onClick={() => handleSubmit(onSubmit)()}
                loading={isUpdatingCamp}
            >
                Save
            </SpinnerButton>
        </div >
    )
}

const DocumentRow = ({ doc }: { doc: DocumentTemplateSchemaType }) => {

    let typestr = "";

    if (doc.type === "viewonly") {
        typestr = "View Only";
    }
    else if (doc.type === "upload") {
        typestr = "Complete & Upload";
    }
    else if (doc.type === "mail") {
        typestr = "Complete & Mail";
    }
    else {
        typestr = "Unknown";
    }

    // const { mutate: deleteDocument, isPending: isDeletingDocument } = useDeleteDocumentTemplateMutation();

    // const [deleteModalShow, setDeleteModalShow] = useState(false);
    const [editing, setEditing] = useState(false);

    const handleViewDocument = useCallback(async (filepath: string) => {
        try {
            const url = await getUrlToDocument(filepath);
            window.open(url, '_blank');
        } catch (error) {
            console.error('View error:', error);
            emitToast('Error viewing file', ToastType.Error);
        }
    }, []);

    // const handleDeleteDocument = async () => {
    //     deleteDocument(doc, {
    //         onSettled: () => {
    //             setDeleteModalShow(false);
    //         },
    //         onSuccess: () => {
    //             queryClient.invalidateQueries({ queryKey: ['documentTemplatesByCamp', doc.campId] });
    //         }
    //     });
    // }

    if (editing) {
        return (
            <tr>
                <td colSpan={5}>
                    <DocumentForm 
                        template={doc}
                        values={{
                            name: doc.name ?? "",
                            type: doc.type ?? "",
                            required: doc.required ?? false,
                            files: null,
                        }} 
                        onDone={() => setEditing(false)}
                    />
                </td>
            </tr>
        );
    }
    else {
        return (
            <tr>
                <td>{doc.name}</td>
                <td>
                    <code className="small">{doc.filepath?.split('/').pop() ?? "No file name"}</code>
                </td>
                <td>
                    {typestr}
                </td>
                <td>
                    {doc.required ? "Yes" : "No"}
                </td>
                <td>
                    <div className="d-flex justify-content-end">
                        <Button
                            variant="link"
                            className="text-primary"
                            onClick={() => handleViewDocument(doc.filepath ?? "")}
                            title="View"
                        >
                            <FontAwesomeIcon icon={faEye} size="xs" />
                        </Button>
                        <Button
                            variant="link"
                            className="text-primary"
                            onClick={() => setEditing(true)}
                            title="Edit"
                        >
                            <FontAwesomeIcon style={{ border: 'none' }} icon={faEdit} size="xs" />
                        </Button>
                        {/* <ConfirmationModal
                        title="Confirm Delete"
                        show={deleteModalShow}
                        onClose={() => setDeleteModalShow(false)}
                        onConfirm={() => handleDeleteDocument()}
                        isLoading={isDeletingDocument}
                        confirmButtonText="Delete"
                        confirmButtonVariant="danger"
                        children={<p>Are you sure you want to delete this document?</p>}
                    /> */}
                    </div>
                </td>
            </tr>
        )
    }
}