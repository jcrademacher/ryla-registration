import { Container, ListGroup, Spinner, Alert, Placeholder, Badge } from "react-bootstrap";
import { useActiveCampQuery, useDocumentTemplatesByCampQuery, useUrlToDocumentQuery } from "../queries/queries";
import { createFromISO } from "../utils/datetime";
import { DocumentTemplateSchemaType } from "../api/apiDocuments";
import { DateTime } from "luxon";

export function CampInfoPage() {
    const { data: camp, isPending: isPendingActiveCamp } = useActiveCampQuery();
    const { data: documentTemplates, isLoading: templatesLoading } = useDocumentTemplatesByCampQuery(camp?.id);

    if (isPendingActiveCamp) {
        return (
            <Container className="mt-4">
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" role="status" />
                </div>
            </Container>
        );
    }

    if (!camp) {
        return (
            <Container className="mt-4">
                <Alert variant="info">
                    No active camp information available at this time.
                </Alert>
            </Container>
        );
    }

    const startDate = createFromISO(camp.startDate);
    const endDate = createFromISO(camp.endDate);
    const applicationOpenDate = createFromISO(camp.applicationOpenDate);
    const applicationDeadline = createFromISO(camp.applicationDeadline);
    const medicalFormDeadline = camp.medicalFormDeadline ? createFromISO(camp.medicalFormDeadline) : null;

    return (
        <Container>
            <h3>{camp.name || "Camp Information"}</h3>

            <h5 className="mt-4 mb-3">Important Dates</h5>
            <ListGroup className="mb-4">
                <ListGroup.Item>
                    <strong>Camp Dates:</strong> {startDate.toLocaleString(DateTime.DATETIME_MED)} - {endDate.toLocaleString(DateTime.DATETIME_MED)}
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Drop Off:</strong> {startDate.toLocaleString(DateTime.DATETIME_MED)}
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Pick Up:</strong> {endDate.toLocaleString(DateTime.DATETIME_MED)}
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Application Open Date:</strong> {applicationOpenDate.toLocaleString(DateTime.DATETIME_MED)}
                </ListGroup.Item>
                <ListGroup.Item>
                    <strong>Application Deadline:</strong> {applicationDeadline.toLocaleString(DateTime.DATETIME_MED)}
                </ListGroup.Item>
                {medicalFormDeadline && (
                    <ListGroup.Item>
                        <strong>Medical Form Deadline:</strong> {medicalFormDeadline.toLocaleString(DateTime.DATETIME_MED)}
                    </ListGroup.Item>
                )}
            </ListGroup>

            <h5 className="mt-4 mb-3">Camp Forms & Documents</h5>
            <p>
                These documents are set by camp directors and given to campers automatically through this system upon acceptance by rotary clubs. 
            </p>
            {templatesLoading ? (
                <Placeholder as="div" animation="glow">
                    <Placeholder xs={6} className="mb-2" />
                    <Placeholder xs={8} />
                </Placeholder>
            ) : documentTemplates && documentTemplates.length > 0 ? (
                <ListGroup>
                    {documentTemplates.map((template) => (
                        <DocumentTemplateItem key={template.id} template={template} />
                    ))}
                </ListGroup>
            ) : (
                <p className="text-muted">None available.</p>
            )}
        </Container>
    );
}

interface DocumentTemplateItemProps {
    template: DocumentTemplateSchemaType;
}

function DocumentTemplateItem({ template }: DocumentTemplateItemProps) {
    const { data: documentUrl, isLoading } = useUrlToDocumentQuery(template.filepath);

    if (isLoading) {
        return (
            <ListGroup.Item>
                <Spinner animation="border" role="status" size="sm" /> {template.name || "Loading..."}
            </ListGroup.Item>
        );
    }

    const getTypeLabel = (type?: string | null) => {
        switch (type) {
            case "viewonly":
                return { text: "View only", variant: "secondary" };
            case "upload":
                return { text: "Can be uploaded", variant: "info" };
            case "mail":
                return { text: "Must be mailed", variant: "primary" };
            default:
                return null;
        }
    };

    const typeLabel = getTypeLabel(template.type);

    return (
        <ListGroup.Item className="d-flex justify-content-between align-items-center">
            <div>
                {documentUrl ? (
                    <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                        {template.name || "Untitled Document"}
                    </a>
                ) : (
                    <span className="text-muted">{template.name || "Untitled Document"}</span>
                )}
            </div>
            <div className="d-flex gap-2">
                {template.required && (
                    <Badge bg="danger">Required</Badge>
                )}
                {typeLabel && (
                    <Badge bg={typeLabel.variant}>{typeLabel.text}</Badge>
                )}
            </div>
        </ListGroup.Item>
    );
}

