
import { Table as TanstackTable } from "@tanstack/table-core";
import { Placeholder } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { flexRender } from "@tanstack/react-table";
import { CamperProfileRowData } from "../../api/apiCamperTable";
import { useNavigate } from "react-router";
import { memo, useCallback, useEffect, useRef } from "react";


interface CamperTableProps {
    table: TanstackTable<CamperProfileRowData>;
    isPending: boolean;
}

type CellCoord = { r: number; c: number };
type CellRange = { anchor: CellCoord; focus: CellCoord };

const cellKey = (r: number, c: number) => `${r}:${c}`;

const forEachCellInRange = (
    anchor: CellCoord,
    focus: CellCoord,
    fn: (r: number, c: number) => void,
) => {
    const r0 = Math.min(anchor.r, focus.r);
    const r1 = Math.max(anchor.r, focus.r);
    const c0 = Math.min(anchor.c, focus.c);
    const c1 = Math.max(anchor.c, focus.c);
    for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
            fn(r, c);
        }
    }
};

function LoadingTableBody({ table }: { table: TanstackTable<CamperProfileRowData> }) {
    return (
        <tbody>
            {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                        <td key={header.id} colSpan={header.colSpan}>
                            <Placeholder animation="glow">
                                <Placeholder xs={12} />
                            </Placeholder>
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
}

export function CamperTable({ table, isPending }: CamperTableProps) {

    const navigate = useNavigate();
    const navigateRef = useRef(navigate);
    navigateRef.current = navigate;

    const tableApiRef = useRef(table);
    tableApiRef.current = table;

    const rows = table.getRowModel().rows;
    const rowsRef = useRef(rows);
    rowsRef.current = rows;

    const tableRef = useRef<HTMLTableElement>(null);
    const tbodyRef = useRef<HTMLTableSectionElement>(null);

    // Selection lives in refs + DOM classes only — never React state, so mousedown/mouseup
    // return immediately without re-rendering thousands of cells.
    const rangesRef = useRef<CellRange[]>([]);
    const isDraggingRef = useRef(false);
    const paintedCellsRef = useRef<Set<HTMLTableCellElement>>(new Set());
    const cellElementsRef = useRef<Map<string, HTMLTableCellElement>>(new Map());
    const pendingRowSelectionRef = useRef<number | null>(null);

    const getCellElement = useCallback((r: number, c: number) => {
        const key = cellKey(r, c);
        const cached = cellElementsRef.current.get(key);
        if (cached?.isConnected) return cached;

        const el = tableRef.current?.querySelector<HTMLTableCellElement>(
            `td[data-row="${r}"][data-col="${c}"]`
        );
        if (el) cellElementsRef.current.set(key, el);
        return el ?? null;
    }, []);

    const markPainted = useCallback((td: HTMLTableCellElement | null | undefined) => {
        if (td) paintedCellsRef.current.add(td);
    }, []);

    const clearPaintedCells = useCallback(() => {
        for (const td of paintedCellsRef.current) {
            td.classList.remove("cell-selected", "cell-anchor");
        }
        paintedCellsRef.current.clear();
    }, []);

    const paintSelection = useCallback((next: CellRange[]) => {
        clearPaintedCells();
        for (const range of next) {
            forEachCellInRange(range.anchor, range.focus, (r, c) => {
                const td = getCellElement(r, c);
                td?.classList.add("cell-selected");
                markPainted(td);
            });
        }
        const active = next[next.length - 1];
        if (active) {
            const anchorTd = getCellElement(active.anchor.r, active.anchor.c);
            anchorTd?.classList.add("cell-anchor");
            markPainted(anchorTd);
        }
    }, [clearPaintedCells, getCellElement, markPainted]);

    const cellsInRangesExceptActive = useCallback((next: CellRange[]) => {
        const selected = new Set<string>();
        for (let i = 0; i < next.length - 1; i++) {
            const range = next[i];
            forEachCellInRange(range.anchor, range.focus, (r, c) => {
                selected.add(cellKey(r, c));
            });
        }
        return selected;
    }, []);

    const patchActiveRange = useCallback((
        prevFocus: CellCoord,
        nextFocus: CellCoord,
        nextRanges: CellRange[],
    ) => {
        const anchor = nextRanges[nextRanges.length - 1].anchor;
        const otherSelected = cellsInRangesExceptActive(nextRanges);

        forEachCellInRange(anchor, prevFocus, (r, c) => {
            const inNewRange =
                r >= Math.min(anchor.r, nextFocus.r) && r <= Math.max(anchor.r, nextFocus.r) &&
                c >= Math.min(anchor.c, nextFocus.c) && c <= Math.max(anchor.c, nextFocus.c);
            if (inNewRange || otherSelected.has(cellKey(r, c))) return;
            getCellElement(r, c)?.classList.remove("cell-selected");
        });

        forEachCellInRange(anchor, nextFocus, (r, c) => {
            const inOldRange =
                r >= Math.min(anchor.r, prevFocus.r) && r <= Math.max(anchor.r, prevFocus.r) &&
                c >= Math.min(anchor.c, prevFocus.c) && c <= Math.max(anchor.c, prevFocus.c);
            if (inOldRange) return;
            const td = getCellElement(r, c);
            td?.classList.add("cell-selected");
            markPainted(td);
        });
    }, [cellsInRangesExceptActive, getCellElement, markPainted]);

    const buildRowSelection = useCallback((next: CellRange[]) => {
        const rowSelection: Record<string, boolean> = {};
        const currentRows = rowsRef.current;
        for (const range of next) {
            const r0 = Math.min(range.anchor.r, range.focus.r);
            const r1 = Math.max(range.anchor.r, range.focus.r);
            for (let r = r0; r <= r1; r++) {
                const row = currentRows[r];
                if (row) rowSelection[row.id] = true;
            }
        }
        return rowSelection;
    }, []);

    // Defer TanStack row selection so mouseup/mousedown handlers return instantly.
    // Coalesce multiple requests into one rAF callback.
    const scheduleRowSelectionSync = useCallback(() => {
        if (pendingRowSelectionRef.current != null) return;
        pendingRowSelectionRef.current = requestAnimationFrame(() => {
            pendingRowSelectionRef.current = null;
            tableApiRef.current.setRowSelection(buildRowSelection(rangesRef.current));
        });
    }, [buildRowSelection]);

    const clearSelection = useCallback(() => {
        isDraggingRef.current = false;
        rangesRef.current = [];
        clearPaintedCells();
        scheduleRowSelectionSync();
    }, [clearPaintedCells, scheduleRowSelectionSync]);

    const extendActiveRangeDOM = useCallback((focus: CellCoord) => {
        const current = rangesRef.current;
        if (current.length === 0) return;

        const active = current[current.length - 1];
        if (active.focus.r === focus.r && active.focus.c === focus.c) return;

        const prevFocus = active.focus;
        const next = current.slice();
        next[next.length - 1] = { anchor: active.anchor, focus };
        rangesRef.current = next;
        patchActiveRange(prevFocus, focus, next);
    }, [patchActiveRange]);

    const startSingleCellSelection = useCallback((td: HTMLTableCellElement, r: number, c: number) => {
        clearPaintedCells();
        td.classList.add("cell-selected", "cell-anchor");
        paintedCellsRef.current.add(td);
        rangesRef.current = [{ anchor: { r, c }, focus: { r, c } }];
        isDraggingRef.current = true;
    }, [clearPaintedCells]);

    const addDisjointCell = useCallback((td: HTMLTableCellElement, r: number, c: number) => {
        const prev = rangesRef.current;
        if (prev.length > 0) {
            const prevActive = prev[prev.length - 1];
            getCellElement(prevActive.anchor.r, prevActive.anchor.c)?.classList.remove("cell-anchor");
        }
        td.classList.add("cell-selected", "cell-anchor");
        paintedCellsRef.current.add(td);
        rangesRef.current = [...rangesRef.current, { anchor: { r, c }, focus: { r, c } }];
        isDraggingRef.current = true;
    }, [getCellElement]);

    const extendActiveRangeImmediate = useCallback((focus: CellCoord) => {
        const current = rangesRef.current;
        if (current.length === 0) return;
        const active = current[current.length - 1];
        const prevFocus = active.focus;
        const next = current.slice();
        next[next.length - 1] = { anchor: active.anchor, focus };
        rangesRef.current = next;
        patchActiveRange(prevFocus, focus, next);
        scheduleRowSelectionSync();
    }, [patchActiveRange, scheduleRowSelectionSync]);

    // If something else clears the selection (e.g. after a bulk action), drop the cell highlight too.
    const rowSelectionState = table.getState().rowSelection;
    useEffect(() => {
        if (Object.keys(rowSelectionState).length === 0 && rangesRef.current.length > 0) {
            rangesRef.current = [];
            clearPaintedCells();
        }
    }, [rowSelectionState, clearPaintedCells]);

    // Native listeners bypass React's synthetic event system and keep handlers minimal.
    useEffect(() => {
        const tbody = tbodyRef.current;
        if (!tbody || isPending) return;

        const getTd = (target: EventTarget | null) =>
            (target as HTMLElement | null)?.closest("td[data-row][data-col]") as HTMLTableCellElement | null;

        const onMouseDown = (e: MouseEvent) => {
            const td = getTd(e.target);
            if (!td || !tableRef.current?.contains(td)) return;

            const r = Number(td.dataset.row);
            const c = Number(td.dataset.col);

            if (e.detail >= 2) {
                const userSub = td.dataset.userSub;
                if (userSub) navigateRef.current(`/camper-view/${userSub}`);
                return;
            }

            const cell: CellCoord = { r, c };

            if (e.shiftKey && rangesRef.current.length > 0) {
                e.preventDefault();
                extendActiveRangeImmediate(cell);
                return;
            }

            if (e.metaKey || e.ctrlKey) {
                addDisjointCell(td, r, c);
                return;
            }

            startSingleCellSelection(td, r, c);
        };

        const onMouseUp = () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            scheduleRowSelectionSync();
        };

        let rafId: number | null = null;
        let pendingFocus: CellCoord | null = null;

        const flushMouseMove = () => {
            rafId = null;
            if (!pendingFocus || !isDraggingRef.current) return;
            const focus = pendingFocus;
            pendingFocus = null;
            extendActiveRangeDOM(focus);
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return;
            const td = getTd(document.elementFromPoint(e.clientX, e.clientY));
            if (!td || !tableRef.current?.contains(td)) return;

            pendingFocus = {
                r: Number(td.dataset.row),
                c: Number(td.dataset.col),
            };
            if (rafId == null) {
                rafId = requestAnimationFrame(flushMouseMove);
            }
        };

        tbody.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("mousemove", onMouseMove);

        return () => {
            tbody.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("mousemove", onMouseMove);
            if (rafId != null) cancelAnimationFrame(rafId);
            if (pendingRowSelectionRef.current != null) {
                cancelAnimationFrame(pendingRowSelectionRef.current);
                pendingRowSelectionRef.current = null;
            }
        };
    }, [
        isPending,
        addDisjointCell,
        extendActiveRangeDOM,
        extendActiveRangeImmediate,
        scheduleRowSelectionSync,
        startSingleCellSelection,
    ]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && rangesRef.current.length > 0) {
                clearSelection();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [clearSelection]);

    const getCellText = useCallback((r: number, c: number) => {
        const el = getCellElement(r, c);
        return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
    }, [getCellElement]);

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
        };
        document.addEventListener("copy", handleCopy);
        return () => document.removeEventListener("copy", handleCopy);
    }, [buildClipboardTsv]);

    useEffect(() => {
        cellElementsRef.current.clear();
        if (rangesRef.current.length > 0) {
            paintSelection(rangesRef.current);
        }
    }, [rows, isPending, paintSelection]);

    return (
        <>
            <table id="admin-table" ref={tableRef} style={{ userSelect: "none" }}>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
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
                    ))}
                </thead>
                {isPending ? <LoadingTableBody table={table} /> : (
                    <tbody ref={tbodyRef}>
                        {rows.map((row, rowIndex) => (
                            <CamperTableRow key={row.id} row={row} rowIndex={rowIndex} />
                        ))}
                    </tbody>
                )}
            </table>
        </>
    );
}

interface CamperTableRowProps {
    row: ReturnType<TanstackTable<CamperProfileRowData>["getRowModel"]>["rows"][number];
    rowIndex: number;
}

const CamperTableRow = memo(function CamperTableRow({ row, rowIndex }: CamperTableRowProps) {
    return (
        <tr>
            {row.getVisibleCells().map((cell, colIndex) => {
                const meta = cell.column.columnDef.meta as { className?: string } | undefined;
                return (
                    <td
                        key={cell.id}
                        className={meta?.className ?? ""}
                        data-row={rowIndex}
                        data-col={colIndex}
                        data-user-sub={row.original.userSub}
                    >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                );
            })}
        </tr>
    );
});
