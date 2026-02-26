
import { useSearchParams } from "react-router";
import { useRecommendationUnauthenticatedQuery } from "../queries/queries";
import { Alert, Container, Form, Spinner } from "react-bootstrap";
import { ThinSpacer } from "../components/ThinSpacer";
import { useForm } from "react-hook-form";
import { EMAIL_REGEX } from "./constants";
import { FileInputGroup } from "../components/forms";
import { useSubmitRecommendationUnauthenticatedMutation } from "../queries/mutations";
import { emitToast, ToastType } from "../utils/notifications";
import { TransferProgressEvent } from "aws-amplify/storage";
import { useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export function SubmitRecommendationPage() {
    const [searchParams, _] = useSearchParams();

    const recId = searchParams.get("id");
    const queryClient = useQueryClient();

    const { data: recommendation, isPending: isPendingRecommendation, isError: isErrorRecommendation } = useRecommendationUnauthenticatedQuery(recId);

    const {
        mutate: submitRecommendation,
        isPending: isPendingSubmitRecommendation
    } = useSubmitRecommendationUnauthenticatedMutation(recommendation?.id, recommendation?.camperUserSub);

    const recForm = useForm<{ emailAddress: string }>({
    });

    const submitHandler = (file: File, onProgress?: (event: TransferProgressEvent) => void, onSettled?: () => void) => {
        submitRecommendation({
            file,
            onProgress
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['recommendation', recommendation?.id] });
                emitToast("Recommendation submitted", ToastType.Success);
            },
            onSettled: () => {
                onSettled?.()
            }
        });
    }

    if (isPendingRecommendation) {
        return <Spinner animation="border" />;
    }
    else if (isErrorRecommendation) {
        return <Alert variant="danger">Error loading recommendation. Please try again later or ask the camper to resend the link.</Alert>;
    }
    else if (!recommendation) {
        return <Alert variant="danger">Request does not exist. Please contact the camper to resend the link.</Alert>;
    }

    return (
        <Container>
            <h4>Submit Recommendation</h4>
            <ThinSpacer />
            <Form>
                <Form.Group>
                    <Form.Label>Please provide the email address to whom the link was sent to continue.</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter email address"
                        {...recForm.register("emailAddress", { required: true, pattern: EMAIL_REGEX })}
                        isInvalid={!!recForm.formState.errors.emailAddress}
                    />
                    <Form.Control.Feedback type="invalid">
                        Please enter a valid email address.
                    </Form.Control.Feedback>
                </Form.Group>
            </Form>
            {recForm.watch("emailAddress")?.toLowerCase() === recommendation?.emailAddress?.toLowerCase() && (
                <>
                    <ThinSpacer />
                    <p>You are submitting a recommendation for {recommendation?.camperName}. Please upload your letter of recommendation as a PDF file below.</p>
                    <FileInputGroup filepath={recommendation?.filepath} submitHandler={submitHandler} isPending={isPendingSubmitRecommendation} />
                    <br/>
                    {recommendation?.filepath && (
                        <Alert variant="success">
                            <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                            Recommendation submitted. You may now close this page.
                        </Alert>
                    )}
                </>
            )}
        </Container>
    )
}