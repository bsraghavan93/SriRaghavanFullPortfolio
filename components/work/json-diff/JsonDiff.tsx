"use client";

import React, { useDeferredValue, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  AlignLeft,
  ArrowLeftRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clipboard,
  GitCompare,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import ToolHeader from "@/components/work/ToolHeader";
import { CopyButton, JsonLine, ToolButton } from "@/components/work/json-viewer/ui";
import { useVirtual } from "@/components/work/json-viewer/useVirtual";
import { parseJson, previewValue, sortKeysDeep, type ParseResult } from "@/lib/json-tools";
import {
  changesToText,
  diffJson,
  lineDiff,
  toJsonPatch,
  type Change,
  type ChangeKind,
  type DiffRow,
} from "@/lib/json-diff";

const SAMPLE_A = {
  name: "Sri Raghavan",
  role: "Full Stack Engineer",
  yearsExperience: 10,
  skills: [".NET", "C#", "Azure"],
  address: { city: "Toronto", country: "Canada" },
  active: true,
  projects: [{ id: 1, client: "Loyalty Platform" }],
};

const SAMPLE_B = {
  name: "Sri Raghavan",
  role: "Lead Full Stack .NET Engineer",
  yearsExperience: 11,
  skills: [".NET", "C#", "Azure", "AWS"],
  address: { city: "Toronto", country: "Canada", postal: "M5V" },
  active: "yes",
  projects: [
    { id: 1, client: "Loyalty Platform" },
    { id: 2, client: "Government Modernization" },
  ],
};

const KIND_META: Record<ChangeKind, { label: string; sym: string; chip: string; row: string }> = {
  added: { label: "Added", sym: "+", chip: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300", row: "text-emerald-300" },
  removed: { label: "Removed", sym: "−", chip: "border-rose-400/30 bg-rose-400/10 text-rose-300", row: "text-rose-300" },
  changed: { label: "Changed", sym: "~", chip: "border-amber-400/30 bg-amber-400/10 text-amber-300", row: "text-amber-300" },
  type: { label: "Type changed", sym: "!", chip: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300", row: "text-fuchsia-300" },
};

type Tab = "changes" | "text";

// ─── Editor card ──────────────────────────────────────────────────────────────
function Editor({
  title,
  value,
  onChange,
  parsed,
  onSample,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  parsed: ParseResult | null;
  onSample: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#070b16]">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 px-3 py-2">
        <h2 className="mr-auto text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h2>
        <ToolButton
          onClick={async () => {
            try {
              onChange(await navigator.clipboard.readText());
            } catch {
              /* blocked: user can paste manually */
            }
          }}
          title="Paste from clipboard"
        >
          <Clipboard className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton onClick={() => fileRef.current?.click()} title="Open file">
          <Upload className="h-3.5 w-3.5" />
        </ToolButton>
        <input
          ref={fileRef}
          type="file"
          accept=".json,.txt,application/json"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) onChange(await f.text());
            e.target.value = "";
          }}
        />
        <ToolButton
          onClick={() => parsed?.ok && onChange(JSON.stringify(parsed.value, null, 2))}
          disabled={!parsed?.ok}
          title="Format"
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton onClick={onSample} title="Load sample">
          <Sparkles className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton onClick={() => onChange("")} disabled={!value} title="Clear">
          <Trash2 className="h-3.5 w-3.5" />
        </ToolButton>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        wrap="off"
        placeholder="Paste JSON…"
        className="min-h-[7rem] flex-1 resize-none bg-transparent p-3 font-mono text-[12.5px] leading-[18px] text-slate-300 outline-none placeholder:text-slate-600"
      />
      <div className="border-t border-white/10 px-3 py-1.5 text-[11px]">
        {!value.trim() ? (
          <span className="text-slate-600">Empty</span>
        ) : parsed?.ok ? (
          <span className="text-emerald-400">✓ Valid JSON</span>
        ) : parsed ? (
          <span className="text-rose-400">
            ✕ Line {parsed.line}, col {parsed.col} — {parsed.message.slice(0, 70)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

// ─── Changes list ─────────────────────────────────────────────────────────────
function ChangesList({ changes }: { changes: Change[] }) {
  const ROW_H = 58;
  const { ref, onScroll, start, end, total } = useVirtual(changes.length, ROW_H);
  return (
    <div ref={ref} onScroll={onScroll} className="h-full overflow-auto">
      <div style={{ height: total, position: "relative" }}>
        {changes.slice(start, end).map((c, k) => {
          const m = KIND_META[c.kind];
          return (
            <div
              key={`${c.kind}:${c.id}:${start + k}`}
              className="absolute left-0 right-0 flex items-center gap-3 border-b border-white/[0.05] px-4 hover:bg-white/[0.03]"
              style={{ top: (start + k) * ROW_H, height: ROW_H }}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${m.chip}`} title={m.label}>
                {m.sym}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-mono text-[12.5px] text-slate-200" title={c.id}>
                  {c.id}
                </div>
                <div className="mt-0.5 flex items-center gap-2 truncate font-mono text-[12px]">
                  {c.kind !== "added" && (
                    <span className="max-w-[45%] truncate rounded bg-rose-500/10 px-1.5 text-rose-300" title={JSON.stringify(c.before)}>
                      {previewValue(c.before, 60)}
                    </span>
                  )}
                  {(c.kind === "changed" || c.kind === "type") && <span className="text-slate-600">→</span>}
                  {c.kind !== "removed" && (
                    <span className="max-w-[45%] truncate rounded bg-emerald-500/10 px-1.5 text-emerald-300" title={JSON.stringify(c.after)}>
                      {previewValue(c.after, 60)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Side-by-side text diff ───────────────────────────────────────────────────
function SideBySide({ rows }: { rows: DiffRow[] }) {
  const ROW_H = 20;
  const { ref, onScroll, start, end, total } = useVirtual(rows.length, ROW_H);
  const cell = (side: DiffRow["left"], tint: string) => (
    <div className={`flex min-w-0 flex-1 overflow-hidden ${tint}`}>
      <span className="w-12 shrink-0 select-none pr-3 text-right text-slate-600">{side?.n ?? ""}</span>
      <span className="min-w-0 truncate whitespace-pre">{side ? <JsonLine line={side.text} /> : null}</span>
    </div>
  );
  return (
    <div ref={ref} onScroll={onScroll} className="h-full overflow-auto font-mono text-[12.5px] text-slate-300">
      <div style={{ height: total, position: "relative" }}>
        {rows.slice(start, end).map((r, k) => {
          const i = start + k;
          const leftTint = r.kind === "del" || r.kind === "mod" ? "bg-rose-500/15" : r.kind === "add" ? "bg-white/[0.02]" : "";
          const rightTint = r.kind === "add" || r.kind === "mod" ? "bg-emerald-500/15" : r.kind === "del" ? "bg-white/[0.02]" : "";
          return (
            <div
              key={i}
              className="absolute left-0 right-0 flex divide-x divide-white/10"
              style={{ top: i * ROW_H, height: ROW_H, lineHeight: `${ROW_H}px` }}
            >
              {cell(r.left, leftTint)}
              {cell(r.right, rightTint)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function JsonDiff() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [tab, setTab] = useState<Tab>("changes");
  const [filters, setFilters] = useState<Set<ChangeKind>>(new Set(["added", "removed", "changed", "type"]));
  const [ignoreOrder, setIgnoreOrder] = useState(false);
  const [sortKeys, setSortKeys] = useState(true);
  const [changesOnly, setChangesOnly] = useState(false);
  const [inputsOpen, setInputsOpen] = useState(true);

  const dA = useDeferredValue(textA);
  const dB = useDeferredValue(textB);
  const pA = useMemo<ParseResult | null>(() => (dA.trim() ? parseJson(dA) : null), [dA]);
  const pB = useMemo<ParseResult | null>(() => (dB.trim() ? parseJson(dB) : null), [dB]);
  const ready = !!pA?.ok && !!pB?.ok;

  const diff = useMemo(
    () => (pA?.ok && pB?.ok ? diffJson(pA.value, pB.value, { ignoreArrayOrder: ignoreOrder }) : null),
    [pA, pB, ignoreOrder],
  );

  const shown = useMemo(() => (diff ? diff.changes.filter((c) => filters.has(c.kind)) : []), [diff, filters]);

  const textRows = useMemo(() => {
    if (tab !== "text" || !pA?.ok || !pB?.ok) return null;
    const fmt = (v: unknown) => JSON.stringify(sortKeys ? sortKeysDeep(v) : v, null, 2) ?? "";
    const rows = lineDiff(fmt(pA.value), fmt(pB.value));
    if (!rows || !changesOnly) return rows;
    const keep = new Array(rows.length).fill(false);
    rows.forEach((r, i) => {
      if (r.kind !== "same") for (let j = Math.max(0, i - 2); j <= Math.min(rows.length - 1, i + 2); j++) keep[j] = true;
    });
    return rows.filter((_, i) => keep[i]);
  }, [tab, pA, pB, sortKeys, changesOnly]);

  const toggleFilter = (k: ChangeKind) =>
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const swap = () => {
    setTextA(textB);
    setTextB(textA);
  };

  const total = diff ? diff.changes.length : 0;

  return (
    <div className="flex h-[100dvh] flex-col bg-[#030711] text-slate-200">
      <ToolHeader title="JSON Diff" icon={GitCompare}>
        <ToolButton onClick={swap} disabled={!textA && !textB} title="Swap A and B">
          <ArrowLeftRight className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Swap</span>
        </ToolButton>
        <ToolButton
          onClick={() => {
            setTextA(JSON.stringify(SAMPLE_A, null, 2));
            setTextB(JSON.stringify(SAMPLE_B, null, 2));
          }}
        >
          <Sparkles className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sample</span>
        </ToolButton>
        <ToolButton onClick={() => setInputsOpen((v) => !v)} title="Show or hide the inputs">
          {inputsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">Inputs</span>
        </ToolButton>
      </ToolHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        {inputsOpen && (
          <div className="grid h-[38%] min-h-[15rem] shrink-0 gap-3 md:grid-cols-2 [&>*]:min-h-0">
            <Editor
              title="Original (A)"
              value={textA}
              onChange={setTextA}
              parsed={pA}
              onSample={() => setTextA(JSON.stringify(SAMPLE_A, null, 2))}
            />
            <Editor
              title="Modified (B)"
              value={textB}
              onChange={setTextB}
              parsed={pB}
              onSample={() => setTextB(JSON.stringify(SAMPLE_B, null, 2))}
            />
          </div>
        )}

        {/* Results */}
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#070b16]">
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
            <div className="flex gap-0.5 rounded-lg border border-white/10 bg-white/[0.03] p-0.5 text-xs">
              {(
                [
                  ["changes", "Changes"],
                  ["text", "Side by side"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    tab === id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {diff && tab === "changes" && (
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(KIND_META) as ChangeKind[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => toggleFilter(k)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-opacity ${KIND_META[k].chip} ${
                      filters.has(k) ? "" : "opacity-35"
                    }`}
                    title={`Toggle ${KIND_META[k].label.toLowerCase()}`}
                  >
                    {KIND_META[k].sym} {diff.counts[k]} {KIND_META[k].label}
                  </button>
                ))}
              </div>
            )}

            <div className="ml-auto flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <label className="flex cursor-pointer items-center gap-1.5" title="Compare arrays as unordered collections">
                <input type="checkbox" checked={ignoreOrder} onChange={(e) => setIgnoreOrder(e.target.checked)} className="accent-cyan-400" />
                Ignore array order
              </label>
              {tab === "text" && (
                <>
                  <label className="flex cursor-pointer items-center gap-1.5">
                    <input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} className="accent-cyan-400" />
                    Sort keys
                  </label>
                  <label className="flex cursor-pointer items-center gap-1.5">
                    <input type="checkbox" checked={changesOnly} onChange={(e) => setChangesOnly(e.target.checked)} className="accent-cyan-400" />
                    Changes only
                  </label>
                </>
              )}
              {diff && total > 0 && (
                <>
                  <CopyButton tag="report" label="Copy report" text={() => changesToText(shown)} />
                  <CopyButton
                    tag="patch"
                    label="JSON Patch"
                    text={() => JSON.stringify(toJsonPatch(diff.changes), null, 2)}
                  />
                </>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1">
            {!ready && (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-slate-500">
                {(pA && !pA.ok) || (pB && !pB.ok) ? (
                  <>
                    <AlertTriangle className="h-8 w-8 text-rose-400" />
                    <p className="text-sm">
                      Fix the invalid JSON in {pA && !pA.ok ? "A" : ""}
                      {pA && !pA.ok && pB && !pB.ok ? " and " : ""}
                      {pB && !pB.ok ? "B" : ""} to compare.
                    </p>
                  </>
                ) : (
                  <>
                    <GitCompare className="h-8 w-8 text-slate-600" />
                    <p className="text-sm">Paste JSON into both boxes — or load the sample — to see the differences.</p>
                  </>
                )}
              </div>
            )}

            {ready && diff && total === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                <p className="text-base font-semibold text-white">The documents are identical</p>
                <p className="text-xs text-slate-500">
                  {ignoreOrder ? "Arrays were compared ignoring order. " : ""}Key order and whitespace are ignored.
                </p>
              </div>
            )}

            {ready && diff && total > 0 && tab === "changes" && (
              <>
                {diff.truncated && (
                  <div className="border-b border-amber-400/20 bg-amber-400/10 px-4 py-1.5 text-xs text-amber-200">
                    Showing the first 10,000 differences.
                  </div>
                )}
                {shown.length ? (
                  <ChangesList changes={shown} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">All change types are filtered out.</div>
                )}
              </>
            )}

            {ready && diff && total > 0 && tab === "text" &&
              (textRows ? (
                <SideBySide rows={textRows} />
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center text-sm text-slate-500">
                  These documents are too large for a line-by-line view — use the Changes tab instead.
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
