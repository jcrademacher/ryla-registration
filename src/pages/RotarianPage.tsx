import { Table, Form, Button, Modal, Placeholder, Badge } from "react-bootstrap";
import { useListCamperProfilesByRotaryClubQuery, useRotarianProfileQuery, useRotarianReviewQuery } from "../queries/queries";
import { useCreateRotarianReviewMutation, useUpdateRotarianProfileMutation } from "../queries/mutations";
import { useContext, useState } from "react";
import { AuthContext } from "../App";
import { Link, Route, Routes, useNavigate } from "react-router";
import { RotarianProfileSchemaType } from "../api/apiRotarianProfile";
import { ConfirmationModal, FormModal } from "../components/modals";
import { ROTARY_CLUBS } from "./constants";
import { SubmitHandler, useForm } from "react-hook-form";
import { SpinnerButton } from "../utils/button";
import { useQueryClient } from "@tanstack/react-query";
import { CamperProfileSchemaType } from "../api/apiCamperProfile";


type ClubFormType = {
    rotaryClub: string | null;
}

function ClubView({ rotarianProfile }: { rotarianProfile?: RotarianProfileSchemaType | null }) {
    const [changingClub, setChangingClub] = useState(false);
    const [savingClub, setSavingClub] = useState(false);

    const { mutateAsync: updateRotarianProfile } = useUpdateRotarianProfileMutation();
    const queryClient = useQueryClient();

    const authContext = useContext(AuthContext);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ClubFormType>({
        values: {
            rotaryClub: rotarianProfile?.rotaryClub ?? null
        }
    });

    const handleChangeClub: SubmitHandler<ClubFormType> = async (data: ClubFormType) => {
        if (changingClub) {
            setSavingClub(true);
            await updateRotarianProfile({
                userSub: rotarianProfile?.userSub ?? "",
                rotaryClub: data.rotaryClub
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["rotarianProfile", authContext.attributes.sub] });
                }
            });
            
            setSavingClub(false);
        }

        setChangingClub(false);
    }

    return (
        <p>
            <b>Your club:</b>
            {' '}{rotarianProfile?.rotaryClub ?? <Placeholder animation="glow"><Placeholder xs={1} /></Placeholder>}
            {' '}(<Link to="" onClick={() => setChangingClub(true)}>Change</Link>)
            <FormModal
                show={changingClub}
                onClose={() => setChangingClub(false)}
                title="Change Club"
            >
                <Form onSubmit={handleSubmit(handleChangeClub)}>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Club</Form.Label>
                            <Form.Select
                                {...register("rotaryClub", { required: true })}
                                isInvalid={!!errors.rotaryClub}
                            >
                                <option disabled value="">Select a club</option>
                                {ROTARY_CLUBS.map((club) => (
                                    <option key={club} value={club}>{club}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setChangingClub(false)}>Cancel</Button>
                        <SpinnerButton loading={savingClub} variant="primary" type="submit">Save</SpinnerButton>
                    </Modal.Footer>
                </Form>
            </FormModal>
        </p>
    )
}

function CamperRow({ camperProfile: p }: { camperProfile: CamperProfileSchemaType }) {

    const { data: rotarianReview, isPending: isPendingRotarianReview } = useRotarianReviewQuery(p.userSub);
    const { mutate: createRotarianReview } = useCreateRotarianReviewMutation();

    const [showReviewModal, setShowReviewModal] = useState<"APPROVED" | "REJECTED" | null>(null);
    const [savingReview, setSavingReview] = useState(false);


    let reviewBadge;

    if(isPendingRotarianReview) {
        reviewBadge = <Placeholder animation="glow">
            <Placeholder xs={8} />
        </Placeholder>;
    } 
    else if (rotarianReview?.review === "APPROVED") {
        reviewBadge = <Badge bg="success" text="light">Approved</Badge>;
    } else if (rotarianReview?.review === "REJECTED") {
        reviewBadge = <Badge bg="danger" text="light">Rejected</Badge>;
    } else {
        reviewBadge = <Badge bg="warning" text="dark">Incomplete</Badge>;
    }

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const handleReview = (review: "APPROVED" | "REJECTED") => {
        setSavingReview(true);
        createRotarianReview({ camperSub: p.userSub, review }, {
            onSettled: () => {
                setSavingReview(false);
                setShowReviewModal(null);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["rotarianReview", p.userSub] });
            }
        });
    }

    return (
        <tr onClick={() => navigate(`/camper-view/${p.userSub}`)} style={{ cursor: "pointer" }} key={p.userSub}>
            <td>{p.firstName} {p.nickname ? `(${p.nickname})` : ''} {p.lastName}</td>
            <td>{p.highSchool}</td>
            <td>{p.applicationComplete ?
                <Badge bg="success" text="light">Ready to Review</Badge> :
                <Badge bg="warning" text="dark">Incomplete</Badge>}
            </td>
            <td>
                {reviewBadge}
            </td>
            <td>
                {(rotarianReview || isPendingRotarianReview || !p.applicationComplete) ? <></> : (
                    <>
                        <Button 
                            variant="primary" 
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); setShowReviewModal("APPROVED"); }}
                        >
                            Admit
                        </Button>
                        {' '}
                        <Button 
                            variant="danger" 
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); setShowReviewModal("REJECTED"); }}
                        >
                            Reject
                        </Button>
                    </>
                )}
                <ConfirmationModal
                    show={showReviewModal !== null}
                    onClose={() => setShowReviewModal(null)}
                    onConfirm={() => showReviewModal && handleReview(showReviewModal)}
                    title={showReviewModal === "APPROVED" ? "Admit Camper" : "Reject Camper" }
                    confirmButtonText={showReviewModal === "APPROVED" ? "Admit" : "Reject"}
                    confirmButtonVariant={showReviewModal === "APPROVED" ? "primary" : "danger"}
                    isLoading={savingReview}
                >
                    <p>Are you sure you want to {showReviewModal === "APPROVED" ? "admit" : "reject"} this camper?
                        An email will be sent to the camper with this decision and their application page will be updated.
                    </p>
                </ConfirmationModal>
            </td>
        </tr>
    )
}



function RotarianCamperTablePage() {
    const authContext = useContext(AuthContext);

    const { data: rotarianProfile } = useRotarianProfileQuery(authContext.attributes.sub);
    const { data: camperProfiles, isLoading } = useListCamperProfilesByRotaryClubQuery(rotarianProfile?.rotaryClub ?? null);

    return (
        <div>
            <h3>Rotarian Portal</h3>
            <p>Welcome to the rotarian portal. Here you can view camper applications and approve or reject them.</p>
            <ClubView rotarianProfile={rotarianProfile} />
            <Table bordered responsive hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>High School</th>
                        <th>Application Status</th>
                        <th>Review Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ?
                        <tr>
                            <td>
                                <Placeholder animation="glow">
                                    <Placeholder xs={4} /> {' '}
                                    <Placeholder xs={4} />
                                </Placeholder>
                            </td>
                            <td>
                                <Placeholder animation="glow">
                                    <Placeholder xs={8} />
                                </Placeholder>
                            </td>
                            <td>
                                <Placeholder animation="glow">
                                    <Placeholder xs={8} />
                                </Placeholder>
                            </td>
                            <td>
                                <Placeholder animation="glow">
                                    <Placeholder xs={8} />
                                </Placeholder>
                            </td>
                            <td>

                            </td>
                        </tr>
                        
                        :
                        camperProfiles && camperProfiles.length > 0 ? camperProfiles?.map((p) => (
                            <CamperRow key={p.userSub} camperProfile={p} />
                        )) : <tr><td colSpan={5}>No campers found</td></tr>}
                </tbody>
            </Table>
        </div>
    )
}

export function RotarianPage() {

    return (
        <div className="rotarian-page">
            <Routes>
                <Route path="*" element={<RotarianCamperTablePage />} />
            </Routes>
        </div>
    );
}; 