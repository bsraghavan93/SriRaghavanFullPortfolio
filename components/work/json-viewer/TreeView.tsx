"use client";

import React, { useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { previewValue, type Row } from "@/lib/json-tools";
import { Highlight, TYPE_STYLES } from "./ui";
import { useVirtual } from "./useVirtual";

const ROW_H = 26;
const INDENT = 16;

type Props = {
  rows: Row[];
  selectedId: string | null;
  matchIds: Set<string>;
  currentMatchId: string | null;
  highlightRe: RegExp | null;
  onSelect: (row: Row) => void;
  onToggle: (id: string) => void;
};

export default function TreeView({
  rows,
  selectedId,
  matchIds,
  currentMatchId,
  highlightRe,
  onSelect,
  onToggle,
}: Props) {
  const { ref, onScroll, start, end, total, scrollToIndex } = useVirtual(rows.length, ROW_H);

  // Bring the selected row into view (keyboard navigation, search results, path jumps).
  useEffect(() => {
    if (!selectedId) return;
    const i = rows.findIndex((r) => r.id === selectedId);
    if (i >= 0) scrollToIndex(i, selectedId === currentMatchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, currentMatchId]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!rows.length) return;
    const i = Math.max(0, rows.findIndex((r) => r.id === selectedId));
    const row = rows[i];
    const go = (n: number) => {
      const t = rows[Math.min(rows.length - 1, Math.max(0, n))];
      if (t) onSelect(t);
    };
    switch (e.key) {
      case "ArrowDown":
        go(i + 1);
        break;
      case "ArrowUp":
        go(i - 1);
        break;
      case "Home":
        go(0);
        break;
      case "End":
        go(rows.length - 1);
        break;
      case "PageDown":
        go(i + 15);
        break;
      case "PageUp":
        go(i - 15);
        break;
      case "ArrowRight":
        if (row.count > 0 && !row.expanded) onToggle(row.id);
        else go(i + 1);
        break;
      case "ArrowLeft":
        if (row.expanded) onToggle(row.id);
        else {
          for (let j = i - 1; j >= 0; j--) {
            if (rows[j].depth < row.depth) {
              go(j);
              break;
            }
          }
        }
        break;
      case "Enter":
      case " ":
        if (row.count > 0) onToggle(row.id);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const visible = rows.slice(start, end);

  return (
    <div
      ref={ref}
      onScroll={onScroll}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="tree"
      aria-label="JSON tree"
      className="relative h-full overflow-auto outline-none font-mono text-[12.5px] focus-visible:ring-1 focus-visible:ring-cyan-400/30"
    >
      <div style={{ height: total, position: "relative" }}>
        {visible.map((row, k) => {
          const i = start + k;
          const selected = row.id === selectedId;
          const isMatch = matchIds.has(row.id);
          const isCurrent = row.id === currentMatchId;
          const style = TYPE_STYLES[row.type];
          return (
            <div
              key={row.id}
              role="treeitem"
              aria-expanded={row.count > 0 ? row.expanded : undefined}
              aria-selected={selected}
              onClick={() => onSelect(row)}
              onDoubleClick={() => row.count > 0 && onToggle(row.id)}
              style={{ position: "absolute", top: i * ROW_H, height: ROW_H, left: 0, right: 0 }}
              className={`group flex items-center cursor-pointer whitespace-nowrap pr-3 ${
                selected
                  ? "bg-cyan-400/15 shadow-[inset_2px_0_0_0_rgb(34,211,238)]"
                  : isMatch
                    ? "bg-amber-300/[0.07] hover:bg-amber-300/10"
                    : "hover:bg-white/[0.04]"
              } ${isCurrent ? "ring-1 ring-inset ring-amber-300/60" : ""}`}
            >
              {/* indent guides */}
              <span className="flex h-full shrink-0" style={{ width: row.depth * INDENT + 8 }}>
                {Array.from({ length: row.depth }).map((_, d) => (
                  <span key={d} className="h-full border-l border-white/[0.06]" style={{ width: INDENT, marginLeft: d === 0 ? 8 : 0 }} />
                ))}
              </span>

              {row.count > 0 ? (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={row.expanded ? "Collapse" : "Expand"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(row.id);
                  }}
                  className="mr-1 flex h-4 w-4 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <ChevronRight className={`h-3.5 w-3.5 transition-transform ${row.expanded ? "rotate-90" : ""}`} />
                </button>
              ) : (
                <span className="mr-1 w-4 shrink-0" />
              )}

              {row.keyLabel !== null && (
                <>
                  <span className={typeof row.keyLabel === "number" ? "text-slate-500" : "text-sky-300"}>
                    {typeof row.keyLabel === "number" ? (
                      row.keyLabel
                    ) : (
                      <Highlight text={row.keyLabel} re={highlightRe} />
                    )}
                  </span>
                  <span className="mx-1.5 text-slate-600">:</span>
                </>
              )}

              {row.count > 0 || row.type === "object" || row.type === "array" ? (
                <span className={`${style.text} opacity-90`}>
                  {row.type === "array" ? "[" : "{"}
                  {!row.expanded && <span className="text-slate-500"> {previewValue(row.value).slice(2, -2)} </span>}
                  {!row.expanded && (row.type === "array" ? "]" : "}")}
                  {row.expanded && (
                    <span className="ml-2 rounded bg-white/5 px-1.5 text-[10px] text-slate-400">{row.count}</span>
                  )}
                </span>
              ) : (
                <span className={`${style.text} ${row.type === "null" ? "italic" : ""} truncate`}>
                  <Highlight text={previewValue(row.value, 200)} re={highlightRe} />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
