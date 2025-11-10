import { useEffect, useState, useRef, useContext, useCallback } from "react";
import { AuthContext } from "../../App";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { MultiStepView } from "../../components/modals";
import { IconButton } from "../../utils/button";
import { Form, Row, Col, Spinner } from "react-bootstrap";
import { faChevronRight, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { GENDER_OPTIONS, PHONE_REGEX, EMAIL_REGEX } from "../constants";
import { emitToast, ToastType } from "../../utils/notifications";
import { useUpdateProfileMutation, useCreateProfileMutation } from "../../queries/mutations";
import {
    UpdateCamperProfileSchemaType,
    CamperProfileSchemaType
} from "../../api/apiCamperProfile";
import { useForm } from "react-hook-form";
import { ThinSpacer } from "../../components/ThinSpacer";
import { SpinnerButton } from "../../utils/button";
import { createEDT } from "../../utils/datetime";
import { DateTime } from "luxon";
import { useListRotaryClubsQuery } from "../../queries/queries";

function nullifyEmptyStrings<T extends object>(obj: T): T {
    // Get all keys of the object
    const result: any = { ...obj };
    for (const key in obj) {
        // If the value is an empty string, set it to null
        if (obj[key] === "") {
            result[key] = null;
        }
    }
    return result;
}

export const Req = () => (<span style={{ color: 'red' }}>*</span>);


type CamperUserProfileForm1Type = {
    firstName: string | null;
    lastName: string | null;
    middleInitial?: string | null;
    nickname?: string | null;
    birthdate: string | null;
    gender: string | null;
    genderOther?: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipcode: string | null;
}

const mapSchemaToForm1 = (schema: CamperProfileSchemaType): CamperUserProfileForm1Type => {

    const isOther = !GENDER_OPTIONS.includes(schema.gender ?? "");

    return {
        firstName: schema.firstName ?? null,
        lastName: schema.lastName ?? null,
        middleInitial: schema.middleInitial ?? null,
        nickname: schema.nickname ?? null,
        birthdate: schema.birthdate ?? null,
        gender: schema.gender ? (isOther ? "Other" : schema.gender) : null,
        genderOther: schema.gender ? (isOther ? schema.gender : null) : null,
        phone: schema.phone ?? null,
        address: schema.address ?? null,
        city: schema.city ?? null,
        state: schema.state ?? null,
        zipcode: schema.zipcode ?? null,
    }
}

const mapFormToSchema1 = (form: CamperUserProfileForm1Type, userSub?: string): UpdateCamperProfileSchemaType => {
    const isOther = form.gender === "Other";

    return {
        userSub: userSub ?? "",
        firstName: form.firstName,
        lastName: form.lastName,
        middleInitial: form.middleInitial,
        nickname: form.nickname,
        birthdate: form.birthdate,
        gender: isOther ? form.genderOther : form.gender,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        zipcode: form.zipcode,
    }
}

export function CamperProfileForm1({ camperProfile, onNext }: { camperProfile: CamperProfileSchemaType, onBack: () => void, onNext: () => void }) {

    const authContext = useContext(AuthContext);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm<CamperUserProfileForm1Type>({
        values: mapSchemaToForm1(camperProfile)
    });


    const [saving, setSaving] = useState(false);

    const updateProfileMutation = useUpdateProfileMutation();
    const queryClient = useQueryClient();

    const onSubmit = async (data: CamperUserProfileForm1Type) => {
        setSaving(true);

        data = nullifyEmptyStrings(data);

        const dataToUpdate = mapFormToSchema1(data, authContext.attributes.sub);

        updateProfileMutation.mutate(dataToUpdate, {
            onSuccess: () => {
                onNext();
            },
            onSettled: () => {
                setSaving(false);
                queryClient.invalidateQueries({ queryKey: ['camperProfile', authContext.attributes.sub] });
            },
        });
    }

    const validateBirthdate = useCallback((value: string | null) => {
        if (!value) return false;

        const birthdate = createEDT(value).toMillis();
        const now = DateTime.now().toMillis();

        return birthdate < now - 13 * 365 * 24 * 60 * 60 * 1000;
    }, []);

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
                <Col xs={2}>
                    <Form.Group>
                        <Form.Label>First Name <Req /></Form.Label>
                        <Form.Control
                            type="text"
                            {...register("firstName", { required: true })}
                            isInvalid={!!errors.firstName}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col xs={2}>
                    <Form.Group>
                        <Form.Label>Middle Initial</Form.Label>
                        <Form.Control
                            type="text"
                            {...register("middleInitial", { required: false })}
                            isInvalid={!!errors.middleInitial}
                            defaultValue={undefined}
                        />
                    </Form.Group>
                </Col>
                <Col xs={8}>
                    <Form.Group>
                        <Form.Label>Last Name <Req /></Form.Label>
                        <Form.Control
                            type="text"
                            {...register("lastName", { required: true })}
                            isInvalid={!!errors.lastName}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col xs={2}>
                    <Form.Group>
                        <Form.Label>Nickname</Form.Label>
                        <Form.Control
                            type="text"
                            {...register("nickname", { required: false })}
                            isInvalid={!!errors.nickname}
                        />
                    </Form.Group>
                </Col>
                <Col xs={2}>
                    <Form.Group>
                        <Form.Label>Birthdate <Req /></Form.Label>
                        <Form.Control
                            type="date"
                            {...register("birthdate", { required: true, validate: validateBirthdate })}
                            isInvalid={!!errors.birthdate}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required. Must be at least 13 years old.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col xs={4}>
                    <Form.Group>
                        <Form.Label>Gender <Req /></Form.Label>
                        <Form.Select
                            {...register("gender", { required: true })}
                            isInvalid={!!errors.gender}
                            defaultValue=""
                        >
                            <option disabled value="">Select...</option>
                            {GENDER_OPTIONS.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                            <option value="Other">Other</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            Required
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col xs={4}>
                    {watch("gender") === "Other" && (
                        <Form.Group>
                            <Form.Label>Please specify <Req /></Form.Label>
                            <Form.Control
                                type="text"
                                {...register("genderOther", { required: watch("gender") === "Other" })}
                                isInvalid={!!errors.genderOther}
                            />
                            <Form.Control.Feedback type="invalid">
                                Required if you selected "Other"
                            </Form.Control.Feedback>
                        </Form.Group>
                    )}
                </Col>

            </Row>
            <Row>
                <Col>
                    <Form.Group>
                        <Form.Label>Applicant's Phone Number <Req /></Form.Label>
                        <Form.Control
                            type="tel"
                            {...register("phone", {
                                required: true,
                                pattern: PHONE_REGEX
                            })}
                            isInvalid={!!errors.phone}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required. Phone number must be 10 digits and contain numbers only.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col xs={3}>
                    <Form.Group>
                        <Form.Label>Address <Req /></Form.Label>
                        <Form.Control
                            type="text"
                            {...register("address", { required: true })}
                            isInvalid={!!errors.address}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col xs={3}>
                    <Form.Group>
                        <Form.Label>City <Req /></Form.Label>
                        <Form.Control
                            type="text"
                            {...register("city", { required: true })}
                            isInvalid={!!errors.city}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col xs={3}>
                    <Form.Group>
                        <Form.Label>State <Req /></Form.Label>
                        <Form.Select
                            {...register("state", { required: true })}
                            isInvalid={!!errors.state}
                            defaultValue=""
                        >
                            <option disabled value="">Select...</option>
                            <option value="Maine">Maine</option>
                            <option value="New Hampshire">New Hampshire</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            Required
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col xs={3}>
                    <Form.Group>
                        <Form.Label>Zip Code <Req /></Form.Label>
                        <Form.Control
                            type="text"
                            maxLength={5}
                            {...register("zipcode", {
                                required: true,
                                pattern: /^[0-9]{5}$/
                            })}
                            isInvalid={!!errors.zipcode}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required. Zip code must be 5 digits.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <ThinSpacer />
            <SpinnerButton
                icon={faChevronRight}
                position="right"
                type="submit"
                loading={saving}
            >
                Next
            </SpinnerButton>
        </Form>
    )
}



type CamperUserProfileForm2Type = {
    parent1FirstName: string | null;
    parent1LastName: string | null;
    parent1Phone: string | null;
    parent1Email: string | null;
    parent2FirstName?: string | null;
    parent2LastName?: string | null;
    parent2Phone?: string | null;
    parent2Email?: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    emergencyContactRelationship: string | null;
}

const mapSchemaToForm2 = (schema: CamperProfileSchemaType): CamperUserProfileForm2Type => {

    return {
        parent1FirstName: schema.parent1FirstName ?? null,
        parent1LastName: schema.parent1LastName ?? null,
        parent1Phone: schema.parent1Phone ?? null,
        parent1Email: schema.parent1Email ?? null,
        parent2FirstName: schema.parent2FirstName ?? null,
        parent2LastName: schema.parent2LastName ?? null,
        parent2Phone: schema.parent2Phone ?? null,
        parent2Email: schema.parent2Email ?? null,
        emergencyContactName: schema.emergencyContactName ?? null,
        emergencyContactPhone: schema.emergencyContactPhone ?? null,
        emergencyContactRelationship: schema.emergencyContactRelationship ?? null,
    }
}

const mapFormToSchema2 = (form: CamperUserProfileForm2Type, userSub?: string): UpdateCamperProfileSchemaType => {

    return {
        userSub: userSub ?? "",
        parent1FirstName: form.parent1FirstName,
        parent1LastName: form.parent1LastName,
        parent1Phone: form.parent1Phone,
        parent1Email: form.parent1Email,
        parent2FirstName: form.parent2FirstName,
        parent2LastName: form.parent2LastName,
        parent2Phone: form.parent2Phone,
        parent2Email: form.parent2Email,
        emergencyContactName: form.emergencyContactName,
        emergencyContactPhone: form.emergencyContactPhone,
        emergencyContactRelationship: form.emergencyContactRelationship,
    }
}

export function CamperProfileForm2({ camperProfile, onBack, onNext }: { camperProfile: CamperProfileSchemaType, onBack: () => void, onNext: () => void }) {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<CamperUserProfileForm2Type>({
        values: mapSchemaToForm2(camperProfile)
    });


    const [saving, setSaving] = useState(false);

    const authContext = useContext(AuthContext);

    const updateProfileMutation = useUpdateProfileMutation();
    const queryClient = useQueryClient();

    const onSubmit = (data: CamperUserProfileForm2Type) => {
        setSaving(true);

        const dataToUpdate = mapFormToSchema2(nullifyEmptyStrings(data), authContext.attributes.sub);

        updateProfileMutation.mutate(dataToUpdate, {
            onSuccess: () => {
                onNext();
            },
            onSettled: () => {
                setSaving(false);
                queryClient.invalidateQueries({ queryKey: ['camperProfile', authContext.attributes.sub] });
            },
            onError: () => setSaving(false),
        });
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
                <Col xs={3}>
                    <Form.Group>
                        <Form.Label>Parent/Guardian 1 First Name <Req /></Form.Label>
                        <Form.Control
                            type="text"
                            {...register("parent1FirstName", { required: true })}
                            isInvalid={!!errors.parent1FirstName}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col xs={3}>
                    <Form.Group>
                        <Form.Label>Parent/Guardian 1 Last Name <Req /></Form.Label>
                        <Form.Control
                            type="text"
                            {...register("parent1LastName", { required: true })}
                            isInvalid={!!errors.parent1LastName}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col xs={3}>
                    <Form.Group>
                        <Form.Label>Parent/Guardian 1 Phone <Req /></Form.Label>
                        <Form.Control
                            type="tel"
                            {...register("parent1Phone", {
                                required: true,
                                pattern: PHONE_REGEX
                            })}
                            isInvalid={!!errors.parent1Phone}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col xs={3}>
                    <Form.Group>
                        <Form.Label>Parent/Guardian 1 Email <Req /></Form.Label>
                        <Form.Control
                            type="text"
                            {...register("parent1Email", {
                                required: true,
                                pattern: EMAIL_REGEX
                            })}
                            isInvalid={!!errors.parent1Email}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required. Email address must be valid.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col xs={3}>
                    <Form.Group>
                        <Form.Label>Parent/Guardian 2 First Name</Form.Label>
                        <Form.Control
                            type="text"
                            {...register("parent2FirstName")}
                            isInvalid={!!errors.parent2FirstName}
                        />
                    </Form.Group>
                </Col>
                <Col xs={3}>
                    <Form.Group>
                        <Form.Label>Parent/Guardian 2 Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            {...register("parent2LastName")}
                            isInvalid={!!errors.parent2LastName}
                        />
                    </Form.Group>
                </Col>
                <Col xs={3}>
                    <Form.Group>
                        <Form.Label>Parent/Guardian 2 Phone</Form.Label>
                        <Form.Control
                            type="tel"
                            {...register("parent2Phone", {
                                pattern: PHONE_REGEX
                            })}
                            isInvalid={!!errors.parent2Phone}
                        />
                    </Form.Group>
                </Col>
                <Col xs={3}>
                    <Form.Group>
                        <Form.Label>Parent/Guardian 2 Email</Form.Label>
                        <Form.Control
                            type="text"
                            {...register("parent2Email", {
                                pattern: EMAIL_REGEX
                            })}
                            isInvalid={!!errors.parent2Email}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col xs={3}>
                    <Form.Group>
                        <Form.Label>Emergency Contact Name <Req /></Form.Label>
                        <Form.Control
                            type="text"
                            {...register("emergencyContactName", { required: true })}
                            isInvalid={!!errors.emergencyContactName}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col xs={3}>
                    <Form.Group>
                        <Form.Label>Emergency Contact Phone <Req /></Form.Label>
                        <Form.Control
                            type="tel"
                            {...register("emergencyContactPhone", {
                                required: true,
                                pattern: PHONE_REGEX
                            })}
                            isInvalid={!!errors.emergencyContactPhone}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col xs={3}>
                    <Form.Group>
                        <Form.Label>Emergency Contact Relationship <Req /></Form.Label>
                        <Form.Control
                            type="text"
                            {...register("emergencyContactRelationship", { required: true })}
                            isInvalid={!!errors.emergencyContactRelationship}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <ThinSpacer />
            <div className="flex-row">
                <IconButton
                    icon={faChevronLeft}
                    variant="light"
                    position="left"
                    onClick={onBack}
                >
                    Back
                </IconButton>
                <span style={{ width: 10 }} />
                <SpinnerButton
                    icon={faChevronRight}
                    position="right"
                    type="submit"
                    loading={saving}
                >
                    Next
                </SpinnerButton>
            </div>

        </Form>
    )
}

type CamperUserProfileForm3Type = {
    sponsoringRotaryClub: string | null;
    highSchool: string | null;
    guidanceCounselorName: string | null;
    guidanceCounselorEmailAddress: string | null;
    guidanceCounselorPhone: string | null;
}

const mapSchemaToForm3 = (schema: CamperProfileSchemaType, rotaryClubs?: RotaryClubSchemaType[] | null): CamperUserProfileForm3Type => {

    console.log(schema);
    return {
        sponsoringRotaryClub: rotaryClubs?.find(club => club.id === schema.rotaryClubId)?.id ?? null,
        highSchool: schema.highSchool ?? null,
        guidanceCounselorName: schema.guidanceCounselorName ?? null,
        guidanceCounselorEmailAddress: schema.guidanceCounselorEmail ?? null,
        guidanceCounselorPhone: schema.guidanceCounselorPhone ?? null,
    }
}

const mapFormToSchema3 = (form: CamperUserProfileForm3Type, userSub?: string): UpdateCamperProfileSchemaType => {

    return {
        userSub: userSub ?? "",
        rotaryClubId: form.sponsoringRotaryClub,
        highSchool: form.highSchool,
        guidanceCounselorName: form.guidanceCounselorName,
        guidanceCounselorEmail: form.guidanceCounselorEmailAddress,
        guidanceCounselorPhone: form.guidanceCounselorPhone,
    }
}

// import { ROTARY_CLUBS } from '../constants';

export const CamperProfileForm3 = ({ camperProfile, onBack, onNext }: { camperProfile: CamperProfileSchemaType, onBack: () => void, onNext: () => void }) => {
    const { data: rotaryClubs, isPending: isRotaryClubsPending } = useListRotaryClubsQuery();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<CamperUserProfileForm3Type>({
        values: mapSchemaToForm3(camperProfile, rotaryClubs)
    });


    const [saving, setSaving] = useState(false);

    const authContext = useContext(AuthContext);

    const updateProfileMutation = useUpdateProfileMutation();
    const queryClient = useQueryClient();

    const onSubmit = (data: CamperUserProfileForm3Type) => {
        setSaving(true);

        const dataToUpdate = mapFormToSchema3(nullifyEmptyStrings(data), authContext.attributes.sub);

        updateProfileMutation.mutate(dataToUpdate, {
            onSuccess: () => {
                onNext();
            },
            onSettled: () => {
                setSaving(false);
                queryClient.invalidateQueries({ queryKey: ['camperProfile', authContext.attributes.sub] });
            },
            onError: () => setSaving(false),
        });
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
                <Col xs={4}>
                    <Form.Group>
                        <Form.Label>
                            Sponsoring Rotary Club<Req />
                        </Form.Label>
                        <div className="d-flex align-items-center">

                            <Form.Select
                                {...register("sponsoringRotaryClub", { required: true })}
                                isInvalid={!!errors.sponsoringRotaryClub}
                                defaultValue=""
                                disabled={isRotaryClubsPending}
                            >
                                <option disabled value="">
                                    {isRotaryClubsPending ? "Loading clubs..." : "Select..."}
                                </option>
                                {rotaryClubs?.map((club) => (
                                    <option key={club.id} value={club.id}>
                                        {club.name}
                                    </option>
                                ))}
                            </Form.Select>
                            {isRotaryClubsPending && (

                                <Spinner animation="border" size="sm" />
                            )}
                        </div>


                        <Form.Control.Feedback type="invalid">
                            Please select a sponsoring Rotary Club.
                        </Form.Control.Feedback>
                        <Form.Text>
                            Ensure that this is your correct club. If this is incorrect, your application will not be routed to the correct club.
                            If you are not sure, please contact your club's Rotary representative or school guidance counselor.
                        </Form.Text>
                    </Form.Group>
                </Col>
                <Col xs={4}>
                    <Form.Group>
                        <Form.Label>High School <Req /></Form.Label>
                        <Form.Control
                            type="text"
                            {...register("highSchool", { required: true })}
                            isInvalid={!!errors.highSchool}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col xs={4}>
                    <Form.Group>
                        <Form.Label>
                            Guidance Counselor Name <Req />
                        </Form.Label>
                        <Form.Control
                            type="text"
                            {...register("guidanceCounselorName", { required: true })}
                            isInvalid={!!errors.guidanceCounselorName}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col xs={4}>
                    <Form.Group>
                        <Form.Label>
                            Guidance Counselor Email Address <Req />
                        </Form.Label>
                        <Form.Control
                            type="email"
                            {...register("guidanceCounselorEmailAddress", {
                                required: true,
                                pattern: EMAIL_REGEX
                            })}
                            isInvalid={!!errors.guidanceCounselorEmailAddress}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please enter a valid email address.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col xs={4}>
                    <Form.Group>
                        <Form.Label>
                            Guidance Counselor Phone Number <Req />
                        </Form.Label>
                        <Form.Control
                            type="tel"
                            {...register("guidanceCounselorPhone", {
                                required: true,
                                pattern: PHONE_REGEX
                            })}
                            isInvalid={!!errors.guidanceCounselorPhone}
                        />
                        <Form.Control.Feedback type="invalid">
                            Required. Phone number must be 10 digits and contain numbers only.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <ThinSpacer />
            <div className="flex-row">
                <IconButton
                    icon={faChevronLeft}
                    variant="light"
                    position="left"
                    onClick={onBack}
                >
                    Back
                </IconButton>
                <span style={{ width: 10 }} />
                <SpinnerButton
                    icon={faChevronRight}
                    position="right"
                    type="submit"
                    loading={saving}
                >
                    Next
                </SpinnerButton>
            </div>

        </Form>
    )
}

import { DIETARY_RESTRICTIONS } from '../constants';
import { useCamperProfileQuery, useCamperYearQuery } from '../../queries/queries';
import { RotaryClubSchemaType } from "../../api/apiRotaryClub";

type CamperUserProfileForm4Type = {
    dietaryRestrictions: string | null;
    dietaryRestrictionsNotes?: string | null;

}

const mapSchemaToForm4 = (schema: CamperProfileSchemaType): CamperUserProfileForm4Type => {

    return {
        dietaryRestrictions: schema.dietaryRestrictions ?? null,
        dietaryRestrictionsNotes: schema.dietaryRestrictionsNotes ?? null,
    }
}

const mapFormToSchema4 = (form: CamperUserProfileForm4Type, userSub?: string): UpdateCamperProfileSchemaType => {

    return {
        userSub: userSub ?? "",
        dietaryRestrictions: form.dietaryRestrictions,
        dietaryRestrictionsNotes: form.dietaryRestrictionsNotes,
    }
}

export function CamperProfileForm4({ camperProfile, onBack, onNext }: { camperProfile: CamperProfileSchemaType, onBack: () => void, onNext: () => void }) {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<CamperUserProfileForm4Type>({
        values: mapSchemaToForm4(camperProfile)
    });




    const [saving, setSaving] = useState(false);

    const authContext = useContext(AuthContext);

    const updateProfileMutation = useUpdateProfileMutation();
    const queryClient = useQueryClient();

    const onSubmit = async (data: CamperUserProfileForm4Type) => {
        setSaving(true);
        // if (!window.confirm("Are you sure you want to submit your application? You cannot change this information after submission.")) {
        //     setSaving(false);
        //     return;
        // }

        const dataToUpdate = mapFormToSchema4(nullifyEmptyStrings(data), authContext.attributes.sub);

        updateProfileMutation.mutate({
            ...dataToUpdate,
            profileComplete: true,
        }, {
            onSuccess: () => {
                emitToast(`Camper profile completed.`, ToastType.Success);

            },
            onSettled: () => {
                setSaving(false);
                queryClient.invalidateQueries({ queryKey: ['camperProfile', authContext.attributes.sub] });

                // wait slightly for re-render and protected route to unlock
                setTimeout(() => {
                    onNext();
                }, 100);
            },
        });


    }


    useEffect(() => {
        // Scroll to the top of the form when the component loads
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
                <Col xs={4}>
                    <Form.Group>
                        <Form.Label>
                            Dietary Restrictions <Req />
                        </Form.Label>
                        <Form.Select
                            {...register("dietaryRestrictions", { required: true })}
                            isInvalid={!!errors?.dietaryRestrictions}
                            defaultValue=""
                        >
                            <option disabled value="">Select...</option>
                            {DIETARY_RESTRICTIONS.map((restriction) => (
                                <option key={restriction} value={restriction}>
                                    {restriction}
                                </option>
                            ))}
                            <option value="Other">Other</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            Please select a dietary restriction.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col xs={8}>
                    <Form.Group>
                        <Form.Label>
                            Dietary Restrictions Notes
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            {...register("dietaryRestrictionsNotes")}
                            isInvalid={!!errors?.dietaryRestrictionsNotes}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide valid notes.
                        </Form.Control.Feedback>
                        <Form.Text>
                            If you selected "Other" or have additional information about your dietary needs, please describe here.
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>
            <ThinSpacer />
            <div className="flex-row">
                <IconButton
                    icon={faChevronLeft}
                    variant="light"
                    position="left"
                    onClick={onBack}
                >
                    Back
                </IconButton>
                <span style={{ width: 10 }} />
                <SpinnerButton
                    type="submit"
                    loading={saving}
                >
                    Finish Profile
                </SpinnerButton>
            </div>
        </Form>
    )
}



export function CamperProfile() {
    const [creatingProfile, setCreatingProfile] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const camperContentRef = useRef<HTMLDivElement>(null);

    const authContext = useContext(AuthContext);
    const createProfileMutation = useCreateProfileMutation();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: camperProfile, isSuccess } = useCamperProfileQuery(authContext.attributes.sub);
    const { data: camperYear } = useCamperYearQuery();

    // const appDeadlinePassed = useMemo(() => {
    //     if (!camperYear) return true;
    //     const appDeadline = createFromISO(camperYear.applicationDeadline);
    //     return appDeadline.diffNow().toMillis() < 0;
    // }, [camperYear]);

    // Scroll to top when currentStep changes to show a form (steps 1-4)
    useEffect(() => {
        if (currentStep >= 1 && currentStep <= 4) {
            // Use setTimeout to ensure DOM has updated before scrolling
            setTimeout(() => {
                if (camperContentRef.current) {
                    camperContentRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 100);
        }
    }, [currentStep]);

    const handleCreateProfile = async () => {
        setCreatingProfile(true);
        createProfileMutation.mutate({
            userSub: authContext.attributes.sub ?? "",
            identityId: authContext.identityId ?? "",
            email: authContext.attributes.email ?? "",
            campId: camperYear?.id ?? "",
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['camperProfile', authContext.attributes.sub] });
            },
            onSettled: () => {
                setCreatingProfile(false);
                setCurrentStep((x) => x + 1);
            }
        });
    }

    let ProfileView;

    if (camperProfile && isSuccess && !camperProfile.profileComplete) {
        ProfileView = (
            <>
                <p>Your profile is incomplete.</p>
                <p>Please fill out the information below to complete your profile.</p>
                <IconButton
                    icon={faChevronRight}
                    onClick={() => setCurrentStep((x) => x + 1)}
                    position="right"
                >
                    Continue Profile
                </IconButton>
            </>
        )
    }
    else if (camperProfile && isSuccess && camperProfile.profileComplete) {
        ProfileView = (
            <>
                <p>Your profile is complete.</p>
                <IconButton
                    icon={faChevronRight}
                    onClick={() => setCurrentStep((x) => x + 1)}
                    position="right"
                >
                    Edit Profile
                </IconButton>
            </>
        )
    }
    else if (!camperProfile && isSuccess) {
        ProfileView = (
            <>
                <p>You do not have a profile yet. Start the application process by clicking the button below.</p>
                <SpinnerButton
                    icon={faChevronRight}
                    onClick={handleCreateProfile}
                    position="right"
                    loading={creatingProfile}
                >
                    Begin Profile
                </SpinnerButton>
            </>
        )
    }

    return (
        <div ref={camperContentRef}>
            <MultiStepView currentStep={currentStep}>
                {ProfileView}
                {camperProfile && isSuccess ?
                    <CamperProfileForm1
                        camperProfile={camperProfile}
                        onBack={() => setCurrentStep((x) => x - 1)}
                        onNext={() => setCurrentStep((x) => x + 1)} /> : null}
                {camperProfile && isSuccess ?
                    <CamperProfileForm2
                        camperProfile={camperProfile}
                        onBack={() => setCurrentStep((x) => x - 1)}
                        onNext={() => setCurrentStep((x) => x + 1)} /> : null}
                {camperProfile && isSuccess ?
                    <CamperProfileForm3
                        camperProfile={camperProfile}
                        onBack={() => setCurrentStep((x) => x - 1)}
                        onNext={() => setCurrentStep((x) => x + 1)} /> : null}
                {camperProfile && isSuccess ?
                    <CamperProfileForm4
                        camperProfile={camperProfile}
                        onBack={() => setCurrentStep((x) => x - 1)}
                        onNext={() => {
                            setCurrentStep((x) => x + 1);
                            navigate("/camper/application");
                        }} /> : null}

            </MultiStepView>
        </div>
    )
}