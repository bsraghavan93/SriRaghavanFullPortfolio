"use client";

import React, { useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Download, Search, Table2 } from "lucide-react";
import { cellText, isContainer, tableColumns, toCsv, typeOf } from "@/lib/json-tools";
import { TYPE_STYLES, ToolButton, CopyButton } from "./ui";
import { useVirtual } from "./useVirtual";

const ROW_H = 30;

type Props = {
  rows: Record<string, unknown>[] | null;
  sourceLabel: string;
  selectedIndex: number | null;
  selectedCol: string | null;
  onSelectRow: (index: number) => void;
  onSelectCell: (index: number, col: string) => void;
};

const DEFAULT_W = 180;
const MIN_W = 60;

export default function TableView({ rows, sourceLabel, selectedIndex, selectedCol, onSelectRow, onSelectCell }: Props) {
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<{ col: string; dir: 1 | -1 } | null>(null);
  const [widths, setWidths] = useState<Record<string, number>>({});
  const drag = useRef<{ col: string; startX: number; startW: number } | null>(null);
  const colW = (c: string) => widths[c] ?? DEFAULT_W;

  const cols = useMemo(() => (rows ? tableColumns(rows) : []), [rows]);

  const shown = useMemo(() => {
    if (!rows) return [];
    let list = rows.map((r, i) => ({ r, i }));
    const f = filter.trim().toLowerCase();
    if (f) list = list.filter(({ r }) => cols.some((c) => cellText(r[c]).toLowerCase().includes(f)));
    if (sort) {
      const { col, dir } = sort;
      list = [...list].sort((a, b) => {
        const x = a.r[col];
        const y = b.r[col];
        if (typeof x === "number" && typeof y === "number") return (x - y) * dir;
        return cellText(x).localeCompare(cellText(y), undefined, { numeric: true }) * dir;
      });
    }
    return list;
  }, [rows, cols, filter, sort]);

  const { ref, onScroll, start, end, total } = useVirtual(shown.length, ROW_H);

  if (!rows) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-slate-400">
        <Table2 className="h-8 w-8 text-slate-600" />
        <p className="text-sm">
          Table view works on an <span className="text-slate-200">array of objects</span>.
        </p>
        <p className="max-w-sm text-xs text-slate-500">
          Select an array of objects in the tree (for example <code className="text-cyan-300">$.projects</code>) and
          switch back here.
        </p>
      </div>
    );
  }

  const width = 56 + cols.reduce((sum, c) => sum + colW(c), 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="text-xs text-slate-400">
          <span className="font-mono text-cyan-300">{sourceLabel}</span> · {shown.length}
          {shown.length !== rows.length ? ` / ${rows.length}` : ""} rows · {cols.length} columns
        </span>
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter rows…"
            className="w-44 rounded-lg border border-white/10 bg-white/[0.04] py-1.5 pl-7 pr-2 text-xs text-slate-200 outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
          />
        </div>
        <CopyButton tag="csv" label="Copy CSV" text={() => toCsv(shown.map((s) => s.r), cols)} />
        <ToolButton
          onClick={() => {
            const blob = new Blob([toCsv(shown.map((s) => s.r), cols)], { type: "text/csv" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "data.csv";
            a.click();
            URL.revokeObjectURL(a.href);
          }}
        >
          <Download className="h-3.5 w-3.5" />
          CSV
        </ToolButton>
      </div>

      <div ref={ref} onScroll={onScroll} className="min-h-0 flex-1 overflow-auto text-[12.5px]">
        <div style={{ width, minWidth: "100%" }}>
          <div className="sticky top-0 z-10 flex border-b border-white/10 bg-[#0b1120] text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <div className="w-14 shrink-0 px-3 py-2 text-slate-600">#</div>
            {cols.map((c) => (
              <div key={c} className="relative shrink-0" style={{ width: colW(c) }}>
                <button
                  onClick={() =>
                    setSort((s) => (s?.col === c ? (s.dir === 1 ? { col: c, dir: -1 } : null) : { col: c, dir: 1 }))
                  }
                  className="flex w-full items-center gap-1 truncate px-3 py-2 pr-4 text-left hover:text-white"
                  title={`Sort by ${c}`}
                >
                  <span className="truncate">{c}</span>
                  {sort?.col === c && (sort.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </button>
                {/* drag to resize · double-click to reset */}
                <div
                  role="separator"
                  aria-orientation="vertical"
                  title="Drag to resize · double-click to reset"
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={() => setWidths((w) => ({ ...w, [c]: DEFAULT_W }))}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    drag.current = { col: c, startX: e.clientX, startW: colW(c) };
                  }}
                  onPointerMove={(e) => {
                    const d = drag.current;
                    if (d && d.col === c) setWidths((w) => ({ ...w, [c]: Math.max(MIN_W, d.startW + e.clientX - d.startX) }));
                  }}
                  onPointerUp={() => (drag.current = null)}
                  className="absolute right-0 top-0 z-10 flex h-full w-3 cursor-col-resize touch-none items-center justify-center"
                >
                  <span className="h-4 w-px bg-white/20 transition-colors group-hover:bg-white/40" />
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: total, position: "relative" }}>
            {shown.slice(start, end).map(({ r, i }, k) => (
              <div
                key={i}
                onClick={() => onSelectRow(i)}
                className={`absolute left-0 right-0 flex cursor-pointer items-center border-b border-white/[0.04] font-mono ${
                  selectedIndex === i ? "bg-cyan-400/10" : "hover:bg-white/[0.03]"
                }`}
                style={{ top: (start + k) * ROW_H, height: ROW_H }}
              >
                <div className="w-14 shrink-0 px-3 leading-[30px] text-slate-600 hover:text-cyan-300" title="Select row">{i}</div>
                {cols.map((c) => {
                  const v = r[c];
                  const t = v === undefined ? "null" : typeOf(v);
                  const cellSelected = selectedIndex === i && selectedCol === c;
                  return (
                    <div
                      key={c}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (v !== undefined) onSelectCell(i, c);
                        else onSelectRow(i);
                      }}
                      className={`h-full shrink-0 cursor-pointer truncate px-3 leading-[30px] ${
                        v === undefined ? "text-slate-700" : TYPE_STYLES[t].text
                      } ${isContainer(v) ? "opacity-70" : ""} ${
                        cellSelected ? "bg-cyan-400/25 shadow-[inset_0_0_0_1px_rgb(34,211,238)]" : "hover:bg-white/[0.06]"
                      }`}
                      style={{ width: colW(c) }}
                      title={cellText(v)}
                    >
                      {v === undefined ? "—" : cellText(v)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
