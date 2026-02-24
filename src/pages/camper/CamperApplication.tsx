import { useContext, useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Form, Placeholder, Row } from "react-bootstrap";
import { ThinSpacer } from "../../components/ThinSpacer";
import { SpinnerButton } from "../../utils/button";
import { useSubmitApplicationMutation, useUploadCamperApplicationMutation } from "../../queries/mutations";
import { emitToast, ToastType } from "../../utils/notifications";
import { AuthContext } from "../../App";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useCamperProfileQuery, useCamperYearQuery, useRecommendationsQuery, useRotaryClubQuery } from "../../queries/queries";
import { TransferProgressEvent } from "aws-amplify/storage";
import { Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCircleExclamation, faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Req } from "./CamperProfile";
import { createFromISO, formatDateFullWithTime } from "../../utils/datetime";
import { FileInputGroup } from "../../components/forms";
import { EMAIL_REGEX } from "../constants";
import InputGroup from "react-bootstrap/InputGroup";
import { useCreateRecommendationMutation, useResendRecommendationLinkMutation, useUpdateRecommendationMutation } from "../../queries/mutations";
import { getCamperName, getFilepathFilename } from "../../utils/fields";
import { DateTime } from "luxon";
import { formatDateFull } from "../../utils/datetime";


export function CamperApplicationView() {

    // const { data: camperProfile, isSuccess, isLoading } = useCamperProfileQuery(authContext.attributes.sub);

    const authContext = useContext(AuthContext);
    const { data: camperProfile, isPending: isPendingCamperProfile, isError: isErrorCamperProfile } = useCamperProfileQuery(authContext.attributes.sub);
    const { data: camperYear, isPending: isPendingCamperYear, isError: isErrorCamperYear } = useCamperYearQuery();

    const { data: rotaryClub, isPending: isPendingRotaryClub, isError: isErrorRotaryClub } = useRotaryClubQuery(camperProfile?.rotaryClubId);
    const { mutate: submitCamperApplication, isPending: isSubmittingCamperApplication } = useSubmitApplicationMutation();

    const startDate = useMemo(() => createFromISO(camperYear?.startDate ?? ""), [camperYear?.startDate]);
    const endDate = useMemo(() => createFromISO(camperYear?.endDate ?? ""), [camperYear?.endDate]);
    const medicalFormDeadline = useMemo(() => createFromISO(camperYear?.medicalFormDeadline ?? ""), [camperYear?.medicalFormDeadline]);
    const numDays = useMemo(() => Math.round(endDate.diff(startDate, 'days').toObject().days ?? 0) + 1, [startDate, endDate]);

    const applicationDeadline = useMemo(() => createFromISO(camperYear?.applicationDeadline ?? ""), [camperYear?.applicationDeadline]);
    const appDeadlinePassed = useMemo(() => applicationDeadline.diffNow().toMillis() < 0, [applicationDeadline]);

    const { data: recs } = useRecommendationsQuery(authContext.attributes.sub);

    const applicationFilename = getFilepathFilename(camperProfile?.applicationFilepath);

    const isPending = isPendingCamperProfile || isPendingCamperYear || isPendingRotaryClub;
    const isError = isErrorCamperProfile || isErrorCamperYear || isErrorRotaryClub;

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
        const submissionDate = DateTime.now().toISO();

        console.log("submissionDate", submissionDate);

        if(appDeadlinePassed) {
            emitToast(`Application deadline has passed. You may not modify your application materials after this date. 
                However, you can still update your profile and documents.`, ToastType.Error);
            return;
        }

        if(isErrorRotaryClub || isPendingRotaryClub) {
            emitToast("Error loading rotary club details. Please try again later.", ToastType.Error);
            return;
        }

        if((recs && recs.length < (rotaryClub?.numRequiredLetters ?? 0))) {
            emitToast("Missing recommendations. Please send links to at least " + (rotaryClub?.numRequiredLetters ?? 0) + " recommenders.", ToastType.Error);
            return;
        }

        if(!applicationFilename && !!rotaryClub?.requiresApplication) {
            emitToast("Missing application. Please upload an application.", ToastType.Error);
            return;
        }

        submitCamperApplication({ userSub: authContext.attributes.sub ?? "" }, {
            onSuccess: () => {
                
                emitToast("Application submitted", ToastType.Success);
            },
            onSettled: () => {
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

    if (isPending) {
        return (
            <div>
                <Placeholder as="h5" animation="glow">
                    <Placeholder xs={4} />
                </Placeholder>
                <Placeholder as="div" animation="glow">
                    <Placeholder xs={12} className="mb-2" />
                    <Placeholder xs={10} className="mb-2" />
                    <Placeholder xs={8} className="mb-2" />
                </Placeholder>
                <Placeholder as="h5" animation="glow" className="mt-3">
                    <Placeholder xs={5} />
                </Placeholder>
                <Placeholder as="div" animation="glow">
                    <Placeholder xs={11} className="mb-2" />
                    <Placeholder xs={6} className="mb-2" />
                </Placeholder>
                <Placeholder as="h5" animation="glow" className="mt-3">
                    <Placeholder xs={7} />
                </Placeholder>
                <Placeholder as="div" animation="glow">
                    <Placeholder xs={12} className="mb-2" />
                    <Placeholder xs={8} className="mb-2" />
                    <Placeholder xs={4} className="mb-2" />
                </Placeholder>
            </div>
        );
    }

    if (isError) {
        return (
            <Alert variant="danger">
                <FontAwesomeIcon icon={faTriangleExclamation} className="me-1" />
                <b>Error:</b> Failed to load application details. Please try again later.
            </Alert>
        );
    }

    return (
        <div>

            <h5>Application File</h5>
            <ThinSpacer />
            <ApplicationGroup />

            <h5>Letters of Recommendation</h5>
            <ThinSpacer />
            <RecommendationGroup />

            <h5>Acknowledgements</h5>
            <ThinSpacer />
            <p>You attest that the following information is true and accurate to the best of your knowledge.</p>
            <Alert variant="light">
            <div style={{ overflowX: 'auto' }}>
                <table className="camper-app-details-table-tbody">
                    <tbody>
                        <tr>
                            <th>Email</th>
                            <td>{camperProfile?.email || ''}</td>
                        </tr>
                        <tr>
                            <th>First Name</th>
                            <td>{camperProfile?.firstName || ''}</td>
                        </tr>
                        <tr>
                            <th>Middle Initial</th>
                            <td>{camperProfile?.middleInitial || ''}</td>
                        </tr>
                        <tr>
                            <th>Last Name</th>
                            <td>{camperProfile?.lastName || ''}</td>
                        </tr>
                        <tr>
                            <th>Nickname</th>
                            <td>{camperProfile?.nickname || ''}</td>
                        </tr>
                        <tr>
                            <th>Date of Birth</th>
                            <td>{camperProfile?.birthdate ? formatDateFull(createFromISO(camperProfile?.birthdate)) : ''}</td>
                        </tr>
                        <tr>
                            <th>Gender</th>
                            <td>{camperProfile?.gender || ''}</td>
                        </tr>
                        <tr>
                            <th>High School</th>
                            <td>{camperProfile?.highSchool || ''}</td>
                        </tr>
                        <tr>
                            <th>Rotary Club</th>
                            <td>{rotaryClub?.name || 'None'}</td>
                        </tr>
                        
                        <tr>
                            <th>Phone</th>
                            <td>{camperProfile?.phone || ''}</td>
                        </tr>
                        <tr>
                            <th>Address</th>
                            <td>{camperProfile?.address || ''}
                                <br/>
                                {camperProfile?.city || ''} {camperProfile?.state || ''} {camperProfile?.zipcode || ''}
                            </td>
                        </tr>

                        <tr>
                            <td colSpan={2}>
                                <hr/>
                            </td>
                        </tr>
                        
                        <tr>
                            <th>Parent 1 Name</th>
                            <td>{[camperProfile?.parent1FirstName, camperProfile?.parent1LastName].filter(Boolean).join(' ') || ''}</td>
                        </tr>
                        <tr>
                            <th>Parent 1 Email</th>
                            <td>{camperProfile?.parent1Email || ''}</td>
                        </tr>
                        <tr>
                            <th>Parent 1 Phone</th>
                            <td>{camperProfile?.parent1Phone || ''}</td>
                        </tr>
                        <br/>
                        <tr>
                            <th>Parent 2 Name</th>
                            <td>{[camperProfile?.parent2FirstName, camperProfile?.parent2LastName].filter(Boolean).join(' ') }</td>
                        </tr>
                        <tr>
                            <th>Parent 2 Email</th>
                            <td>{camperProfile?.parent2Email }</td>
                        </tr>
                        <tr>
                            <th>Parent 2 Phone</th>
                            <td>{camperProfile?.parent2Phone }</td>
                        </tr>
                        <br/>
                        <tr>
                            <th>Emergency Contact Name</th>
                            <td>{camperProfile?.emergencyContactName || ''}</td>
                        </tr>
                        <tr>
                            <th>Emergency Contact Phone</th>
                            <td>{camperProfile?.emergencyContactPhone || ''}</td>
                        </tr>
                        <tr>
                            <th>Emergency Contact Relationship</th>
                            <td>{camperProfile?.emergencyContactRelationship || ''}</td>
                        </tr>
                        <br/>
                        <tr>
                            <th>Guidance Counselor Name</th>
                            <td>{camperProfile?.guidanceCounselorName || ''}</td>
                        </tr>
                        <tr>
                            <th>Guidance Counselor Email</th>
                            <td>{camperProfile?.guidanceCounselorEmail || ''}</td>
                        </tr>
                        <tr>
                            <th>Guidance Counselor Phone</th>
                            <td>{camperProfile?.guidanceCounselorPhone || ''}</td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <hr/>
                            </td>
                        </tr>
                        <tr>
                            <th>Dietetary Restrictions</th>
                            <td>{camperProfile?.dietaryRestrictions || ''}</td>
                        </tr>
                        
                        <tr>
                            <th>Dietary Restrictions Notes</th>
                            <td>{camperProfile?.dietaryRestrictionsNotes || ''}</td>
                        </tr>
                        <tr>
                            <th>T-Shirt Size</th>
                            <td>{camperProfile?.tshirtSize || ''}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            </Alert>
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
                    loading={isSubmittingCamperApplication}
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
    else {
        return <p>Your rotary club does not require an application.</p>;
    }
}

type RecommendationFormData = {
    recommenderEmailAddress: string;
}

const RecommendationSlot = ({ 
    index, 
    recommendation, 
    camperName 
}: { 
    index: number;
    recommendation: any | undefined;
    camperName: string;
}) => {
    const { mutate: createRecommendation, isPending: isCreatePending } = useCreateRecommendationMutation();
    const { mutate: updateRecommendation, isPending: isUpdatePending } = useUpdateRecommendationMutation();
    const { mutate: resendRecommendationLink, isPending: isResendPending } = useResendRecommendationLinkMutation();
    const queryClient = useQueryClient();
    const authContext = useContext(AuthContext);

    const form = useForm<RecommendationFormData>({
        values: {
            recommenderEmailAddress: recommendation?.emailAddress ?? ""
        }
    });

    const onSubmit: SubmitHandler<RecommendationFormData> = async (data) => {
        if (recommendation) {
            // Update existing recommendation
            updateRecommendation({
                rec: {
                    id: recommendation.id,
                    emailAddress: data.recommenderEmailAddress,
                },
                name: camperName,
                oldPath: recommendation.filepath
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['recommendations', authContext.attributes.sub] });
                    emitToast("Recommendation email updated and link sent", ToastType.Success);
                }
            });
        } else {
            // Create new recommendation
            createRecommendation({
                camperUserSub: authContext.attributes.sub,
                emailAddress: data.recommenderEmailAddress,
                name: camperName
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['recommendations', authContext.attributes.sub] });
                    emitToast("Recommendation link sent", ToastType.Success);
                }
            });
        }
    };

    const handleResend = () => {
        if (recommendation) {
            resendRecommendationLink({
                recId: recommendation.id,
                emailAddress: recommendation.emailAddress,
                name: camperName
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['recommendations', authContext.attributes.sub] });
                    emitToast("Recommendation link resent", ToastType.Success);
                }
            });
        }
    };

    const linkSent = !!recommendation;
    const letterReceived = !!recommendation?.filepath;
    const hasEmail = !!form.watch("recommenderEmailAddress");
    const emailChanged = recommendation && form.watch("recommenderEmailAddress") !== recommendation.emailAddress;
    const isPending = isCreatePending || isUpdatePending || isResendPending;

    return (
        <div className="mb-3" style={{ marginLeft: '2rem' }}>
            <div className="d-flex align-items-center gap-2">
                <div>
                    <div style={{ minWidth: '70px', fontSize: '0.9rem', fontWeight: 500 }}>
                        Letter {index + 1}
                    </div>
                    {linkSent && (
                        <div style={{ fontSize: '0.75rem', color: letterReceived ? '#28a745' : '#6c757d' }}>
                            {letterReceived ? (
                                <>
                                    <FontAwesomeIcon icon={faCheck} />
                                    <span className="ms-1">Received</span>
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faXmark} />
                                    <span className="ms-1">Pending</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <Form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow-1">
                    <InputGroup size="sm">
                        <Form.Control
                            type="email"
                            placeholder="Enter recommender's email address"
                            isInvalid={!!form.formState.errors.recommenderEmailAddress}
                            {...form.register("recommenderEmailAddress", {
                                pattern: EMAIL_REGEX,
                                required: false
                            })}
                        />
                        {hasEmail && (
                            <>
                                {!recommendation || emailChanged ? (
                                    <SpinnerButton
                                        type="submit"
                                        variant="primary"
                                        size="sm"
                                        loading={isPending}
                                    >
                                        {recommendation ? 'Update & Resend' : 'Send Link'}
                                    </SpinnerButton>
                                ) : (
                                    <SpinnerButton
                                        variant="outline-primary"
                                        size="sm"
                                        loading={isPending}
                                        onClick={handleResend}
                                    >
                                        Resend Link
                                    </SpinnerButton>
                                )}
                            </>
                        )}
                        <Form.Control.Feedback type="invalid">
                            Please enter a valid email address.
                        </Form.Control.Feedback>
                    </InputGroup>
                </Form>
                <span className={`badge ${linkSent ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                    {linkSent ? (
                        <>
                            <FontAwesomeIcon icon={faCheck} className="me-1" />
                            Link Sent
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faXmark} className="me-1" />
                            Not Sent
                        </>
                    )}
                </span>
            </div>
        </div>
    );
};

function RecommendationGroup() {
    const authContext = useContext(AuthContext);
    const { data: camperProfile } = useCamperProfileQuery(authContext.attributes.sub);
    const { data: rotaryClub, isPending: isRotaryClubPending, isError: isRotaryClubError } = useRotaryClubQuery(camperProfile?.rotaryClubId);
    const { data: recommendations, isPending: isRecPending, isError: isRecError } = useRecommendationsQuery(authContext.attributes.sub);

    const numRequired = rotaryClub?.numRequiredLetters ?? 0;
    const camperName = getCamperName(camperProfile);

    if (isRecPending || isRotaryClubPending) {
        return (
            <div className="mb-1">
                <Placeholder as="h5" animation="glow">
                    <Placeholder xs={4} />
                </Placeholder>
                <Placeholder as="div" animation="glow">
                    <Placeholder xs={12} className="mb-2" />
                </Placeholder>
            </div>
        );
    }
    else if (numRequired > 0 && !isRotaryClubError && !isRecError) {
        // Create slots for all required letters
        const slots = Array.from({ length: numRequired }, (_, index) => {
            const rec = recommendations?.[index];
            return (
                <RecommendationSlot
                    key={rec?.id || `empty-${index}`}
                    index={index}
                    recommendation={rec}
                    camperName={camperName}
                />
            );
        });

        return (
            <>
                <p>
                    Your rotary club requires {numRequired} letter{numRequired > 1 ? 's' : ''} of recommendation. 
                    Enter email {numRequired > 1 ? 'addresses' : 'address'} below to send links to each recommender to submit their letters.
                </p>
                {slots}
            </>
        );
    }
    else if (isRotaryClubError || isRecError) {
        return <Alert variant="danger">Error loading recommendation details. Please try again later.</Alert>;
    }
    else {
        return <p>Your rotary club does not require a letter of recommendation.</p>;
    }
}