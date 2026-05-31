import { ReactNode, useEffect, useMemo, useState } from "react"
import {
    flexRender,
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    createColumnHelper,
    type Table as TanstackTable,
    type ColumnDef,
    type SortingState,
    type PaginationState,
} from "@tanstack/react-table"

import {
    faChevronLeft,
    faChevronRight,
    faChevronUp,
    faChevronDown,
    faAnglesLeft,
    faAnglesRight,
    faSearch,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { Alert, Button, Form, Placeholder, Table } from "react-bootstrap"
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query"
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"

interface DataTablePaginationProps<TData> {
    table: TanstackTable<TData>
    fetchNextPage: () => void
    hasNextPage: boolean
    isFetchingNextPage: boolean
}

export function DataTablePagination<TData>({
    table,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
}: DataTablePaginationProps<TData>) {
    return (
        <div className="d-flex align-items-center justify-content-between px-2">
            <div className="text-muted flex-fill">
                <small>
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </small>
            </div>
            <div className="d-flex align-items-center gap-4">
                <div className="d-flex align-items-center gap-2">
                    <small className="fw-medium">Rows per page</small>
                    <Form.Select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => {
                            table.setPageSize(Number(e.target.value))
                        }}
                        style={{ width: '80px' }}
                        size="sm"
                    >
                        {[10, 25, 50, 100].map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </Form.Select>
                </div>
                <div className="d-flex align-items-center justify-content-center" style={{ width: '100px' }}>
                    <small className="fw-medium">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </small>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <Button
                        variant="light"
                        size="sm"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <FontAwesomeIcon icon={faAnglesLeft} />
                        <span className="visually-hidden">Go to first page</span>
                    </Button>
                    <Button
                        variant="light"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                        <span className="visually-hidden">Go to previous page</span>
                    </Button>
                    <Button
                        variant="light"
                        size="sm"
                        onClick={() => {
                            if(!table.getCanNextPage()) {
                                fetchNextPage();
                            }
                            table.nextPage();
                        }}
                        disabled={!hasNextPage && !table.getCanNextPage() || isFetchingNextPage}
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                        <span className="visually-hidden">Go to next page</span>
                    </Button>
                    <Button
                        variant="light"
                        size="sm"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <FontAwesomeIcon icon={faAnglesRight} />
                        <span className="visually-hidden">Go to last page</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}

interface SearchablePaginatedTableProps<TRow> {
    query: UseInfiniteQueryResult<InfiniteData<{
        items: TRow [];
        nextToken?: string | null;
    }, unknown>, Error>
    columns: ColumnDef<TRow, any>[];
    renderActions?: (row: TRow) => ReactNode;
}

export function SearchablePaginatedTable<TRow>({
    query,
    columns: baseColumns,
    renderActions,
}: SearchablePaginatedTableProps<TRow>) {
    const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = query;

    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 25,
    });

    const rows = useMemo(() => data ? data.pages.flatMap((page: any) => page.items) : [], [data]);

    const columnHelper = createColumnHelper<TRow>();
    const columns = useMemo<ColumnDef<TRow, any>[]>(() => {
        if (!renderActions) return baseColumns;
        return [
            ...baseColumns,
            columnHelper.display({
                id: 'actions',
                header: '',
                cell: ({ row }) => renderActions(row.original),
                enableSorting: false,
            }),
        ];
    }, [baseColumns, renderActions, columnHelper]);

    const table = useReactTable({
        data: rows,
        columns,
        state: { sorting, globalFilter, pagination },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        autoResetPageIndex: false,
    });

    const displayedRowCount = table.getRowModel().rows.length;

    useEffect(() => {
        if (displayedRowCount === 0 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [displayedRowCount, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isError) {
        return (
            <Alert variant="danger">
                <FontAwesomeIcon icon={faTriangleExclamation} className="me-1" />
                {error?.message ?? 'Failed to load data. Please try again later.'}
            </Alert>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small">
                    {table.getFilteredRowModel().rows.length} result{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
                </span>
                <div style={{ maxWidth: 280 }}>
                    <div className="position-relative">
                        <Form.Control
                            size="sm"
                            type="text"
                            placeholder="Search..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                        />
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="position-absolute text-muted"
                            style={{ right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                        />
                    </div>
                </div>
            </div>

            <Table bordered hover>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    colSpan={header.colSpan}
                                    onClick={header.column.getToggleSortingHandler()}
                                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default', userSelect: 'none' }}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getIsSorted() === 'asc' && (
                                        <FontAwesomeIcon icon={faChevronUp} className="ms-2" />
                                    )}
                                    {header.column.getIsSorted() === 'desc' && (
                                        <FontAwesomeIcon icon={faChevronDown} className="ms-2" />
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {(isLoading || isFetchingNextPage) && (
                        <tr>
                            {table.getVisibleLeafColumns().map((column) => (
                                <td key={column.id}>
                                    <Placeholder animation="glow">
                                        <Placeholder xs={12} />
                                    </Placeholder>
                                </td>
                            ))}
                        </tr>
                    )}
                </tbody>
            </Table>

            <DataTablePagination
                table={table}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
            />
        </div>
    )
}
