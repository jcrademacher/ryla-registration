
import { CampManagementHeader } from './CampManagementHeader';
import { CamperTable } from './CamperTable';
import { useState } from 'react';
import { useCamperDataAdminQuery, useCampQuery } from '../../queries/adminQueries';
import { createFromISO } from '../../utils/datetime';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router';
import { 
    ColumnFiltersState, 
    createColumnHelper, 
    getCoreRowModel, 
    getFilteredRowModel, 
    getSortedRowModel, 
    OnChangeFn, 
    Row, 
    SortingState, 
    useReactTable, 
    VisibilityState, 
    RowSelectionState 
} from '@tanstack/react-table';

import { Placeholder } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClockRotateLeft, faTimes } from '@fortawesome/free-solid-svg-icons';
import { formatPhoneNumber } from '../../utils/fields';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
// import { generateFakeCamperProfiles } from '../../utils/makeData';
import { useParams } from 'react-router';
import { useUpdateCamperProfileFilterStateMutation, useUpdateCamperProfileViewStateMutation } from '../../queries/adminMutations';
import { useQueryClient } from '@tanstack/react-query';
import { TableActions } from './TableActions';
import { CampSettings } from './CampSettings';
import { CamperProfileRowData } from '../../api/apiCamperTable';

const columnHelper = createColumnHelper<CamperProfileRowData>();

const TSHIRT_SIZE_ORDER: Record<string, number> = {
    'XXS': 0, 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6,
};

const tshirtSizeSortingFn = (rowA: Row<any>, rowB: Row<any>, columnId: string) => {
    const a = rowA.original[columnId];
    const b = rowB.original[columnId];

    const aMissing = !a;
    const bMissing = !b;

    if (aMissing && bMissing) return 0;
    if (aMissing) return 1;
    if (bMissing) return -1;

    return (TSHIRT_SIZE_ORDER[a] ?? 99) - (TSHIRT_SIZE_ORDER[b] ?? 99);
};

const undefinedLastSortingFn = (rowA: Row<any>, rowB: Row<any>, columnId: string) => {
    const a = rowA.original[columnId];
    const b = rowB.original[columnId];
  
    const aMissing = !a;
    const bMissing = !b;
  
    if (aMissing && bMissing) return 0;
    if (aMissing) return 1;   // A after B → undefined/empty last
    if (bMissing) return -1;  // B after A
  
    // Normal comparison (string example)
    return String(a).localeCompare(String(b));
  };

interface StatusColumnProps {
    status: "APPROVED" | "PENDING" | "REJECTED" | boolean | null | undefined,
    isLoading?: boolean
}

function StatusColumn({ status, isLoading }: StatusColumnProps) {
    let content;
    if (isLoading) {
        content = (
            <Placeholder animation="glow">
                <Placeholder xs={12} />
            </Placeholder>
        );
    }
    else if (status === "APPROVED" || status === true) {
        content = <div className="text-center"><FontAwesomeIcon className="text-success" icon={faCheck} /></div>;
    }
    else if (status === "REJECTED") {
        content = <div className="text-center"><FontAwesomeIcon className="text-danger" icon={faTimes} /></div>;
    }
    else {
        content = <div className="text-center"><FontAwesomeIcon className="text-warning" icon={faClockRotateLeft} /></div>;
    }

    return content;
}

function StatusHeader({ title, helpText }: { title: string, helpText?: string }) {
    return (
        <OverlayTrigger
            placement="top"
            delay={{ show: 1000, hide: 100 }}
            overlay={
                <Tooltip id={`tooltip-status`}>
                    {helpText}
                </Tooltip>
            }
        >
            <div className="status-header">{title}</div>
        </OverlayTrigger>
    )
}

const columns = [
    columnHelper.accessor('profileComplete', {
        header: () => <StatusHeader title="P" helpText="Camper has completed basic information" />,
        cell: (props) => <StatusColumn status={props.getValue()} />,
    }),
    columnHelper.accessor('applicationComplete', {
        header: () => <StatusHeader title="A" helpText="Camper has completed application (including essay if required)" />,
        cell: (props) => <StatusColumn status={props.getValue()} />,
    }),
    columnHelper.accessor('rotarianReview', {
        header: () => <StatusHeader title="R" helpText="Rotarian review status" />,
        cell: (props) => <StatusColumn status={props.getValue()} />,
    }),
    columnHelper.accessor('documentsComplete', {
        header: () => {
            return <StatusHeader title="D" helpText="Camper has completed all required documents (including mailed forms)" />;
        },
        cell: (props) => <StatusColumn status={props.getValue()} />
    }),
    columnHelper.accessor(row => {
        const val = row.applicationSubmittedAt;
        return val ? createFromISO(val).toLocaleString(DateTime.DATETIME_MED) : undefined;
    }, {
        id: 'applicationSubmittedAt',
        header: 'Submitted At',
        // sortingFn: dateSortingFn,
        sortDescFirst: true,
    }),
    columnHelper.accessor(row => row.email ?? undefined, {
        id: 'email',
        header: 'Email',
    }),
    columnHelper.accessor(row => row.firstName ?? undefined, {
        id: 'firstName',
        header: 'First Name',
    }),
    columnHelper.accessor(row => row.middleInitial ?? undefined, {
        id: 'middleInitial',
        header: 'Middle Initial',
    }),
    columnHelper.accessor(row => row.lastName ?? undefined, {
        id: 'lastName',
        header: 'Last Name',
    }),
    columnHelper.accessor(row => formatPhoneNumber(row.phone) ?? undefined, {
        id: 'phone',
        header: 'Phone'
    }),
    columnHelper.accessor(row => row.nickname ?? undefined, {
        id: 'nickname',
        header: 'Nickname',
    }),
    columnHelper.accessor(row => {
        const val = row.birthdate;
        return val ? createFromISO(val).toLocaleString(DateTime.DATE_MED) : undefined;
    }, {
        id: 'birthdate',
        header: 'Birthdate',
    }),
    columnHelper.accessor(row => row.gender ?? undefined, {
        id: 'gender',
        header: 'Gender',
    }),
    columnHelper.accessor(row => row.address ?? undefined, {
        id: 'address',
        header: 'Address',
    }),
    columnHelper.accessor(row => row.city ?? undefined, {
        id: 'city',
        header: 'City',
    }),
    columnHelper.accessor(row => row.state ?? undefined, {
        id: 'state',
        header: 'State',
    }),
    columnHelper.accessor(row => row.zipcode ?? undefined, {
        id: 'zipcode',
        header: 'Zipcode',
    }),
    columnHelper.accessor(row => row.highSchool ?? undefined, {
        id: 'highSchool',
        header: 'High School'
    }),
    columnHelper.accessor(row => row.rotaryClub?.name ?? undefined, {
        id: 'rotaryClub',
        header: 'Sponsoring Rotary Club',
    }),
    columnHelper.accessor(row => row.guidanceCounselorName ?? undefined, {
        id: 'guidanceCounselorName',
        header: 'Guidance Counselor Name',
    }),
    columnHelper.accessor(row => row.guidanceCounselorEmail ?? undefined, {
        id: 'guidanceCounselorEmail',
        header: 'Guidance Counselor Email',
    }),
    columnHelper.accessor(row => row.guidanceCounselorPhone ?? undefined, {
        id: 'guidanceCounselorPhone',
        header: 'Guidance Counselor Phone',
    }),
    columnHelper.accessor(row => row.dietaryRestrictions ?? undefined, {
        id: 'dietaryRestrictions',
        header: 'Dietary Restrictions',
    }),
    columnHelper.accessor(row => row.dietaryRestrictionsNotes ?? undefined, {
        id: 'dietaryRestrictionsNotes',
        header: 'Dietary Restrictions Notes',
    }),
    columnHelper.accessor(row => row.parent1FirstName ?? undefined, {
        id: 'parent1FirstName',
        header: 'Parent 1 First Name',
    }),
    columnHelper.accessor(row => row.parent1LastName ?? undefined, {
        id: 'parent1LastName',
        header: 'Parent 1 Last Name',
    }),
    columnHelper.accessor(row => row.parent1Email ?? undefined, {
        id: 'parent1Email',
        header: 'Parent 1 Email',
    }),
    columnHelper.accessor(row => formatPhoneNumber(row.parent1Phone) ?? undefined, {
        id: 'parent1Phone',
        header: 'Parent 1 Phone',
    }),
    columnHelper.accessor(row => row.parent2FirstName ?? undefined, {
        id: 'parent2FirstName',
        header: 'Parent 2 First Name',
    }),
    columnHelper.accessor(row => row.parent2LastName ?? undefined, {
        id: 'parent2LastName',
        header: 'Parent 2 Last Name',
    }),
    columnHelper.accessor(row => row.parent2Email ?? undefined, {
        id: 'parent2Email',
        header: 'Parent 2 Email',
    }),
    columnHelper.accessor(row => formatPhoneNumber(row.parent2Phone) ?? undefined, {
        id: 'parent2Phone',
        header: 'Parent 2 Phone',
    }),
    columnHelper.accessor(row => row.emergencyContactName ?? undefined, {
        id: 'emergencyContactName',
        header: 'Emergency Contact Name',
    }),
    columnHelper.accessor(row => formatPhoneNumber(row.emergencyContactPhone) ?? undefined, {
        id: 'emergencyContactPhone',
        header: 'Emergency Contact Phone',
    }),
    columnHelper.accessor(row => row.tshirtSize ?? undefined, {
        id: 'tshirtSize',
        header: 'T-Shirt Size',
        sortingFn: tshirtSizeSortingFn,
    }),
];

// const fakeData = generateFakeCamperProfiles(100);


export const CampManagementPage = () => {
    const { campId } = useParams();
    const { data: camp } = useCampQuery();

    const { data: campers, isPending } = useCamperDataAdminQuery(campId);
    const queryClient = useQueryClient();

    const mutateViewState = useUpdateCamperProfileViewStateMutation();
    const mutateFilterState = useUpdateCamperProfileFilterStateMutation();

    const handleColumnVisibilityChange: OnChangeFn<VisibilityState> = (updaterOrValue) => {
        let newVisibility;
        if (typeof updaterOrValue === 'function') {
            newVisibility = updaterOrValue(camp?.viewState ?? {});
        }
        else {
            newVisibility = updaterOrValue;
        }

        queryClient.setQueryData(['camp', campId], { ...camp, viewState: newVisibility });
        mutateViewState.mutate({
            campId: campId ?? "",
            viewState: newVisibility,
        }, {
            onSuccess: () => {
                console.log("Successfully updated view state");
                queryClient.invalidateQueries({ queryKey: ['camp', campId] });
            },
        });
    };

    const filterState = useMemo(() => {
        let filterResult: ColumnFiltersState = [];

        if (camp?.filterState?.profileComplete) {
            filterResult.push({
                id: 'profileComplete',
                value: true,
            });
        }
        if (camp?.filterState?.applicationComplete) {
            filterResult.push({
                id: 'applicationComplete',
                value: true,
            });
        }
        if (camp?.filterState?.documentsComplete) {
            filterResult.push({
                id: 'documentsComplete',
                value: true,
            });
        }

        let rotarianReviewFilter: string[] = [];
        if (camp?.filterState?.acceptedCampers) {
            rotarianReviewFilter.push("APPROVED");
        }

        if (camp?.filterState?.rejectedCampers) {
            rotarianReviewFilter.push("REJECTED");
        }

        if(rotarianReviewFilter.length > 0) {
            filterResult.push({
                id: 'rotarianReview',
                value: rotarianReviewFilter,
            });
        }

        if (camp?.filterState?.confirmedCampers) {
            filterResult.push({
                id: 'attendanceConfirmations',
                value: 1,
            });
        }

        return filterResult;

    }, [camp?.filterState]);

    // console.log(filterState);

    const handleFilterStateChange: OnChangeFn<ColumnFiltersState> = (updaterOrValue) => {
        // console.log(updaterOrValue);
        let newFilterState;
        if (typeof updaterOrValue === 'function') {
            newFilterState = updaterOrValue(filterState);
        }
        else {
            newFilterState = updaterOrValue;
        }

        console.log(newFilterState);

        const rotarianReviewFilter = newFilterState.find(filter => filter.id === 'rotarianReview')?.value;

        const newFilterStateObject = {
            profileComplete: newFilterState.find(filter => filter.id === 'profileComplete')?.value ? true : false,
            applicationComplete: newFilterState.find(filter => filter.id === 'applicationComplete')?.value ? true : false,
            documentsComplete: newFilterState.find(filter => filter.id === 'documentsComplete')?.value ? true : false,
            acceptedCampers: Array.isArray(rotarianReviewFilter) && rotarianReviewFilter.includes("APPROVED") ? true : false,
            rejectedCampers: Array.isArray(rotarianReviewFilter) && rotarianReviewFilter.includes("REJECTED") ? true : false,
            confirmedCampers: newFilterState.find(filter => filter.id === 'attendanceConfirmations')?.value ? true : false,
        };

        queryClient.setQueryData(['camp', campId], { ...camp, filterState: newFilterStateObject });
        mutateFilterState.mutate({
            campId: campId ?? "",
            filterState: newFilterStateObject,
        });
    }

    // const { register, setFocus } = useForm<SearchFormData>();
    // const [globalFilter, setGlobalFilter] = useState<any>([]);

    // useHotkeys(['ctrl+f', 'meta+f'], (event) => {
    //     event.preventDefault();
    //     setFocus('search');
    // }, [setFocus]);

    const tableData = useMemo(() => campers ?? [], [campers]);
    // const tableData = useMemo(() => fakeData, []);

    const [sorting, setSorting] = useState<SortingState>([{
        id: 'applicationSubmittedAt',
        desc: true,
    }]);

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({}) //manage your own row selection state

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getRowId: (row) => row.userSub,
        state: {
            sorting,
            columnVisibility: camp?.viewState ?? {},
            columnFilters: filterState,
            rowSelection
        },
        defaultColumn: {
            sortingFn: undefinedLastSortingFn,
            sortUndefined: 'last',
            sortDescFirst: false,
        },
        onSortingChange: setSorting,
        onColumnVisibilityChange: handleColumnVisibilityChange,
        onColumnFiltersChange: handleFilterStateChange,
        onRowSelectionChange: setRowSelection,
    });

    const navigate = useNavigate();

    const handleSettingsOpen = () => {
        navigate(`/admin/camps/${campId}/settings`);
    };

    return (
        <>
            <Routes>
                <Route path="/" element={
                    <>
                        <CampManagementHeader
                            table={table}
                            onSettingsClick={handleSettingsOpen}
                        />
                        <TableActions 
                            table={table}
                        />
                        <CamperTable
                            table={table}
                            isPending={isPending}
                        />
                    </>
                } />
                <Route path="settings" element={<CampSettings />} />
            </Routes>

        </>
    );
};

