import { useContext, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button, Form, Row, Spinner } from "react-bootstrap";
import { ThinSpacer } from "../../components/ThinSpacer";
import { SpinnerButton } from "../../utils/button";
import { useUpdateProfileMutation, useUploadCamperApplicationMutation } from "../../queries/mutations";
import { emitToast, ToastType } from "../../utils/notifications";
import { AuthContext } from "../../App";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useCamperProfileQuery, useCamperYearQuery, useRecommendationQuery, useRotaryClubQuery } from "../../queries/queries";
import { TransferProgressEvent } from "aws-amplify/storage";
import { Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCircleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Req } from "./CamperProfile";
import { createFromISO, formatDateFullWithTime } from "../../utils/datetime";
import { FileInputGroup } from "../../components/forms";
import { EMAIL_REGEX } from "../constants";
import InputGroup from "react-bootstrap/InputGroup";
import { useCreateRecommendationMutation, useResendRecommendationLinkMutation, useUpdateRecommendationMutation } from "../../queries/mutations";
import { getCamperName, getFilepathFilename } from "../../utils/fields";
import { DateTime } from "luxon";


export function CamperApplicationView() {

    // const { data: camperProfile, isSuccess, isLoading } = useCamperProfileQuery(authContext.attributes.sub);
    const [saving, setSaving] = useState(false);

    const authContext = useContext(AuthContext);
    const { data: camperProfile } = useCamperProfileQuery(authContext.attributes.sub);
    const { data: camperYear } = useCamperYearQuery();

    const { data: rotaryClub, isPending: isRotaryClubPending, isError: isRotaryClubError } = useRotaryClubQuery(camperProfile?.rotaryClubId);
    const updateCamperProfileMutation = useUpdateProfileMutation();

    const startDate = useMemo(() => createFromISO(camperYear?.startDate ?? ""), [camperYear?.startDate]);
    const endDate = useMemo(() => createFromISO(camperYear?.endDate ?? ""), [camperYear?.endDate]);
    const medicalFormDeadline = useMemo(() => createFromISO(camperYear?.medicalFormDeadline ?? ""), [camperYear?.medicalFormDeadline]);
    const numDays = useMemo(() => Math.round(endDate.diff(startDate, 'days').toObject().days ?? 0) + 1, [startDate, endDate]);

    const applicationDeadline = useMemo(() => createFromISO(camperYear?.applicationDeadline ?? ""), [camperYear?.applicationDeadline]);
    const appDeadlinePassed = useMemo(() => applicationDeadline.diffNow().toMillis() < 0, [applicationDeadline]);

    const { data: rec } = useRecommendationQuery(authContext.attributes.sub);

    const applicationFilename = getFilepathFilename(camperProfile?.applicationFilepath);

    const medformDateTimeStr = useMemo(() => {
        if (medicalFormDeadline.isValid) {
            return formatDateFullWithTime(medicalFormDeadline);
        }
        else {
            return null;
        }
    }, [medicalFormDeadline]);

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const form = useForm<any>();
    const { handleSubmit } = form;

    const onSubmit: SubmitHandler<any> = async () => {
        console.log("submitting application");
        setSaving(true);
        const submissionDate = DateTime.now().toISO();

        console.log("submissionDate", submissionDate);

        if(appDeadlinePassed) {
            emitToast("Application deadline has passed", ToastType.Error);
            setSaving(false);
            return;
        }

        updateCamperProfileMutation.mutate({
            userSub: authContext.attributes.sub ?? "",
            applicationComplete: true,
            applicationSubmittedAt: camperProfile?.applicationSubmittedAt ?? submissionDate
        }, {
            onSuccess: () => {
                
                emitToast("Application submitted", ToastType.Success);
            },
            onSettled: () => {
                setSaving(false);
                queryClient.invalidateQueries({ queryKey: ['camperProfile', authContext.attributes.sub] });
                setTimeout(() => {
                    navigate('/camper/rotary-club-review');
                }, 100);
            },
            onError: (error) => {
                emitToast(`Error submitting application: ${error.message}`, ToastType.Error);
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

            <h5>Application File</h5>
            <ThinSpacer />
            <ApplicationGroup />

            <h5>Letter of Recommendation</h5>
            <ThinSpacer />
            <RecommendationGroup />

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
                                    and needs to be completed and mailed to RYLA {medformDateTimeStr ? `by ${medformDateTimeStr}` : ''}
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
                    disabled={ 
                        isRotaryClubPending 
                        || appDeadlinePassed
                        || isRotaryClubError 
                        || (!rec && !!rotaryClub?.requiresLetterOfRecommendation)
                        || (!applicationFilename && !!rotaryClub?.requiresApplication)}
                >
                    Submit Application
                </SpinnerButton>
            </Form>
        </div >
    )
}


function ApplicationGroup() {
    const authContext = useContext(AuthContext);
    const { data: camperProfile } = useCamperProfileQuery(authContext.attributes.sub);
    const { data: rotaryClub, isError: isRotaryClubError } = useRotaryClubQuery(camperProfile?.rotaryClubId);
    const uploadCamperApplicationMutation = useUploadCamperApplicationMutation();
    const queryClient = useQueryClient();

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

    if (isRotaryClubError) {
        return <Alert variant="danger">Error loading rotary club details. Please try again later.</Alert>;
    }
    else if (rotaryClub && rotaryClub.requiresApplication) {
        return (
            <>
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
                <br />
            </>
        );
    }
    else if (rotaryClub && !rotaryClub.requiresApplication) {
        return <p>Your rotary club does not require an application.</p>;
    }
    else {
        return null;
    }
}

type RecommendationFormData = {
    recommenderEmailAddress: string;
}

function RecommendationGroup() {
    const authContext = useContext(AuthContext);
    const { data: camperProfile } = useCamperProfileQuery(authContext.attributes.sub);
    const { data: rotaryClub, isPending: isRotaryClubPending, isError: isRotaryClubError } = useRotaryClubQuery(camperProfile?.rotaryClubId);
    const { data: primaryRecommendation, isPending: isRecPending, isError: isRecError } = useRecommendationQuery(authContext.attributes.sub);

    const { mutate: createRecommendation, isPending: isCreateRecommendationPending } = useCreateRecommendationMutation();
    const { mutate: updateRecommendation, isPending: isUpdateRecommendationPending } = useUpdateRecommendationMutation();
    const { mutate: resendRecommendationLink, isPending: isResendRecommendationLinkPending } = useResendRecommendationLinkMutation();

    const [changingEmail, setChangingEmail] = useState(false);

    const queryClient = useQueryClient();

    const recommendationForm = useForm<RecommendationFormData>({
        values: {
            recommenderEmailAddress: primaryRecommendation?.emailAddress ?? ""
        }
    });

    const onRecommendationSubmit: SubmitHandler<RecommendationFormData> = async (data) => {
        if (!isRecError && !primaryRecommendation) {
            createRecommendation({
                camperUserSub: authContext.attributes.sub,
                emailAddress: data.recommenderEmailAddress,
                name: getCamperName(camperProfile)
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['recommendation', authContext.attributes.sub] });
                    emitToast("Recommendation link sent", ToastType.Success);
                },
                onSettled: () => setChangingEmail(false)
            });
        }
        else if (primaryRecommendation) {
            updateRecommendation({
                rec: {
                    id: primaryRecommendation.id,
                    emailAddress: data.recommenderEmailAddress,
                },
                name: getCamperName(camperProfile),
                oldPath: primaryRecommendation.filepath
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['recommendation', authContext.attributes.sub] });
                    emitToast("Recommendation email updated", ToastType.Success);
                },
                onSettled: () => setChangingEmail(false)
            });
        }
    }

    if (isRecPending || isRotaryClubPending) {
        return <Spinner animation="border" />;
    }
    else if (rotaryClub?.requiresLetterOfRecommendation && !isRotaryClubError && !isRecError) {
        if (primaryRecommendation && !changingEmail) {
            return <div>
                <p>A link to upload the letter has already been provided to {primaryRecommendation.emailAddress}</p>
                <p>Status: {primaryRecommendation.filepath ? 
                    <span className="text-success">
                        <FontAwesomeIcon icon={faCheck} className="me-1" />
                        Submitted
                    </span> : 
                    <span className="text-danger">
                        <FontAwesomeIcon icon={faXmark} className="me-1" />
                        Missing
                    </span>}</p>
                <div className="d-flex gap-2">
                    <SpinnerButton
                        variant="primary"
                        loading={isResendRecommendationLinkPending || isUpdateRecommendationPending}
                        onClick={() => {
                            resendRecommendationLink({
                                recId: primaryRecommendation.id,
                                emailAddress: primaryRecommendation.emailAddress,
                                name: getCamperName(camperProfile)
                            },
                                {
                                    onSuccess: () => {
                                        queryClient.invalidateQueries({ queryKey: ['recommendations', authContext.attributes.sub] });
                                        emitToast("Recommendation link resent", ToastType.Success);
                                    }
                                }
                            );
                        }}
                    >
                        Resend Link
                    </SpinnerButton>
                    <Button variant="light"
                        onClick={() => setChangingEmail(true)}
                        disabled={isResendRecommendationLinkPending}
                    >
                        Change Email
                    </Button>
                </div>
                <br />
            </div>;
        }
        else {
            return (
                <>
                    <p>
                        Your rotary club requires a letter of recommendation.
                        Please provide the email address of a recommender who will receive an email with a link to submit their letter.
                    </p>
                    <Form onSubmit={recommendationForm.handleSubmit(onRecommendationSubmit)}>

                        <InputGroup>
                            <Form.Control
                                type="email"
                                placeholder="Enter an email address"
                                isInvalid={!!recommendationForm.formState.errors.recommenderEmailAddress}
                                {...recommendationForm.register("recommenderEmailAddress", {
                                    pattern: EMAIL_REGEX,
                                    required: true
                                })}
                            />

                            <SpinnerButton
                                type="submit"
                                variant="primary"
                                loading={isCreateRecommendationPending || isUpdateRecommendationPending}
                                disabled={recommendationForm.watch("recommenderEmailAddress") === primaryRecommendation?.emailAddress}
                            >
                                {changingEmail ? 'Update' : 'Send Link'}
                            </SpinnerButton>
                            {changingEmail && (
                                <Button
                                    variant="danger"
                                    disabled={isUpdateRecommendationPending}
                                    onClick={() => setChangingEmail(false)}
                                >
                                    Cancel
                                </Button>
                            )}
                            <Form.Control.Feedback type="invalid">
                                Please enter a valid email address.
                            </Form.Control.Feedback>
                        </InputGroup>

                    </Form>
                    <br />
                </>
            )
        }
    }
    else if (isRotaryClubError || isRecError) {

        return <Alert variant="danger">Error loading recommendation details. Please try again later.</Alert>;
    }
    else {
        return <p>Your rotary club does not require a letter of recommendation.</p>;
    }
}