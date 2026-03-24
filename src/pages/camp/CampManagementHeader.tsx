import { useMemo } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { createEDT, formatCampDates, formatDateFullWithTime } from '../../utils/datetime';
import { Button, Form, Placeholder, DropdownButton } from 'react-bootstrap';
import { useCampQuery } from '../../queries/adminQueries';
import { Table as TanstackTable } from '@tanstack/table-core';
import { CamperProfileRowData } from '../../api/apiCamperTable';
import { ThinSpacer } from '../../components/ThinSpacer';

// interface CampMetrics {
//     profileCompleteCampers: number;
//     applicationCompleteCampers: number;
//     documentsCompleteCampers: number;
//     totalCampers: number;
//     acceptedCampers: number;
//     rejectedCampers: number;
//     confirmedCampers: number;
// }

// type ApplicationDeadlineForm = {
//     applicationDeadline: string;
// }

const BasicCampInfo = ({ onSettingsClick }: { onSettingsClick?: () => void }) => {
    const { data: camp, isPending: isPendingCamp } = useCampQuery();

    const applicationDeadline = useMemo(() => createEDT(camp?.applicationDeadline ?? ""), [camp?.applicationDeadline]);

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
                    <h4 className="mb-0">{camp?.name}</h4>
                    <Button 
                        variant="link" 
                        className="p-0 ms-2"
                        style={{ border: 'none', color: '#6c757d' }}
                        onClick={onSettingsClick}
                    >
                        <FontAwesomeIcon icon={faGear} size="sm" />
                    </Button>
                </div>

                <small className="text-muted">{formatCampDates(camp)}
                    <br/>
                    {`Applications are due by ${formatDateFullWithTime(applicationDeadline)}`}
                </small>
            </div>
        );
    }

    return content;
};


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
                            label="Admitted Campers"
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
                        {/* <Form.Check
                            type="checkbox"
                            label="Confirmed Campers"
                            className="filter-item"
                            checked={table.getColumn('attendanceConfirmations')?.getFilterValue() ? true : false}
                            onChange={(e) => table.getColumn('attendanceConfirmations')?.setFilterValue(e.target.checked)}
                        /> */}

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
        <div className="d-flex flex-wrap align-items-end justify-content-between ">
            <BasicCampInfo onSettingsClick={onSettingsClick} />
            {/* <CampMetrics table={table} /> */}
            <TableFilters table={table} />
        </div>
    );
};