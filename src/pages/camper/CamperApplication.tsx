
import { useContext, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Form } from "react-bootstrap";
import { ThinSpacer } from "../../components/ThinSpacer";
import { SpinnerButton } from "../../utils/button";
import { useUpdateProfileMutation, useUploadCamperApplicationMutation } from "../../queries/mutations";
import { emitToast, ToastType } from "../../utils/notifications";
import { AuthContext } from "../../App";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useCamperApplicationFilenameQuery } from "../../queries/queries";


type CamperApplicationFormType = {
    studentEssay: FileList | null;
}

export function CamperApplicationView() {

    // const { data: camperProfile, isSuccess, isLoading } = useCamperProfileQuery(authContext.attributes.sub);
    const [saving, setSaving] = useState(false);

    const authContext = useContext(AuthContext);
    const { data: appFilename } = useCamperApplicationFilenameQuery(authContext.attributes.sub);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<CamperApplicationFormType>();

    const uploadCamperApplicationMutation = useUploadCamperApplicationMutation();
    const updateCamperProfileMutation = useUpdateProfileMutation();
    
    
    const queryClient = useQueryClient();
    const navigate = useNavigate();

   

    const onSubmit: SubmitHandler<CamperApplicationFormType> = async (data: CamperApplicationFormType) => {
        setSaving(true);

        if (data.studentEssay && data.studentEssay.length > 0) {
            uploadCamperApplicationMutation.mutate(data.studentEssay[0], {
                onSettled: () => setSaving(false),
                onSuccess: () => {
                    updateCamperProfileMutation.mutate({
                        userSub: authContext.attributes.sub ?? "",
                        applicationComplete: true,
                    }, {
                        onSuccess: (data) => {
                            queryClient.setQueryData(['camperProfile', authContext.attributes.sub], data);
                            setTimeout(() => {
                                navigate('/camper/rotary-club-review');
                            }, 10);
                            emitToast("Application submitted", ToastType.Success);
                        }
                    });
                }
            });
        }
        else {
            emitToast("Essay is empty.", ToastType.Error);
        }
    }

    return (
        <div>
            {/* File upload form using react-hook-form and react-bootstrap */}
            <Form
                onSubmit={handleSubmit(onSubmit)}
            >
                <Form.Group>
                    <Form.Label>
                        Please upload an essay answering the following prompt:
                        <br />
                        <strong>What leadership strengths do you have and what would be your goals for
                            attending a 4-day outdoor leadership camp?</strong>
                    </Form.Label>
                    {appFilename && (
                        <div className="mb-2">
                            <small className="text-muted">
                                Previously uploaded: <strong>{appFilename}</strong>
                            </small>
                        </div>
                    )}
                    <Form.Control
                        type="file"
                        {...register("studentEssay", { required: true })}
                        accept=".pdf,.doc,.docx,.txt"
                        isInvalid={!!errors.studentEssay}
                    />
                    <Form.Control.Feedback type="invalid">
                        {appFilename ? "Please select a new file to replace the existing one." : "Student essay is required."}
                    </Form.Control.Feedback>
                </Form.Group>
                {/* <Form.Group>
                    <Form.Label>Letter of Recommendation</Form.Label>
                    <Form.Control
                        type="file"
                        {...register("letterOfRecommendation", { required: true })}
                        accept=".pdf,.doc,.docx,.txt"
                        isInvalid={!!errors.letterOfRecommendation}
                    />
                    <Form.Control.Feedback type="invalid">
                        Letter of recommendation is required.
                    </Form.Control.Feedback>
                </Form.Group> */}
                <ThinSpacer />
                <SpinnerButton
                    type="submit"
                    loading={saving}
                >
                    {appFilename ? "Update Application" : "Submit Application"}
                </SpinnerButton>
            </Form>
        </div>
    )
}