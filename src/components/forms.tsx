import { Form, ProgressBar } from "react-bootstrap";
import { useUrlToDocumentQuery } from "../queries/queries";
import { useForm } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { TransferProgressEvent } from "aws-amplify/storage";

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
    isPending: boolean;
}

export function FileInputGroup({ filepath, submitHandler, isPending }: FileInputGroupProps) {
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

    if (filepath && !isResubmitting && !isPending) {
        return <small className="text-muted"> 
            <a href={urlToUploadedDocument} target="_blank">{filepath?.split("/").pop()}</a> (<a href="#" onClick={() => setIsResubmitting(true)}>Replace</a>)
            <br/>
        </small>;
    }
    return (
        <Form>
            <div className="d-flex align-items-center gap-2">
                <div>
                    <Form.Control
                        accept=".pdf,.doc,.docx"
                        type="file"
                        size="sm" {...register("file")}
                    />
                    {uploadProgress > 0 && <ProgressBar now={uploadProgress} label={`${uploadProgress.toFixed(0)}%`} />}
                </div>
                
                {isResubmitting && <small className="text-muted">
                    <a href="#" onClick={() => setIsResubmitting(false)}>Cancel</a> 
                </small>}
            </div>
        </Form>
    );
}