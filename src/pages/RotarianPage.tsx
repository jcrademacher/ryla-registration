import { Table, Button, Placeholder, Badge, Dropdown, Form, Spinner, Modal, Alert, Row, Col } from "react-bootstrap";
import { useActiveCampQuery, useListRotaryClubsQuery, useRecommendationsQuery, useRotarianProfileQuery, useRotarianReviewQuery } from "../queries/queries";
import { useCamperProfilesQuery } from "../queries/adminQueries";
import { useCreateRotarianReviewMutation, useUpdateProfileMutation, useUpdateRotarianReviewMutation } from "../queries/mutations";
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../App";
import { Route, Routes, useNavigate } from "react-router";
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
import { createEDT } from "../utils/datetime";
import "../styles/rotarian-page.scss";
import { getCampApplicationStatus } from '../utils/camp';
import { NotAcceptingApplications, PreDeadline, PastDeadlineRotarian } from "../components/alerts";
import { useObserveCamperProfiles } from "../queries/subscriptions";
import { Link } from "react-router";
import { formatCampDates, formatDateFullWithTime } from "../utils/datetime";
import { Container } from "react-bootstrap";

const columnHelper = createColumnHelper<CamperProfileSchemaType>();


// type ClubFormType = {
//     rotaryClubId: string | null;
// }

function ClubView() {
    const authContext = useContext(AuthContext);
    const { data: rotarianProfile, isPending: isPendingRotarianProfile, isError: isErrorRotarianProfile } = useRotarianProfileQuery(authContext.attributes.sub);
    const { data: rotaryClub, isPending: isPendingRotaryClub, isError: isErrorRotaryClub } = useRotaryClubQuery(rotarianProfile?.rotaryClubId);

    const isPending = isPendingRotaryClub || isPendingRotarianProfile;
    const isError = isErrorRotaryClub || isErrorRotarianProfile;

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

        <div>
            <div>
                <b>{rotaryClub?.name}</b>
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
            </div>
            <small className="text-muted">
                <div>
                    <div><b>Requires Application Essay: </b>{rotaryClub?.requiresApplication ? "Yes" : "No"}</div>
                    <div><b>Number of Letters Required: </b>{rotaryClub?.numRequiredLetters ?? "None"}</div>
                    <div><b>Requires Interview: </b>{rotaryClub?.requiresInterview ? "Yes" : "No"}</div>
                </div>
            </small>
        </div>
    )
}

function CampView() {
    const { data: activeCamp, isPending: isPendingActiveCamp, isError: isErrorActiveCamp } = useActiveCampQuery();

    if(isPendingActiveCamp) {
        return (
            <Placeholder animation="glow">
                <Placeholder xs={7} />
            </Placeholder>
        );
    }

    else if(isErrorActiveCamp) {
        return (
            <Alert variant="danger">
                <FontAwesomeIcon icon={faTriangleExclamation} className="me-1" />
                <b>Error:</b> Failed to load camp information. Please try again later.
            </Alert>
        );
    }

    else if(!activeCamp && !isPendingActiveCamp && !isErrorActiveCamp) {
        return (
            <div>
                <small className="text-muted">Camp Information</small>
                <div>
                    <b>None Upcoming</b>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div>
                <b>{activeCamp?.name}</b>
            </div>
            <small className="text-muted">
                <div><b>Dates:</b> {formatCampDates(activeCamp)}</div>
                {activeCamp?.applicationDeadline && (
                    <div><b>Application Deadline:</b> {formatDateFullWithTime(createEDT(activeCamp.applicationDeadline))}</div>
                )}
                {activeCamp?.medicalFormDeadline && (
                    <div><b>Medical Form Deadline:</b> {formatDateFullWithTime(createEDT(activeCamp.medicalFormDeadline))}</div>
                )}
            </small>
            <small className="text-muted">
                <Link to="/camp-info">View Full Camp Information</Link>
            </small>
        </div>
    );
}

function ApplicationStatusCell({ camperProfile }: { camperProfile: CamperProfileSchemaType }) {
    const { data: recs, isPending: isPendingRec } = useRecommendationsQuery(camperProfile.userSub);
    const { data: rotaryClub, isPending: isPendingRotaryClub } = useRotaryClubQuery(camperProfile.rotaryClubId);

    if (camperProfile.applicationComplete && camperProfile.profileComplete) {
        if (isPendingRec || isPendingRotaryClub) {
            return (
                <Placeholder animation="glow">
                    <Placeholder xs={8} />
                </Placeholder>
            );
        }
        if ((rotaryClub?.numRequiredLetters ?? 0) > 0 && recs?.every((rec) => !rec?.filepath)) {
            return <Badge bg="warning" text="dark">Missing Recommendations</Badge>;
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
    const navigate = useNavigate();

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
                            navigate(`/camper-view/${camperProfile.userSub}`);
                        }}
                    >
                        View Details...
                    </Dropdown.Item>
                    <Dropdown.Divider />
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
                title={showReviewModal === "APPROVED" ? "Admit Camper" : showReviewModal === "REJECTED" ? "Reject Camper" : "Undo Decision"}
                confirmButtonText={showReviewModal === "UNDO" ? "Undo" : showReviewModal === "APPROVED" ? "Admit" : "Reject"}
                confirmButtonVariant={showReviewModal !== "REJECTED" ? "primary" : "danger"}
                isLoading={isPendingCreateRotarianReview || isPendingUpdateRotarianReview}
            >
                {showReviewModal === "UNDO" ?
                    (
                        <p>
                            Are you sure you want to undo the decision for this camper? This will change the camper's review status to incomplete.
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
    return (
        <Container>
            <h3>Rotarian Portal</h3>
            <div className="mb-1">Welcome to the rotarian portal. Here you can view camper applications and approve or reject them.</div>
            
            <Row className="mb-3">
                <Col xs={12} md={6} className="mb-2 mb-md-0">
                    <div style={{ borderLeft: "1px solid #dee2e6", paddingLeft: "10px" }}>
                        <small className="text-muted">Your Club</small>
                        <ClubView />
                    </div>
                </Col>
                <Col xs={12} md={6}>
                    <div style={{ borderLeft: "1px solid #dee2e6", paddingLeft: "10px" }}>
                        <small className="text-muted">Camp Information</small>
                        <CampView />
                    </div>
                </Col>
            </Row>
            
            <RotarianTable />
        </Container>
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
    }, [queryClient, activeCamp?.id, rotarianProfile?.rotaryClubId]);

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
        DeadlineStatus = <PreDeadline deadline={applicationDeadline} />;
    }
    else {
        DeadlineStatus = <PastDeadlineRotarian />;
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