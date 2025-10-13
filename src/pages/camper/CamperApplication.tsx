import { useContext, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Form, Row, Spinner } from "react-bootstrap";
import { ThinSpacer } from "../../components/ThinSpacer";
import { SpinnerButton } from "../../utils/button";
import { useUpdateProfileMutation, useUploadCamperApplicationMutation } from "../../queries/mutations";
import { emitToast, ToastType } from "../../utils/notifications";
import { AuthContext } from "../../App";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useCamperProfileQuery, useCamperYearQuery, useRotaryClubQuery } from "../../queries/queries";
import { TransferProgressEvent } from "aws-amplify/storage";
import { Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { Req } from "./CamperProfile";
import { createFromISO, formatDateFullWithTime } from "../../utils/datetime";
import { FileInputGroup } from "../../components/forms";


export function CamperApplicationView() {

    // const { data: camperProfile, isSuccess, isLoading } = useCamperProfileQuery(authContext.attributes.sub);
    const [saving, setSaving] = useState(false);

    const authContext = useContext(AuthContext);
    const { data: camperProfile } = useCamperProfileQuery(authContext.attributes.sub);
    const { data: camperYear } = useCamperYearQuery(camperProfile ?? null);

    const { data: rotaryClub, isPending: isRotaryClubPending, isError: isRotaryClubError } = useRotaryClubQuery(camperProfile?.rotaryClubId);

    const uploadCamperApplicationMutation = useUploadCamperApplicationMutation();
    const updateCamperProfileMutation = useUpdateProfileMutation();

    const startDate = useMemo(() => createFromISO(camperYear?.startDate ?? ""), [camperYear?.startDate]);
    const endDate = useMemo(() => createFromISO(camperYear?.endDate ?? ""), [camperYear?.endDate]);
    const applicationDeadline = useMemo(() => createFromISO(camperYear?.applicationDeadline ?? ""), [camperYear?.applicationDeadline]);
    const medicalFormDeadline = useMemo(() => createFromISO(camperYear?.medicalFormDeadline ?? ""), [camperYear?.medicalFormDeadline]);
    const numDays = useMemo(() => Math.round(endDate.diff(startDate, 'days').toObject().days ?? 0) + 1, [startDate, endDate]);

    const appDeadlinePassed = useMemo(() => applicationDeadline.diffNow().toMillis() < 0, [applicationDeadline]);


    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const form = useForm<any>();
    const { handleSubmit } = form;

    const onSubmit: SubmitHandler<any> = async () => {
        console.log("submitting application");
        setSaving(true);
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
            },
            onSettled: () => setSaving(false),
            onError: (error) => {
                emitToast(`Error submitting application: ${error.message}`, ToastType.Error);
            }
        });
    }

    const applicationUploadHandler = (file: File, onProgress?: (event: TransferProgressEvent) => void, onSettled?: () => void) => {
        uploadCamperApplicationMutation.mutate({ file, userSub: authContext.attributes.sub, onProgress }, {
            onSettled: () => onSettled?.(),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['camperProfile', authContext.attributes.sub] });
                emitToast("Application uploaded", ToastType.Success);
            },
            onError: (error) => {
                emitToast(`Error uploading application: ${error.message}`, ToastType.Error);
            }
        });
    }

    if (isRotaryClubPending) {
        return <Spinner animation="border" />;
    }

    if (isRotaryClubError) {
        return <Alert variant="danger">Error loading details for your rotary club. Please try again later.</Alert>;
    }

    return (
        <div>

            {rotaryClub?.requiresApplication &&

                <>
                    <h5>Application File</h5>
                    <ThinSpacer />
                    <p>
                        Your rotary club requires an application. Please upload an essay answering the following prompt:
                        <br />
                        <strong>What leadership strengths do you have and what would be your goals for
                            attending a 4-day outdoor leadership camp?</strong>
                    </p>
                    <FileInputGroup
                        filepath={camperProfile?.applicationFilepath}
                        submitHandler={applicationUploadHandler}
                        isPending={uploadCamperApplicationMutation.isPending}
                    />
                    <br/>
                </>
            }
            <h5>Acknowledgements</h5>
            <ThinSpacer />
            <Alert variant="warning">
                <FontAwesomeIcon icon={faCircleExclamation} style={{ marginRight: 10 }} />
                <strong>Students: Please read the following information carefully</strong>
            </Alert>
            <Form
                onSubmit={handleSubmit(onSubmit)}
            >
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
                    disabled={appDeadlinePassed || isRotaryClubPending || isRotaryClubError}
                >
                    Submit Application
                </SpinnerButton>
            </Form>
        </div>
    )
}