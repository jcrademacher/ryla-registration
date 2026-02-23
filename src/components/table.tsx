import { type Table } from "@tanstack/react-table"

import {
    faChevronLeft,
    faChevronRight,
    faAnglesLeft,
    faAnglesRight,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import { Button, Form } from "react-bootstrap"

interface DataTablePaginationProps<TData> {
    table: Table<TData>
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
