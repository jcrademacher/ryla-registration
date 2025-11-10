
import { CampManagementHeader } from './CampManagementHeader';
import { CamperTable } from './CamperTable';
import { useState } from 'react';
import { useCamperProfilesByCampQuery, useCampQuery, useObserveCamperProfilesByCampQuery } from '../../queries/adminQueries';
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

import { CamperProfileSchemaType } from '../../api/apiCamperProfile';
import { Placeholder } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClockRotateLeft, faTimes, faXmark } from '@fortawesome/free-solid-svg-icons';
import { formatPhoneNumber } from '../../utils/fields';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
// import { generateFakeCamperProfiles } from '../../utils/makeData';
import { useParams } from 'react-router';
import { useUpdateCamperProfileFilterStateMutation, useUpdateCamperProfileViewStateMutation } from '../../queries/adminMutations';
import { useQueryClient } from '@tanstack/react-query';
import { TableActions } from './TableActions';
import { CampSettings } from './CampSettings';
import { functionalQueryClient } from '../../main';
import { useDocumentStatusQuery, useRotarianReviewQuery, useRotaryClubQuery } from '../../queries/queries';
import { PlaceholderElement } from '../../components/PlaceholderElement';
import { RotarianReviewSchemaType } from '../../api/apiRotarianReview';


export type CamperProfileRowData = CamperProfileSchemaType;

const columnHelper = createColumnHelper<CamperProfileRowData>();

const luxonSortingFn = (rowA: Row<any>, rowB: Row<any>, columnId: string) => {
    return createFromISO(rowA.original[columnId]) < createFromISO(rowB.original[columnId]) ? -1 : 1;
}

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
        header: () => <StatusHeader title="A" helpText="Camper has completed application (essay, references, etc.)" />,
        cell: (props) => <StatusColumn status={props.getValue()} />,
    }),
    columnHelper.accessor('rotarianReview', {
        header: () => <StatusHeader title="R" helpText="Rotarian review status" />,
        cell: (props) => {
            const { data: rotarianReview, isPending: isPendingRotarianReview } = useRotarianReviewQuery(props.row.original.userSub);
            
            return <StatusColumn status={rotarianReview?.review} isLoading={isPendingRotarianReview} />;
        },
        filterFn: (row, _, filterValue) => {

            const rotarianReview = functionalQueryClient.getQueryData(['rotarianReview', row.original.userSub]) as RotarianReviewSchemaType | null | undefined;
            
            if(filterValue.length === 0) {
                return true;
            }
            else {
                return filterValue.includes(rotarianReview?.review ?? "");
            }
            // return true;
        }

    }),
    columnHelper.accessor('documentsComplete', {
        header: () => {
            return <StatusHeader title="D" helpText="Camper has completed all required documents (including mailed forms)" />;
        },
        cell: (props) => {
            const { data: documentsComplete, isLoading: isDocumentsCompleteLoading } = useDocumentStatusQuery(props.row.original.userSub, props.row.original.campId);
            return <StatusColumn status={documentsComplete} isLoading={isDocumentsCompleteLoading} />;
        },
        filterFn: (row, _, filterValue) => {
            const documentsComplete = functionalQueryClient.getQueryData(
                ['documentStatus', row.original.campId, row.original.userSub]) as boolean | null | undefined;
            return documentsComplete === filterValue;
        }
    }),
    // columnHelper.accessor('attendanceConfirmations', {
    //     header: () => <StatusHeader title="C" helpText="Camper has confirmed attendance" />,
    //     cell: (props) => <StatusColumn status={!!props.getValue()} />,
    //     filterFn: (row, _, filterValue) => {
    //         return (row.original.attendanceConfirmations ?? 0) >= filterValue;
    //     }
    // }),
    // columnHelper.accessor('createdAt', {
    //     header: 'Created At',
    //     cell: info => createFromISO(info.getValue()).toLocaleString(DateTime.DATETIME_MED),
    //     sortingFn: luxonSortingFn
    // }),
    columnHelper.accessor('applicationSubmittedAt', {
        header: 'Submitted At',
        cell: info => {
            const val = info.getValue();
            if(val) {
                return createFromISO(val).toLocaleString(DateTime.DATETIME_MED);
            }
            else {
                return ''; 
            }
        },
        sortingFn: luxonSortingFn
    }),
    columnHelper.accessor('email', {
        header: 'Email',
    }),
    columnHelper.accessor('firstName', {
        header: 'First Name',
    }),
    columnHelper.accessor('middleInitial', {
        header: 'Middle Initial',
    }),
    columnHelper.accessor('lastName', {
        header: 'Last Name',
    }),
    columnHelper.accessor('phone', {
        header: 'Phone',
        cell: info => formatPhoneNumber(info.getValue())
    }),
    columnHelper.accessor('nickname', {
        header: 'Nickname',
    }),
    columnHelper.accessor('birthdate', {
        header: 'Birthdate',
        cell: info => info.getValue() ? createFromISO(info.getValue() as string).toLocaleString(DateTime.DATE_MED) : '',
        sortingFn: luxonSortingFn
    }),
    columnHelper.accessor('gender', {
        header: 'Gender',
    }),
    columnHelper.accessor('address', {
        header: 'Address',
    }),
    columnHelper.accessor('city', {
        header: 'City',
    }),
    columnHelper.accessor('state', {
        header: 'State',
    }),
    columnHelper.accessor('zipcode', {
        header: 'Zipcode',
    }),
    columnHelper.accessor('highSchool', {
        header: 'High School',
    }),
    columnHelper.accessor('rotaryClubId', {
        header: 'Sponsoring Rotary Club',
        cell: (props) => {
            const { data: rotaryClub, isPending: isPendingRotaryClub, isError: isErrorRotaryClub } = useRotaryClubQuery(props.row.original.rotaryClubId);
            if(isErrorRotaryClub) {
                return <div className="text-danger">
                    <FontAwesomeIcon icon={faXmark} className="me-1" />
                    Failed
                </div>;
            }
            if(props.row.original.rotaryClubId)
                return <PlaceholderElement isLoading={isPendingRotaryClub} props={{ xs: 7 }}>{rotaryClub?.name}</PlaceholderElement>;
            else 
                return null;
        }
    }),
    columnHelper.accessor('guidanceCounselorName', {
        header: 'Guidance Counselor Name',
    }),
    columnHelper.accessor('guidanceCounselorEmail', {
        header: 'Guidance Counselor Email',
    }),
    columnHelper.accessor('guidanceCounselorPhone', {
        header: 'Guidance Counselor Phone',
        cell: info => formatPhoneNumber(info.getValue())
    }),
    columnHelper.accessor('dietaryRestrictions', {
        header: 'Dietary Restrictions',
    }),
    columnHelper.accessor('dietaryRestrictionsNotes', {
        header: 'Dietary Restrictions Notes',
    }),
    columnHelper.accessor('parent1FirstName', {
        header: 'Parent 1 First Name',
    }),
    columnHelper.accessor('parent1LastName', {
        header: 'Parent 1 Last Name',
    }),
    columnHelper.accessor('parent1Email', {
        header: 'Parent 1 Email',
    }),
    columnHelper.accessor('parent1Phone', {
        header: 'Parent 1 Phone',
        cell: info => formatPhoneNumber(info.getValue()),
    }),
    columnHelper.accessor('parent2FirstName', {
        header: 'Parent 2 First Name',
    }),
    columnHelper.accessor('parent2LastName', {
        header: 'Parent 2 Last Name',
    }),
    columnHelper.accessor('parent2Email', {
        header: 'Parent 2 Email',
    }),
    columnHelper.accessor('parent2Phone', {
        header: 'Parent 2 Phone',
        cell: info => formatPhoneNumber(info.getValue()),
    }),
    columnHelper.accessor('emergencyContactName', {
        header: 'Emergency Contact Name',
    }),
    columnHelper.accessor('emergencyContactPhone', {
        header: 'Emergency Contact Phone',
        cell: info => formatPhoneNumber(info.getValue()),
    }),
];

// const fakeData = generateFakeCamperProfiles(100);


export const CampManagementPage = () => {
    const { campId } = useParams();
    const { data: camp } = useCampQuery();

    const { data: campers, isPending } = useCamperProfilesByCampQuery();
    useObserveCamperProfilesByCampQuery(campId);

    const mutateViewState = useUpdateCamperProfileViewStateMutation();
    const mutateFilterState = useUpdateCamperProfileFilterStateMutation();

    const queryClient = useQueryClient();

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

        filterResult.push({
            id: 'rotarianReview',
            value: rotarianReviewFilter,
        });

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
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['camp', campId] });
            },
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

