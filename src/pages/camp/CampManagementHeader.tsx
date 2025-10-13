import { useMemo, useState } from 'react';

import { DateTime } from 'luxon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faFolderOpen, faInfoCircle, faUser, faFileAlt, faCheckDouble, faCircleXmark, faGear } from '@fortawesome/free-solid-svg-icons';
import { createFromISO, createEDT, formatCampDates, formatDateFullWithTime, validateAfterNow, formatDateHTML } from '../../utils/datetime';
import { FormModal } from '../../components/modals';
import { Alert, Button, Form, Placeholder, DropdownButton } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
import { SpinnerButton } from '../../utils/button';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useUpdateCampMutation } from '../../queries/adminMutations';
import { useQueryClient, useQueries } from '@tanstack/react-query';
import { useCampQuery, useListCampsQuery } from '../../queries/adminQueries';
import { Table as TanstackTable } from '@tanstack/table-core';
import { CamperProfileRowData } from './CampManagementPage';
import { ThinSpacer } from '../../components/ThinSpacer';
import { RotarianReviewSchemaType } from '../../api/apiRotarianReview';
import { CamperStatusSchemaType } from '../../api/apiCamperProfile';

interface CampMetrics {
    profileCompleteCampers: number;
    applicationCompleteCampers: number;
    documentsCompleteCampers: number;
    totalCampers: number;
    acceptedCampers: number;
    rejectedCampers: number;
    confirmedCampers: number;
}

type ApplicationDeadlineForm = {
    applicationDeadline: string;
}

const BasicCampInfo = ({ onSettingsClick }: { onSettingsClick?: () => void }) => {
    const { data: camp, isPending: isPendingCamp } = useCampQuery();

    const [showApplicationDeadlineModal, setShowApplicationDeadlineModal] = useState(false);
    const [savingCamp, setSavingCamp] = useState(false);
    const { data: otherCamps } = useListCampsQuery();

    const { mutate: updateCamp } = useUpdateCampMutation(otherCamps);
    const queryClient = useQueryClient();

    const applicationDeadline = useMemo(() => createFromISO(camp?.applicationDeadline ?? ""), [camp?.applicationDeadline]);
    const startDate = useMemo(() => createFromISO(camp?.startDate ?? ""), [camp?.startDate]);
    const endDate = useMemo(() => createFromISO(camp?.endDate ?? ""), [camp?.endDate]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ApplicationDeadlineForm>({
        values: {
            applicationDeadline: formatDateHTML(applicationDeadline)
        }
    });

    const onSubmit: SubmitHandler<ApplicationDeadlineForm> = (data: ApplicationDeadlineForm) => {
        setSavingCamp(true);
        updateCamp({
            id: camp?.id ?? "",
            applicationDeadline: createEDT(data.applicationDeadline).toISO() ?? ""
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['camp'] });
            },
            onSettled: () => {
                setSavingCamp(false);
                setShowApplicationDeadlineModal(false);
            }
        });
    }

    let content;

    if (isPendingCamp) {
        content = (
            <div className="flex-grow-1">
                <div>
                    <Placeholder as="h5" animation="glow">
                        <Placeholder xs={2} />
                    </Placeholder>
                </div>
                <div>
                    <Placeholder as="small" animation="glow">
                        <Placeholder xs={4} />
                    </Placeholder>
                </div>
                <div>
                    <Placeholder as="small" animation="glow">
                        <Placeholder xs={3} />
                    </Placeholder>
                </div>
            </div>
        )
    }
    else {
        content = (
            <div className="flex-grow-1">
                
                <div className="d-flex align-items-center">
                    <h4 className="mb-0">{camp ? `RYLA ${DateTime.fromISO(camp.startDate).year}` : ""}</h4>
                    <Button 
                        variant="link" 
                        className="p-0 ms-2"
                        style={{ border: 'none', color: '#6c757d' }}
                        onClick={onSettingsClick}
                    >
                        <FontAwesomeIcon icon={faGear} size="sm" />
                    </Button>
                </div>
                <div>

                    <small className="text-muted">{formatCampDates(startDate, endDate)}</small>
                </div>
                <div>
                    <small className="text-muted">
                        {`Applications are due by ${formatDateFullWithTime(applicationDeadline)}`}
                    </small>
                </div>
                <FormModal
                    show={showApplicationDeadlineModal}
                    onClose={() => {
                        setShowApplicationDeadlineModal(false);
                    }}
                    title="Change Application Deadline"
                >
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Modal.Body>
                            <Form.Group>
                                <Form.Control
                                    type="datetime-local"
                                    {...register('applicationDeadline',
                                        {
                                            required: true,
                                            validate: (v) => {
                                                const deadline = createEDT(v);

                                                const isAfterNow = validateAfterNow(deadline);
                                                const isBeforeStart = deadline.diff(startDate).toMillis() < 0;

                                                if (!isAfterNow) {
                                                    return "Application deadline must be after the current date";
                                                }

                                                if (!isBeforeStart) {
                                                    return "Application deadline must be before the camp start date";
                                                }

                                                return true;
                                            }
                                        })
                                    }
                                    isInvalid={!!errors.applicationDeadline}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.applicationDeadline?.message || "Application deadline is required"}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <br />
                            <Alert variant="info">
                                <Alert.Heading>
                                    <FontAwesomeIcon icon={faInfoCircle} /> Important Information
                                </Alert.Heading>
                                <ol>
                                    <li>The application deadline must be set before the camp start date and after the current date.</li>
                                    <li>If not set, campers will not be able to apply for camp.</li>
                                    <li>If set, campers will be able to apply for camp if the current date is before the application deadline.</li>
                                    <li>If the deadline is changed after it has initially been set, an email will be sent to all campers notifying them of this change.</li>
                                </ol>
                            </Alert>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="light"
                                onClick={() => setShowApplicationDeadlineModal(false)}
                            >
                                Cancel
                            </Button>
                            <SpinnerButton
                                variant="primary"
                                type="submit"
                                loading={savingCamp}
                            >
                                Save
                            </SpinnerButton>
                        </Modal.Footer>
                    </Form>
                </FormModal>
            </div>
        );
    }

    return content;
};

function CampMetrics({ table }: { table: TanstackTable<CamperProfileRowData> }) {

    const allData = useMemo(() => table.getCoreRowModel().rows.map(row => row.original), [table.getCoreRowModel().rows]);

    const rotarianReviews = useQueries({
        queries: allData.map(camper => ({
            queryKey: ['rotarianReview', camper.userSub]
        }))
    })

    const camperStatuses = useQueries({
        queries: allData.map(camper => ({
            queryKey: ['camperStatus', camper.userSub]
        }))
    })


    // const queryClient = useQueryClient();

    // const rotarianReviews = useMemo(() => queryClient.getQueryCache().findAll({ queryKey: ['rotarianReview'] }), [isPending]);
    // console.log(rotarianReviews);
    const queryClient = useQueryClient();

    const numProfiles = useMemo(() => allData?.length ?? 0, [allData]);
    const numProfilesComplete = useMemo(() => allData?.filter(camper => camper.profileComplete).length ?? 0, [allData]);
    const numApplicationsSubmitted = useMemo(() => allData?.filter(camper => camper.applicationComplete).length ?? 0, [allData]);

    const numAcceptedCampers = useMemo(() => allData?.filter(camper => {
        const rotarianReview = queryClient.getQueryData(['rotarianReview', camper.userSub]) as RotarianReviewSchemaType | null | undefined;
        return rotarianReview?.review === "APPROVED";
    }).length ?? 0, [allData, rotarianReviews]);

    const numRejectedCampers = useMemo(() => allData?.filter(camper => {
        const rotarianReview = queryClient.getQueryData(['rotarianReview', camper.userSub]) as RotarianReviewSchemaType | null | undefined;
        return rotarianReview?.review === "REJECTED";
    }).length ?? 0, [allData, rotarianReviews]);

    const numDocumentsSubmitted = useMemo(() => allData?.filter(camper => { 
        const status = queryClient.getQueryData(['camperStatus', camper.userSub]) as CamperStatusSchemaType | null | undefined;
        return status?.documentsComplete;
    }).length ?? 0, [allData, camperStatuses]);

    const numConfirmedCampers = useMemo(() => allData?.filter(({ attendanceConfirmations: a }) => a ? a > 0 : false).length ?? 0, [allData]);


    return (
        <div className="metrics-container">
            <div className="metric-container">
                <div className="d-flex align-items-center justify-content-center">
                    <FontAwesomeIcon icon={faUser} className="text-muted me-1" />
                    <span>{numProfiles}</span>
                </div>
                <div className="metric-text text-muted">Profiles</div>
            </div>
            <div className="metric-container">
                <div className="d-flex align-items-center justify-content-center">
                    <FontAwesomeIcon icon={faUser} className="text-success me-1" />
                    <span>{numProfilesComplete}</span>
                </div>
                <div className="metric-text text-muted">Profiles Completed</div>
            </div>
            <div className="metric-container">
                <div className="d-flex align-items-center justify-content-center">
                    <FontAwesomeIcon icon={faFolderOpen} className="me-1" />
                    <span>{numApplicationsSubmitted}</span>
                </div>
                <div className="metric-text text-muted">Applications Submitted</div>
            </div>
            <div className="metric-container">
                <div className="d-flex align-items-center justify-content-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-success me-1" />
                    <span>{numAcceptedCampers}</span>
                </div>
                <div className="metric-text text-muted">Accepted Campers</div>
            </div>
            <div className="metric-container">
                <div className="d-flex align-items-center justify-content-center">
                    <FontAwesomeIcon icon={faCircleXmark} className="text-danger me-1" />
                    <span>{numRejectedCampers}</span>
                </div>
                <div className="metric-text text-muted">Rejected Campers</div>
            </div>
            <div className="metric-container">
                <div className="d-flex align-items-center justify-content-center">
                    <FontAwesomeIcon icon={faFileAlt} className="me-1" />
                    <span>{numDocumentsSubmitted}</span>
                </div>
                <div className="metric-text text-muted">Documents Completed</div>
            </div>
            <div className="metric-container">
                <div className="d-flex align-items-center justify-content-center">
                    <FontAwesomeIcon icon={faCheckDouble} className="text-success me-1" />
                    <span>{numConfirmedCampers}</span>
                </div>
                <div className="metric-text text-muted">Confirmed Campers</div>
            </div>
        </div>
    );
}

function TableFilters({ table }: { table: TanstackTable<CamperProfileRowData> }) {
    let isAcceptedCampersChecked = false;
    let isRejectedCampersChecked = false;

    const col = table.getColumn('rotarianReview');
    const value = col?.getFilterValue();
    // console.log("rotarianReview (accepted)", value);
    if (Array.isArray(value)) {
        isAcceptedCampersChecked = value.includes("APPROVED") ?? false;
        isRejectedCampersChecked = value.includes("REJECTED") ?? false;
    }


    return (
        <div className="d-flex flex-grow-1 column-gap-2 flex-row-reverse">
            <DropdownButton size="sm" variant="light" title="Filters">
                <div className="filters-dropdown-container">
                    <div>
                        <Form.Check
                            type="checkbox"
                            label="Profiles Completed"
                            className="filter-item"
                            checked={table.getColumn('profileComplete')?.getFilterValue() ? true : false}
                            onChange={(e) => table.getColumn('profileComplete')?.setFilterValue(e.target.checked)}
                        />
                        <Form.Check
                            type="checkbox"
                            label="Applications Submitted"
                            className="filter-item"
                            checked={table.getColumn('applicationComplete')?.getFilterValue() ? true : false}
                            onChange={(e) => table.getColumn('applicationComplete')?.setFilterValue(e.target.checked)}
                        />
                        <Form.Check
                            type="checkbox"
                            label="Accepted Campers"
                            className="filter-item"
                            checked={isAcceptedCampersChecked}
                            onChange={(e) => {
                                const col = table.getColumn('rotarianReview');


                                col?.setFilterValue((curFilterValue: string[]) => {
                                    // console.log("curFilterValue", curFilterValue);
                                    if (e.target.checked) {
                                        // console.log("checked", e.target.checked);
                                        const retval = [...(curFilterValue ?? []), "APPROVED"];
                                        return retval;
                                    }
                                    return curFilterValue?.filter(v => v !== "APPROVED");
                                });
                            }}
                        />
                        <Form.Check
                            type="checkbox"
                            label="Rejected Campers"
                            className="filter-item"
                            checked={isRejectedCampersChecked}
                            onChange={(e) => {
                                const col = table.getColumn('rotarianReview');
                                col?.setFilterValue((curFilterValue: string[]) => {
                                    if (e.target.checked) {
                                        return [...(curFilterValue ?? []), "REJECTED"];
                                    }
                                    return curFilterValue?.filter(v => v !== "REJECTED");
                                });
                            }}
                        />
                        <Form.Check
                            type="checkbox"
                            label="Documents Submitted"
                            className="filter-item"
                            checked={table.getColumn('documentsComplete')?.getFilterValue() ? true : false}
                            onChange={(e) => table.getColumn('documentsComplete')?.setFilterValue(e.target.checked)}
                        />
                        <Form.Check
                            type="checkbox"
                            label="Confirmed Campers"
                            className="filter-item"
                            checked={table.getColumn('attendanceConfirmations')?.getFilterValue() ? true : false}
                            onChange={(e) => table.getColumn('attendanceConfirmations')?.setFilterValue(e.target.checked)}
                        />

                    </div>

                </div>
            </DropdownButton>
            <DropdownButton size="sm" variant="light" title="Columns">
                <div className="filters-dropdown-container">
                    <Form.Check
                        type="checkbox"
                        checked={table.getIsAllColumnsVisible()}
                        onChange={table.getToggleAllColumnsVisibilityHandler()}
                        label="Toggle All"
                    />

                    <ThinSpacer />
                    <div className="filter-dropdown-items">
                        {table.getAllLeafColumns().map((column) => (

                            <Form.Check
                                id={column.id}
                                key={column.id}
                                type="checkbox"
                                className="filter-item"
                                label={column.id}
                                checked={column.getIsVisible()}
                                onChange={column.getToggleVisibilityHandler()}
                            />

                        ))}
                    </div>
                </div>


            </DropdownButton>
        </div>
    );
}

interface CampManagementHeaderProps {
    table: TanstackTable<CamperProfileRowData>;
    onSettingsClick?: () => void;
}

export const CampManagementHeader = ({ table, onSettingsClick }: CampManagementHeaderProps) => {


    return (
        <div className="d-flex flex-wrap align-items-end justify-content-between column-gap-2 row-gap-2">
            <BasicCampInfo onSettingsClick={onSettingsClick} />
            <CampMetrics table={table} />
            <TableFilters table={table} />
        </div>
    );
};