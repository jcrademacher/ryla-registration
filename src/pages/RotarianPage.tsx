import { Table, Button, Placeholder, Badge, Dropdown, Form, Spinner, Modal, Alert } from "react-bootstrap";
import { useActiveCampQuery, useListRotaryClubsQuery, useRecommendationQuery, useRotarianProfileQuery, useRotarianReviewQuery } from "../queries/queries";
import { useCamperProfilesQuery } from "../queries/adminQueries";
import { useCreateRotarianReviewMutation, useUpdateProfileMutation, useUpdateRotarianReviewMutation } from "../queries/mutations";
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../App";
import { Route, Routes, useNavigate } from "react-router";
import { RotarianProfileSchemaType } from "../api/apiRotarianProfile";
import { ConfirmationModal, FormModal } from "../components/modals";
import { useQueryClient } from "@tanstack/react-query";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { CamperProfileSchemaType } from "../api/apiCamperProfile";
import { useRotaryClubQuery } from "../queries/queries";
import { useSendAdmissionEmailMutation } from "../queries/emailMutations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV, faQuestionCircle, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { emitToast, ToastType } from "../utils/notifications";
import { useForm } from "react-hook-form";
import { SpinnerButton } from "../utils/button";
import { getCamperName } from "../utils/fields";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { createEDT, formatCampDates, formatDateFullWithTime, getCampYear } from "../utils/datetime";
import "../styles/rotarian-page.scss";
import { getCampApplicationStatus } from '../utils/camp';
import { NotAcceptingApplications, PreDeadline, PastDeadlineRotarian } from "../components/alerts";
import { useObserveCamperProfiles } from "../queries/subscriptions";

const columnHelper = createColumnHelper<CamperProfileSchemaType>();


// type ClubFormType = {
//     rotaryClubId: string | null;
// }

function ClubView({ rotarianProfile }: { rotarianProfile?: RotarianProfileSchemaType | null }) {
    const { data: rotaryClub, isPending: isPendingRotaryClub, isError: isErrorRotaryClub } = useRotaryClubQuery(rotarianProfile?.rotaryClubId);
    const { data: activeCamp, isPending: isPendingActiveCamp, isError: isErrorActiveCamp } = useActiveCampQuery();

    const isPending = isPendingRotaryClub || isPendingActiveCamp;
    const isError = isErrorRotaryClub || isErrorActiveCamp;

    const applicationDeadline = useMemo(() => {
        const d = createEDT(activeCamp?.applicationDeadline ?? "");
        return formatDateFullWithTime(d);
    }, [activeCamp?.applicationDeadline]);

    if (isError) {
        return (
            <Alert variant="danger">
                <FontAwesomeIcon icon={faTriangleExclamation} className="me-1" />
                <b>Error:</b> Failed to load club information. Please try again later.
            </Alert>
        );
    }

    if (isPending) {
        return (
            <Placeholder animation="glow">
                <Placeholder xs={7} />
            </Placeholder>
        );
    }

    return (
        <Table id="rotarian-info-table">
            <tbody>
                <tr>
                    <td><b>Your club: </b></td>
                    <td>
                        {rotaryClub?.name}
                        <OverlayTrigger
                            placement="right"
                            overlay={
                                <Tooltip>
                                    Please contact {import.meta.env.VITE_APP_DIRECTOR_EMAIL} if you need to change your club.
                                </Tooltip>
                            }
                        >
                            <FontAwesomeIcon className="ms-1 text-muted" icon={faQuestionCircle} />
                        </OverlayTrigger>
                    </td>
                </tr>

                <tr>
                    <td><b>Camp:</b></td>
                    <td>
                        <div>
                            {activeCamp ? `RYLA ${getCampYear(activeCamp)}, ${formatCampDates(activeCamp)}` : "None upcoming"}
                        </div>
                        <div>
                            {activeCamp && <small className="text-muted">Applications are due by {applicationDeadline}</small>}
                        </div>
                    </td>
                </tr>
            </tbody>
        </Table>
    )
    // const [changingClub, setChangingClub] = useState(false);
    // const [savingClub, setSavingClub] = useState(false);

    // const { mutateAsync: updateRotarianProfile } = useUpdateRotarianProfileMutation();
    // const queryClient = useQueryClient();
    // const { data: rotaryClub, isPending: isPendingRotaryClub } = useRotaryClubQuery(rotarianProfile?.rotaryClubId);

    // const authContext = useContext(AuthContext);

    // const {
    //     register,
    //     handleSubmit,
    //     formState: { errors }
    // } = useForm<ClubFormType>({
    //     values: {
    //         rotaryClubId: rotarianProfile?.rotaryClubId ?? null
    //     }
    // });

    // const handleChangeClub: SubmitHandler<ClubFormType> = async (data: ClubFormType) => {
    //     if (changingClub) {
    //         setSavingClub(true);
    //         await updateRotarianProfile({
    //             userSub: rotarianProfile?.userSub ?? "",
    //             rotaryClubId: data.rotaryClubId
    //         }, {
    //             onSuccess: () => {
    //                 queryClient.invalidateQueries({ queryKey: ["rotarianProfile", authContext.attributes.sub] });
    //             }
    //         });

    //         setSavingClub(false);
    //     }

    //     setChangingClub(false);
    // }

    // return (
    //     <p>
    //         <b>Your club:</b>
    //         {' '}{rotaryClub?.name ?? <Placeholder animation="glow"><Placeholder xs={1} /></Placeholder>}
    //         {' '}(<Link to="" onClick={() => setChangingClub(true)}>Change</Link>)
    //         <FormModal
    //             show={changingClub}
    //             onClose={() => setChangingClub(false)}
    //             title="Change Club"
    //         >
    //             <Form onSubmit={handleSubmit(handleChangeClub)}>
    //                 <Modal.Body>
    //                     <Form.Group>
    //                         <Form.Label>Club</Form.Label>
    //                         <Form.Select
    //                             {...register("rotaryClubId", { required: true })}
    //                             isInvalid={!!errors.rotaryClubId}
    //                         >
    //                             <option disabled value="">Select a club</option>
    //                             {rotaryClubs?.map((club) => (
    //                                 <option key={club.id} value={club.id}>{club.name}</option>
    //                             ))}
    //                         </Form.Select>
    //                     </Form.Group>
    //                 </Modal.Body>
    //                 <Modal.Footer>
    //                     <Button variant="light" onClick={() => setChangingClub(false)}>Cancel</Button>
    //                     <SpinnerButton loading={savingClub} variant="primary" type="submit">Save</SpinnerButton>
    //                 </Modal.Footer>
    //             </Form>
    //         </FormModal>
    //     </p>
    // )
}

function ApplicationStatusCell({ camperProfile }: { camperProfile: CamperProfileSchemaType }) {
    const { data: rec, isPending: isPendingRec } = useRecommendationQuery(camperProfile.userSub);
    const { data: rotaryClub, isPending: isPendingRotaryClub } = useRotaryClubQuery(camperProfile.rotaryClubId);

    if (camperProfile.applicationComplete && camperProfile.profileComplete) {
        if (isPendingRec || isPendingRotaryClub) {
            return (
                <Placeholder animation="glow">
                    <Placeholder xs={8} />
                </Placeholder>
            );
        }
        if (!rec?.filepath && rotaryClub?.requiresLetterOfRecommendation) {
            return <Badge bg="warning" text="dark">Missing Recommendation</Badge>;
        }
        if (!camperProfile.applicationFilepath && rotaryClub?.requiresApplication) {
            return <Badge bg="warning" text="dark">Missing Application File</Badge>;
        }
        return <Badge bg="success" text="light">Ready to Review</Badge>;
    }

    return <Badge bg="warning" text="dark">Incomplete</Badge>;
}

function ReviewStatusCell({ camperProfile }: { camperProfile: CamperProfileSchemaType }) {
    const { data: rotarianReview, isPending: isPendingRotarianReview } = useRotarianReviewQuery(camperProfile.userSub);

    if (isPendingRotarianReview) {
        return (
            <Placeholder animation="glow">
                <Placeholder xs={8} />
            </Placeholder>
        );
    }

    if (rotarianReview?.review === "APPROVED") {
        return <Badge bg="success" text="light">Approved</Badge>;
    }

    if (rotarianReview?.review === "REJECTED") {
        return <Badge bg="danger" text="light">Rejected</Badge>;
    }

    return <Badge bg="warning" text="dark">Incomplete</Badge>;
}

function ActionsCell({ camperProfile }: { camperProfile: CamperProfileSchemaType }) {
    const { data: rotarianReview, isError: isErrorRotarianReview } = useRotarianReviewQuery(camperProfile.userSub);
    const { mutate: createRotarianReview, isPending: isPendingCreateRotarianReview } = useCreateRotarianReviewMutation();
    const { mutate: updateRotarianReview, isPending: isPendingUpdateRotarianReview } = useUpdateRotarianReviewMutation();
    const { mutate: sendAdmissionEmail } = useSendAdmissionEmailMutation();

    const [showReviewModal, setShowReviewModal] = useState<"APPROVED" | "REJECTED" | "UNDO" | null>(null);
    const [showSendToClubModal, setShowSendToClubModal] = useState(false);

    const queryClient = useQueryClient();

    const handleReview = (review: "APPROVED" | "REJECTED" | null) => {
        if (!rotarianReview && !isErrorRotarianReview) {
            if (review === null) {
                emitToast("Refusing to create review with null decision.", ToastType.Warning);
                return;
            }
            createRotarianReview({ camperSub: camperProfile.userSub, review }, {
                onSettled: () => {
                    queryClient.invalidateQueries({ queryKey: ["rotarianReview", camperProfile.userSub] });
                    setShowReviewModal(null);
                },
                onSuccess: () => {
                    emitToast("Camper review created.", ToastType.Success);
                }
            });
        }
        else if (rotarianReview && !isErrorRotarianReview) {
            updateRotarianReview({ camperSub: camperProfile.userSub, review }, {
                onSettled: () => {
                    queryClient.invalidateQueries({ queryKey: ["rotarianReview", camperProfile.userSub] });
                    setShowReviewModal(null);
                },
                onSuccess: () => {
                    emitToast("Camper review updated.", ToastType.Success);
                }
            });
        }
        else {
            emitToast("Rotarian review could not be found. Please try again later.", ToastType.Error);
            return;
        }

        if (review === "APPROVED") {
            sendAdmissionEmail({ to: [camperProfile.email, camperProfile.parent1Email] });
        }
    }

    return (
        <div className="text-end">
            <Dropdown>
                <Dropdown.Toggle
                    variant="link"
                    size="sm"
                >
                    <FontAwesomeIcon icon={faEllipsisV} />
                </Dropdown.Toggle>
                <Dropdown.Menu renderOnMount popperConfig={{ strategy: "fixed" }}>
                    <Dropdown.Item
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowReviewModal("APPROVED");
                        }}
                        disabled={rotarianReview?.review === "APPROVED"}
                    >
                        Admit
                    </Dropdown.Item>
                    <Dropdown.Item
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowReviewModal("REJECTED");
                        }}
                        disabled={rotarianReview?.review === "REJECTED"}
                    >
                        Reject
                    </Dropdown.Item>
                    <Dropdown.Item
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowReviewModal("UNDO");
                        }}
                        disabled={!rotarianReview || rotarianReview.review === null}
                    >
                        Undo decision
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowSendToClubModal(true);
                        }}
                    >
                        Transfer to another club...
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>

            <ConfirmationModal
                show={showReviewModal !== null}
                onClose={() => setShowReviewModal(null)}
                onConfirm={() => showReviewModal && handleReview(showReviewModal === "UNDO" ? null : showReviewModal)}
                title={showReviewModal === "APPROVED" ? "Admit Camper" : "Reject Camper"}
                confirmButtonText={showReviewModal === "UNDO" ? "Undo" : showReviewModal === "APPROVED" ? "Admit" : "Reject"}
                confirmButtonVariant={showReviewModal !== "REJECTED" ? "primary" : "danger"}
                isLoading={isPendingCreateRotarianReview || isPendingUpdateRotarianReview}
            >
                {showReviewModal === "UNDO" ?
                    (
                        <p>
                            Are you sure you want to undo the decision for this camper?
                        </p>
                    )
                    : (
                        <p>Are you sure you want to {showReviewModal === "APPROVED" ? "admit" : "reject"} this camper?
                            {showReviewModal === "APPROVED" ? " An email will be sent to the camper notifying them of their admission." :
                                " It is your responsibility to notify the camper of this decision."}
                        </p>)
                }
            </ConfirmationModal>
            <SendToClubModal camperProfile={camperProfile} show={showSendToClubModal} onClose={() => setShowSendToClubModal(false)} />
        </div>
    );
}

function SendToClubModal({ camperProfile, show, onClose }: { camperProfile: CamperProfileSchemaType, show: boolean, onClose: () => void }) {
    const { data: rotaryClubs, isPending: isPendingRotaryClubs, isError: isErrorRotaryClubs } = useListRotaryClubsQuery();

    const queryClient = useQueryClient();
    const { mutate: updateCamperProfile, isPending: isPendingUpdateCamperProfile } = useUpdateProfileMutation();

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<{ rotaryClubId: string }>({
        defaultValues: {
            rotaryClubId: ""
        }
    });

    const campId = camperProfile.campId;
    const rotaryClubId = camperProfile.rotaryClubId;

    const handleSendToClub = (data: { rotaryClubId: string }) => {
        const rotaryClubName = rotaryClubs?.find((club) => club.id === data.rotaryClubId)?.name;

        updateCamperProfile({
            userSub: camperProfile.userSub,
            rotaryClubId: data.rotaryClubId
        }, {
            onSuccess: () => {
                emitToast(`Camper transferred to ${rotaryClubName} rotary club.`, ToastType.Success);
                queryClient.invalidateQueries({ queryKey: ["camperProfiles", { campId, rotaryClubId }] });
            },
            onSettled: () => {
                onClose();
            }
        });
    }

    return (
        <FormModal
            show={show}
            onClose={() => { reset(); onClose(); }}
            title="Transfer to another club"
        >
            <Form onSubmit={handleSubmit(handleSendToClub)}>
                <Modal.Body>
                    <Alert variant="warning">
                        <FontAwesomeIcon icon={faTriangleExclamation} />
                        <b>Warning:</b> Transferring a camper to another club will remove the camper from your list and add them to the
                        other club's list. Transferring has no effect on the camper's review status.
                        The other club needs to transfer this camper back if you make a mistake.
                    </Alert>
                    <div className="d-flex align-items-center">
                        <Form.Select
                            {...register("rotaryClubId", { required: true })}
                            isInvalid={!!errors.rotaryClubId}
                            defaultValue=""
                            disabled={isPendingRotaryClubs || isErrorRotaryClubs}
                        >
                            <option disabled value="">
                                {isPendingRotaryClubs ? "Loading clubs..." : "Select club..."}
                            </option>
                            {rotaryClubs?.filter((club) => club.id !== camperProfile.rotaryClubId).map((club) => (
                                <option key={club.id} value={club.id}>
                                    {club.name}
                                </option>
                            ))}
                        </Form.Select>
                        {isPendingRotaryClubs && (
                            <Spinner animation="border" size="sm" />
                        )}
                    </div>
                    <br />
                    {watch("rotaryClubId") && (
                        <strong>{getCamperName(camperProfile)} will be transferred to {rotaryClubs?.find((club) => club.id === watch("rotaryClubId"))?.name} rotary club.
                            Are you sure you want to continue?
                        </strong>
                    )}

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => { reset(); onClose(); }}>Cancel</Button>
                    <SpinnerButton
                        type="submit"
                        variant="primary"
                        loading={isPendingUpdateCamperProfile}
                    >Transfer</SpinnerButton>
                </Modal.Footer>
            </Form>
        </FormModal>
    )
}




function RotarianCamperTablePage() {
    const authContext = useContext(AuthContext);

    const { data: rotarianProfile } = useRotarianProfileQuery(authContext.attributes.sub);

    return (
        <div>
            <h3>Rotarian Portal</h3>
            <p>Welcome to the rotarian portal. Here you can view camper applications and approve or reject them.</p>
            <ClubView rotarianProfile={rotarianProfile} />
            <RotarianTable />
        </div>
    );
}

function RotarianTable() {
    const authContext = useContext(AuthContext);

    const { data: rotarianProfile } = useRotarianProfileQuery(authContext.attributes.sub);
    const { data: activeCamp, isPending: isPendingActiveCamp, isError: isErrorActiveCamp } = useActiveCampQuery();

    const { data: camperProfiles, isPending: isPendingCamperProfiles, isError: isErrorCamperProfiles } = useCamperProfilesQuery(activeCamp?.id, rotarianProfile?.rotaryClubId);
    
    const queryClient = useQueryClient();
    

    useEffect(() => {
        const sub = useObserveCamperProfiles(queryClient, activeCamp?.id, rotarianProfile?.rotaryClubId);

        return () => sub.unsubscribe();
    }, [queryClient,activeCamp?.id, rotarianProfile?.rotaryClubId]);
    
    const isPending = isPendingActiveCamp || isPendingCamperProfiles;
    const isError = isErrorActiveCamp || isErrorCamperProfiles;

    const applicationStatus = useMemo(() => getCampApplicationStatus(activeCamp), [activeCamp]);
    const navigate = useNavigate();

    const data = useMemo(() => camperProfiles ?? [], [camperProfiles]);

    const applicationDeadline = useMemo(() => createEDT(activeCamp?.applicationDeadline ?? ""), [activeCamp?.applicationDeadline]);

    const columns = useMemo(() => [
        columnHelper.accessor(row => getCamperName(row), {
            header: "Name",
        }),
        columnHelper.accessor("highSchool", {
            header: "High School",
        }),
        columnHelper.display({
            id: "applicationStatus",
            header: "Application Status",
            cell: ({ row }) => <ApplicationStatusCell camperProfile={row.original} />
        }),
        columnHelper.display({
            id: "reviewStatus",
            header: "Review Status",
            cell: ({ row }) => <ReviewStatusCell camperProfile={row.original} />
        }),
        columnHelper.display({
            id: "actions",
            header: "",
            cell: ({ row }) => <ActionsCell camperProfile={row.original} />
        })
    ], []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    });

    if (isError) {
        return <div>
            <Alert variant="danger">
                <FontAwesomeIcon icon={faTriangleExclamation} className="me-1" />
                <b>Error:</b> Failed to load camper profiles. Please try again later.
            </Alert>
        </div>
    }

    const TableBody = () => (
        <tbody>
            {table.getRowModel().rows.map((row) => (
                <tr
                    key={row.id}
                    style={{ cursor: "pointer" }}
                    onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/camper-view/${row.original.userSub}`);
                    }}
                >
                    {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );

    const LoadingTable = () => (
        <Table bordered>
            <tbody>
                <tr>
                    {table.getVisibleLeafColumns().map((column) => (
                        <td key={column.id}>
                            <Placeholder animation="glow">
                                <Placeholder xs={column.id === "actions" ? 2 : 8} />
                            </Placeholder>
                        </td>
                    ))}
                </tr>
            </tbody>
        </Table>
    );

    const EmptyTableBody = () => (
        <tbody>
            <tr>
                <td colSpan={table.getVisibleLeafColumns().length}>No campers found</td>
            </tr>
        </tbody>
    );

    if (isPending) {
        return <LoadingTable />
    }

    if (applicationStatus === "not-accepting") {
        return <NotAcceptingApplications />
    }

    let DeadlineStatus;

    if (applicationStatus === "accepting") {
        DeadlineStatus = <PreDeadline deadline={applicationDeadline}/>;
    }
    else {
        DeadlineStatus = <PastDeadlineRotarian/>;
    }

    return (
        <div>
            {DeadlineStatus}

            <Table bordered responsive hover>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} colSpan={header.colSpan}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                {table.getRowModel().rows.length > 0 ? (
                    <TableBody />
                ) : (
                    <EmptyTableBody />
                )}
            </Table>

        </div>

    );
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