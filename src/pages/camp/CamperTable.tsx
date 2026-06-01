
import { Table as TanstackTable } from "@tanstack/table-core";
import { Placeholder } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { flexRender } from "@tanstack/react-table";
import { CamperProfileRowData } from "../../api/apiCamperTable";
import { useNavigate } from "react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";


interface CamperTableProps {
    table: TanstackTable<CamperProfileRowData>;
    isPending: boolean;
}

// A cell is identified by its position in the visible grid (row index, column index).
type CellCoord = { r: number; c: number };
// A range is a rectangular block defined by the anchor (where it started) and the focus (current edge).
type CellRange = { anchor: CellCoord; focus: CellCoord };

const cellKey = (r: number, c: number) => `${r}:${c}`;

export function CamperTable({ table, isPending }: CamperTableProps) {

    const navigate = useNavigate();

    const rows = table.getRowModel().rows;

    // The list of selected rectangular ranges. The last range is the "active" one
    // that shift-click and drag extend; its anchor cell gets the bold bounding box.
    const [ranges, setRanges] = useState<CellRange[]>([]);
    // Mirror of `ranges` for synchronous reads inside event handlers (state is async).
    const rangesRef = useRef<CellRange[]>([]);
    const isDraggingRef = useRef(false);
    const tableRef = useRef<HTMLTableElement>(null);

    // Build the row-dimension mirror of the cell ranges for TanStack's row selection.
    const buildRowSelection = useCallback((next: CellRange[]) => {
        const rowSelection: Record<string, boolean> = {};
        for (const range of next) {
            const r0 = Math.min(range.anchor.r, range.focus.r);
            const r1 = Math.max(range.anchor.r, range.focus.r);
            for (let r = r0; r <= r1; r++) {
                const row = rows[r];
                if (row) rowSelection[row.id] = true;
            }
        }
        return rowSelection;
    }, [rows]);

    // Push the new ranges into local state and (optionally) mirror the row dimension
    // into the table's row selection, so existing bulk actions (which read
    // getSelectedRowModel) keep working. During a drag we pass syncSelection=false:
    // table.setRowSelection forces a full table re-render, so doing it on every
    // mouseenter is the main source of lag. We commit it once on mouseup instead.
    const applyRanges = useCallback((next: CellRange[], syncSelection = true) => {
        rangesRef.current = next;
        setRanges(next);
        if (syncSelection) {
            table.setRowSelection(buildRowSelection(next));
        }
    }, [table, buildRowSelection]);

    // If something else clears the selection (e.g. after a bulk action), drop the cell highlight too.
    const rowSelectionState = table.getState().rowSelection;
    useEffect(() => {
        if (Object.keys(rowSelectionState).length === 0 && rangesRef.current.length > 0) {
            rangesRef.current = [];
            setRanges([]);
        }
    }, [rowSelectionState]);

    // A drag can end anywhere on the page, so listen for mouseup on the window.
    useEffect(() => {
        const handleMouseUp = () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            // Commit the row-selection mirror once, now that the drag is finished,
            // instead of on every mouseenter during the drag.
            table.setRowSelection(buildRowSelection(rangesRef.current));
        };
        window.addEventListener("mouseup", handleMouseUp);
        return () => window.removeEventListener("mouseup", handleMouseUp);
    }, [table, buildRowSelection]);

    // Escape clears the current selection (cells and the mirrored row selection).
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && rangesRef.current.length > 0) {
                isDraggingRef.current = false;
                applyRanges([]);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [applyRanges]);

    // Read the visible text of a cell from the DOM, collapsing any whitespace so it
    // stays on a single TSV field (tabs/newlines would otherwise break the grid).
    const getCellText = useCallback((r: number, c: number) => {
        const el = tableRef.current?.querySelector<HTMLElement>(
            `td[data-row="${r}"][data-col="${c}"]`
        );
        return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
    }, []);

    // Build a TSV grid (tab-separated columns, newline-separated rows) over the
    // bounding box of the current selection. Pasting TSV into Sheets/Excel preserves structure.
    const buildClipboardTsv = useCallback(() => {
        const currentRanges = rangesRef.current;
        if (currentRanges.length === 0) return "";

        let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
        const selected = new Set<string>();
        for (const range of currentRanges) {
            const r0 = Math.min(range.anchor.r, range.focus.r);
            const r1 = Math.max(range.anchor.r, range.focus.r);
            const c0 = Math.min(range.anchor.c, range.focus.c);
            const c1 = Math.max(range.anchor.c, range.focus.c);
            minR = Math.min(minR, r0); maxR = Math.max(maxR, r1);
            minC = Math.min(minC, c0); maxC = Math.max(maxC, c1);
            for (let r = r0; r <= r1; r++) {
                for (let c = c0; c <= c1; c++) selected.add(cellKey(r, c));
            }
        }

        const lines: string[] = [];
        for (let r = minR; r <= maxR; r++) {
            const cols: string[] = [];
            for (let c = minC; c <= maxC; c++) {
                cols.push(selected.has(cellKey(r, c)) ? getCellText(r, c) : "");
            }
            lines.push(cols.join("\t"));
        }
        return lines.join("\n");
    }, [getCellText]);

    // Intercept Cmd/Ctrl+C (and right-click copy) so the selected cells go to the
    // clipboard as TSV, while leaving copies from inputs/text selections untouched.
    useEffect(() => {
        const handleCopy = (e: ClipboardEvent) => {
            if (rangesRef.current.length === 0) return;

            const active = document.activeElement as HTMLElement | null;
            if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)) {
                return;
            }
            if ((window.getSelection()?.toString().length ?? 0) > 0) return;

            const tsv = buildClipboardTsv();
            if (!tsv) return;

            e.clipboardData?.setData("text/plain", tsv);
            e.preventDefault();

            // const numRows = tsv.split("\n").length;
            // emitToast(`Copied ${numRows} row${numRows === 1 ? "" : "s"} to clipboard`, ToastType.Success);
        };
        document.addEventListener("copy", handleCopy);
        return () => document.removeEventListener("copy", handleCopy);
    }, [buildClipboardTsv]);

    // Replace the focus of the active (last) range, leaving its anchor fixed.
    const extendActiveRange = useCallback((focus: CellCoord, syncSelection = true) => {
        const current = rangesRef.current;
        if (current.length === 0) return;
        const next = current.slice();
        next[next.length - 1] = { anchor: next[next.length - 1].anchor, focus };
        applyRanges(next, syncSelection);
    }, [applyRanges]);

    const handleCellMouseDown = useCallback((e: React.MouseEvent, r: number, c: number) => {
        const row = rows[r];
        if (!row) return;

        // Double-click opens the camper view.
        if (e.detail >= 2) {
            navigate(`/camper-view/${row.original.userSub}`);
            return;
        }

        const isMeta = e.metaKey || e.ctrlKey;
        const cell: CellCoord = { r, c };

        if (e.shiftKey && rangesRef.current.length > 0) {
            // Shift-click: extend the active range from its anchor to this cell.
            e.preventDefault();
            extendActiveRange(cell);
        } else if (isMeta) {
            // Cmd/Ctrl-click: start a new, disjoint range at this cell while keeping the others.
            isDraggingRef.current = true;
            applyRanges([...rangesRef.current, { anchor: cell, focus: cell }]);
        } else {
            // Plain click: start a fresh single-cell selection and arm a drag.
            isDraggingRef.current = true;
            applyRanges([{ anchor: cell, focus: cell }]);
        }
    }, [rows, navigate, extendActiveRange, applyRanges]);

    const handleCellMouseEnter = useCallback((r: number, c: number) => {
        if (!isDraggingRef.current) return;
        // While dragging, grow the active range to wherever the cursor is. Skip the
        // row-selection sync on every move (it re-renders the whole table); the
        // mouseup handler commits it once when the drag ends.
        extendActiveRange({ r, c }, false);
    }, [extendActiveRange]);

    // Derive the set of highlighted cells and the anchor cell (bold box) from the ranges.
    const { selectedCells, anchorCellKey } = useMemo(() => {
        const selected = new Set<string>();
        for (const range of ranges) {
            const r0 = Math.min(range.anchor.r, range.focus.r);
            const r1 = Math.max(range.anchor.r, range.focus.r);
            const c0 = Math.min(range.anchor.c, range.focus.c);
            const c1 = Math.max(range.anchor.c, range.focus.c);
            for (let r = r0; r <= r1; r++) {
                for (let c = c0; c <= c1; c++) {
                    selected.add(cellKey(r, c));
                }
            }
        }
        const active = ranges[ranges.length - 1];
        return {
            selectedCells: selected,
            anchorCellKey: active ? cellKey(active.anchor.r, active.anchor.c) : null,
        };
    }, [ranges]);

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
            <table id="admin-table" ref={tableRef} style={{ userSelect: "none" }}>
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
                {isPending ? <LoadingTableBody /> : (
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell, colIndex) => {
                                    const key = cellKey(rowIndex, colIndex);
                                    const meta = cell.column.columnDef.meta as { className?: string } | undefined;
                                    const classNames = [
                                        selectedCells.has(key) ? "cell-selected" : "",
                                        key === anchorCellKey ? "cell-anchor" : "",
                                        meta?.className ?? "",
                                    ].filter(Boolean).join(" ");
                                    return (
                                        <td
                                            key={cell.id}
                                            className={classNames}
                                            data-row={rowIndex}
                                            data-col={colIndex}
                                            onMouseDown={(e) => handleCellMouseDown(e, rowIndex, colIndex)}
                                            onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                )}
            </table>
        </>
    );
}
