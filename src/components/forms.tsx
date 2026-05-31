import { Form, ProgressBar } from "react-bootstrap";
import { useUrlToDocumentQuery } from "../queries/queries";
import { useForm } from "react-hook-form";
import { useCallback, useEffect, useState, ReactNode } from "react";
import { TransferProgressEvent } from "aws-amplify/storage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons";

// interface TextInputGroupProps<T extends FieldValues> {
//     key: string;
//     register: UseFormRegister<T>;
//     errors: FieldErrors<T>;
// }

// export function TextInputGroup({ label, name, register, errors }: TextInputGroupProps<T>) {
//     return (
//         <Form.Group className="form-group">
//             <Form.Label>First Name</Form.Label>
//             <Form.Control type="text" {...register("firstName", { required: true })} isInvalid={!!errors.firstName} />
//             <Form.Control.Feedback type="invalid">
//                 Please enter a first name.
//             </Form.Control.Feedback>
//         </Form.Group>
//     );
// }

type DocumentUploadForm = {
    file: FileList | null;
}

interface FileInputGroupProps {
    filepath?: string | null;
    submitHandler: (file: File, onProgress?: (event: TransferProgressEvent) => void, onSettled?: () => void) => void;
    deleteCallback?: () => void;
    isPending: boolean;
    isAdmin?: boolean;
    defaultViewFile?: boolean;
    children?: ReactNode;
}

export function FileInputGroup({ filepath, submitHandler, isPending, isAdmin, defaultViewFile, children }: FileInputGroupProps) {
    const [isResubmitting, setIsResubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const { data: urlToUploadedDocument } = useUrlToDocumentQuery(filepath ?? "");

    const { register, watch } = useForm<DocumentUploadForm>();

    const fileWatch = watch("file");

    const handleUploadProgress = useCallback((event: TransferProgressEvent) => {
        const { transferredBytes, totalBytes } = event;

        if (totalBytes) {
            const progress = (transferredBytes / totalBytes) * 100;
            setUploadProgress(progress);
        }
    }, [setUploadProgress]);

    const onSettled = () => {
        setIsResubmitting(false);
        setUploadProgress(0);
    }

    useEffect(() => {
        if(fileWatch && fileWatch.length > 0) {
            submitHandler(fileWatch[0], handleUploadProgress, onSettled);
        }
    }, [fileWatch]);

    let uploadButton = (
        <div className="d-flex align-items-center gap-3">
            <a href="#" title="Upload/Replace" onClick={(e) => { e.preventDefault(); setIsResubmitting(true); }}><FontAwesomeIcon icon={faArrowUpFromBracket} /></a>
            {/* <a href="#" title="Delete" onClick={(e) => { e.preventDefault(); deleteCallback?.(); }}>
                <FontAwesomeIcon icon={faXmark}/>
            </a> */}
            {children}
        </div>
    );

    if (filepath && !isResubmitting && !isPending) {
        return <div className="text-muted flex-grow-1 d-flex gap-2 align-items-center justify-content-between"> 
            <a href={urlToUploadedDocument} target="_blank">{filepath?.split("/").pop()}</a> 
            {isAdmin && uploadButton}
        </div>;
    }
    

    if((isResubmitting || defaultViewFile) && isAdmin) {
        return (
            <Form>
                <div className="d-flex align-items-center justify-content-between gap-2 flex-grow-1">
                    <div>
                        <Form.Control
                            accept=".pdf,.doc,.docx"
                            type="file"
                            size="sm" {...register("file")}
                        />
                        {uploadProgress > 0 && <ProgressBar now={uploadProgress} label={`${uploadProgress.toFixed(0)}%`} />}
                    </div>
                    
                    {isResubmitting && <div className="text-muted">
                        <a href="#" onClick={(e) => { e.preventDefault(); setIsResubmitting(false); }}>Cancel</a> 
                    </div>}
                </div>
            </Form>
        );
    }

    return (
        <div className="text-danger flex-grow-1 d-flex align-items-center justify-content-between">
            <div>
                {/* <FontAwesomeIcon icon={faXmark} className="me-1" /> */}
                Missing
            </div>
            {isAdmin && uploadButton}
        </div>
    );
}