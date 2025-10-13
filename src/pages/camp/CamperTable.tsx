
import { Table as TanstackTable } from "@tanstack/table-core";
import { Placeholder } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { flexRender } from "@tanstack/react-table";
import { CamperProfileRowData } from "./CampManagementPage";


interface CamperTableProps {
    table: TanstackTable<CamperProfileRowData>;
    isPending: boolean;
}

export function CamperTable({ table, isPending }: CamperTableProps) {

    const TableBody = () => {
        return (
            <tbody>
                {table.getRowModel().rows.map((row) => (
                    <tr
                        key={row.id}
                        // onDoubleClick={(e) => {
                        //     e.preventDefault();
                        //     e.stopPropagation();
                        //     navigate(`/camper-view/${row.original.userSub}`);
                        // }}
                        onMouseDown={(e) => {
                            // e.preventDefault();
                            // e.stopPropagation();
                            if (e.shiftKey) {
                                // Shift+click: add to selection (toggle this row)
                                row.getToggleSelectedHandler()(e);
                            } else {
                                // Regular click: deselect all others and select only this row
                                const isCurrentlySelected = row.getIsSelected();
                                table.resetRowSelection();
                                if (!isCurrentlySelected) {
                                    row.toggleSelected(true);
                                }
                            }
                        }}
                        className={row.getIsSelected() ? 'selected' : ''}
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
    };


    function LoadingTableBody() {
        return (
            <tbody>
                {table.getHeaderGroups().map(headerGroup => {
                    return (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => ( // map over the headerGroup headers array
                                <td
                                    key={header.id}
                                    colSpan={header.colSpan}
                                >
                                    <Placeholder animation="glow">
                                        <Placeholder xs={12} />
                                    </Placeholder>
                                </td>
                            ))}
                        </tr>
                    );
                })}
            </tbody>
        )
    }

    return (
        <>
            <table id="admin-table">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => {
                        return (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => ( // map over the headerGroup headers array
                                    <th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        <div className="sort-icon">
                                            {header.column.getIsSorted() ? (header.column.getIsSorted() === 'asc' ?
                                                <FontAwesomeIcon icon={faChevronUp} /> :
                                                <FontAwesomeIcon icon={faChevronDown} />) : ''}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        )
                    })}
                </thead>
                {isPending ? <LoadingTableBody /> : <TableBody />}
            </table>
        </>
    );
}
