import { useCallback, useContext, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Form, Row } from "react-bootstrap";
import { ThinSpacer } from "../../components/ThinSpacer";
import { SpinnerButton } from "../../utils/button";
import { useUpdateProfileMutation, useUploadCamperApplicationMutation } from "../../queries/mutations";
import { emitToast, ToastType } from "../../utils/notifications";
import { AuthContext } from "../../App";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useCamperProfileQuery, useCamperYearQuery } from "../../queries/queries";
import ProgressBar from 'react-bootstrap/ProgressBar';
import { TransferProgressEvent } from "aws-amplify/storage";
import { Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { Req } from "./CamperProfile";
import { createFromISO, formatDateFullWithTime } from "../../utils/datetime";

type CamperApplicationFormType = {
    studentEssay: FileList | null;
}

export function CamperApplicationView() {

    // const { data: camperProfile, isSuccess, isLoading } = useCamperProfileQuery(authContext.attributes.sub);
    const [saving, setSaving] = useState(false);

    const authContext = useContext(AuthContext);
    const { data: camperProfile } = useCamperProfileQuery(authContext.attributes.sub);
    const { data: camperYear } = useCamperYearQuery(camperProfile ?? null);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<CamperApplicationFormType>();

    const [uploadProgress, setUploadProgress] = useState(0);

    const handleUploadProgress = useCallback((event: TransferProgressEvent) => {
        const { transferredBytes, totalBytes } = event;

        if (totalBytes) {
            const progress = (transferredBytes / totalBytes) * 100;
            setUploadProgress(progress);
        }
    }, [setUploadProgress]);

    const uploadCamperApplicationMutation = useUploadCamperApplicationMutation(handleUploadProgress);
    const updateCamperProfileMutation = useUpdateProfileMutation();

    const startDate = useMemo(() => createFromISO(camperYear?.startDate ?? ""), [camperYear?.startDate]);
    const endDate = useMemo(() => createFromISO(camperYear?.endDate ?? ""), [camperYear?.endDate]);
    const applicationDeadline = useMemo(() => createFromISO(camperYear?.applicationDeadline ?? ""), [camperYear?.applicationDeadline]);
    const medicalFormDeadline = useMemo(() => createFromISO(camperYear?.medicalFormDeadline ?? ""), [camperYear?.medicalFormDeadline]);
    const numDays = useMemo(() => Math.round(endDate.diff(startDate, 'days').toObject().days ?? 0) + 1, [startDate, endDate]);

    const appDeadlinePassed = useMemo(() => applicationDeadline.diffNow().toMillis() < 0, [applicationDeadline]);


    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const onSubmit: SubmitHandler<CamperApplicationFormType> = async (data: CamperApplicationFormType) => {
        setSaving(true);

        if (data.studentEssay && data.studentEssay.length > 0) {
            uploadCamperApplicationMutation.mutate({ file: data.studentEssay[0], userSub: authContext.attributes.sub }, {
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

    const appFilename = useMemo(() => camperProfile?.applicationFilepath?.split("/").pop(), [camperProfile?.applicationFilepath]);

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
                    {uploadProgress > 0 && <><br /><ProgressBar now={uploadProgress} label={`${uploadProgress.toFixed(0)}%`} /></>}
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
                
                <br />
                <Alert variant="warning">
                    <FontAwesomeIcon icon={faCircleExclamation} style={{ marginRight: 10 }} />
                    <strong>Students: Please read the following information carefully</strong>
                </Alert>
                <Row>
                    <Form.Group>
                        <Form.Label as="strong">
                            Medical Form Acknowledgment
                        </Form.Label>
                        <Form.Check
                            type="checkbox"
                            required={true}
                            label={
                                <span>
                                    <Req />I acknowledge that I must fill out a medical form
                                    which I will receive in a welcome package in the
                                    upcoming weeks. This form will include any
                                    medication and/or allergies I may have and will also
                                    require completion by my primary care physician
                                    and needs to be completed and mailed to RYLA by
                                    {' ' + formatDateFullWithTime(medicalFormDeadline)}.
                                </span>
                            } />
                    </Form.Group>
                </Row>
                <br />
                <Row>
                    <Form.Group>
                        <Form.Label as="strong">
                            Scholarship Acknowledgment
                        </Form.Label>
                        <Form.Check
                            type="checkbox"
                            required={true}
                            label={
                                <span>
                                    <Req />I acknowledge that by signing I am applying for
                                    RYLA {startDate.year} and I am able to attend {numDays} full days:
                                    {' ' + formatDateFullWithTime(startDate)} to {formatDateFullWithTime(endDate)} and I acknowledge that I
                                    am receiving a full scholarship valued at $800 to
                                    attend camp.
                                </span>
                            } />
                    </Form.Group>
                </Row>
                <br />
                <Alert variant="warning">
                    <FontAwesomeIcon icon={faCircleExclamation} style={{ marginRight: 10 }} />
                    <strong>Parents: Please read the following information carefully</strong>
                </Alert>
                <Row>
                    <Form.Group>
                        <Form.Label as="strong">
                            STUDENT DROP OFF: {formatDateFullWithTime(startDate)}
                        </Form.Label>
                        <Form.Check
                            type="checkbox"
                            required={true}
                            label={
                                <span>
                                    <Req />Students arrive at {startDate.toFormat("h:mm a")} for drop off at Camp
                                    Hinds. We have a full system of registration that
                                    will allow for all students to register and
                                    begin camp within one hour.
                                </span>
                            } />
                    </Form.Group>
                </Row>
                <br />
                <Row>
                    <Form.Group>
                        <Form.Label as="strong">
                            STUDENT PICK UP: {formatDateFullWithTime(endDate)}
                        </Form.Label>
                        <Form.Check
                            type="checkbox"
                            required={true}
                            label={
                                <span>
                                    <Req />On {endDate.toFormat("EEEE, MMMM d")} there is a final BBQ
                                    and ceremony that begins at {endDate.toFormat("h:mm a")} and ends
                                    at {endDate.plus({ minutes: 75 }).toFormat("h:mm a")}. 
                                    Students may be picked up beginning at {endDate.toFormat("h:mm a")}.
                                    Tickets for the BBQ are $12.00,
                                    $20.00 for two, or $30.00 for three, etc.
                                    Student is covered by the scholarship.
                                </span>
                            } />
                    </Form.Group>
                </Row>
                <br />
                <Row>
                    <Form.Group>
                        <Form.Label as="strong">
                            Scholarship Acknowledgment
                        </Form.Label>
                        <Form.Check
                            type="checkbox"
                            required={true}
                            label={
                                <span>
                                    <Req />I acknowledge this student has
                                    applied for and will accept if granted a
                                    scholarship valued at ($800) to Rotary Youth
                                    Leadership Camp (RYLA) and will attend
                                    starting {formatDateFullWithTime(startDate)} through {formatDateFullWithTime(endDate)}.
                                </span>
                            } />
                    </Form.Group>
                </Row>
                <ThinSpacer />
                <SpinnerButton
                    type="submit"
                    loading={saving}
                    disabled={appDeadlinePassed}
                >
                    {appFilename ? "Update Application" : "Submit Application"}
                </SpinnerButton>
            </Form>
        </div>
    )
}