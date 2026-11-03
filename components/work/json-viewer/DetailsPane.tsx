"use client";

import React, { useMemo, useState } from "react";
import { ChevronsDownUp, ChevronsUpDown, ExternalLink, MousePointerClick } from "lucide-react";
import {
  byteSize,
  childrenOf,
  formatBytes,
  isContainer,
  parseJson,
  pathToId,
  pathToJs,
  previewValue,
  segToken,
  typeOf,
  type Seg,
} from "@/lib/json-tools";
import { CopyButton, JsonLine, TYPE_STYLES, ToolButton, TypeBadge } from "./ui";

type Props = {
  segs: Seg[] | null;
  value: unknown;
  onNavigate: (segs: Seg[]) => void;
  onExpandSubtree: (segs: Seg[]) => void;
  onCollapseSubtree: (segs: Seg[]) => void;
};

const MAX_JSON_CHARS = 200_000;

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 truncate text-sm text-slate-200">{children}</div>
    </div>
  );
}

function StringInsights({ value, onNavigateInner }: { value: string; onNavigateInner?: () => void }) {
  const insights: React.ReactNode[] = [];
  const trimmed = value.trim();

  if (/^https?:\/\/\S+$/i.test(trimmed)) {
    insights.push(
      <a
        key="url"
        href={trimmed}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1.5 text-sm text-cyan-300 hover:underline"
      >
        <ExternalLink className="h-3.5 w-3.5" /> Open link
      </a>,
    );
  }
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed)) {
    insights.push(
      <span key="color" className="inline-flex items-center gap-2 text-sm text-slate-300">
        <span className="h-5 w-5 rounded border border-white/20" style={{ background: trimmed }} /> Colour {trimmed}
      </span>,
    );
  }
  if (/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/.test(trimmed)) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      insights.push(
        <div key="date" className="text-sm text-slate-300">
          <span className="text-slate-500">Date · </span>
          {d.toLocaleString()} <span className="text-slate-500">({d.toISOString()})</span>
        </div>,
      );
    }
  }
  if ((trimmed.startsWith("{") || trimmed.startsWith("[")) && onNavigateInner) {
    const r = parseJson(trimmed);
    if (r.ok && isContainer(r.value)) {
      insights.push(
        <div key="inner" className="space-y-2">
          <div className="text-xs text-slate-400">This string contains JSON:</div>
          <pre className="max-h-64 overflow-auto rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-xs leading-5">
            {JSON.stringify(r.value, null, 2)
              .split("\n")
              .map((l, i) => (
                <div key={i}>
                  <JsonLine line={l} />
                </div>
              ))}
          </pre>
        </div>,
      );
    }
  }
  if (!insights.length) return null;
  return <div className="space-y-3">{insights}</div>;
}

function NumberInsights({ value }: { value: number }) {
  const lines: string[] = [];
  const abs = Math.abs(value);
  if (Number.isInteger(value) && abs >= 1e9 && abs < 1e11) {
    lines.push(`As Unix seconds: ${new Date(value * 1000).toISOString()}`);
  } else if (Number.isInteger(value) && abs >= 1e12 && abs < 1e14) {
    lines.push(`As Unix milliseconds: ${new Date(value).toISOString()}`);
  }
  if (!Number.isSafeInteger(value) && Number.isInteger(value)) lines.push("Beyond safe integer range — precision may be lost.");
  if (!lines.length) return null;
  return (
    <div className="space-y-1 text-sm text-slate-300">
      {lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  );
}

export default function DetailsPane({ segs, value, onNavigate, onExpandSubtree, onCollapseSubtree }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [tab, setTab] = useState<"children" | "json">("children");

  const type = typeOf(value);
  const container = isContainer(value);
  const kids = useMemo(() => (container ? childrenOf(value) : []), [container, value]);

  const pretty = useMemo(() => {
    if (!segs) return "";
    try {
      const s = JSON.stringify(value, null, 2) ?? "";
      return s.length > MAX_JSON_CHARS ? s.slice(0, MAX_JSON_CHARS) + "\n… (truncated — use Text view or copy the full value)" : s;
    } catch {
      return "";
    }
  }, [segs, value]);

  const size = useMemo(() => (segs ? byteSize(value) : 0), [segs, value]);

  if (!segs) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-slate-500">
        <MousePointerClick className="h-7 w-7 text-slate-600" />
        <p className="text-sm">Select a node in the tree to inspect it here.</p>
      </div>
    );
  }

  const idStr = pathToId(segs);
  const crumbs: { label: string; segs: Seg[] }[] = [{ label: "$", segs: [] }];
  segs.forEach((s, i) => crumbs.push({ label: segToken(s).replace(/^\./, ""), segs: segs.slice(0, i + 1) }));

  const visibleKids = showAll ? kids : kids.slice(0, 200);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="space-y-3 border-b border-white/10 p-4">
        <div className="flex items-center gap-2">
          <TypeBadge type={type} />
          {container && <span className="text-xs text-slate-400">{kids.length} {Array.isArray(value) ? "items" : "keys"}</span>}
        </div>

        <div className="flex flex-wrap items-center gap-x-0.5 gap-y-1 font-mono text-xs" aria-label="Path">
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-slate-600">{typeof segs[i - 1] === "number" ? "" : "."}</span>}
              <button
                onClick={() => onNavigate(c.segs)}
                className={`rounded px-1 py-0.5 hover:bg-white/10 ${i === crumbs.length - 1 ? "text-cyan-300" : "text-slate-400 hover:text-white"}`}
              >
                {c.label}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <CopyButton tag="path" label="Path" text={() => idStr} />
          <CopyButton tag="js" label="JS accessor" text={() => pathToJs(segs)} />
          <CopyButton tag="val" label="Value" text={() => (typeof value === "string" ? value : JSON.stringify(value, null, 2))} />
          {container && <CopyButton tag="min" label="Minified" text={() => JSON.stringify(value)} />}
          {container && (
            <>
              <ToolButton onClick={() => onExpandSubtree(segs)} title="Expand everything under this node">
                <ChevronsUpDown className="h-3.5 w-3.5" /> Expand
              </ToolButton>
              <ToolButton onClick={() => onCollapseSubtree(segs)} title="Collapse everything under this node">
                <ChevronsDownUp className="h-3.5 w-3.5" /> Collapse
              </ToolButton>
            </>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
        <div className="grid grid-cols-2 gap-2">
          <Meta label="Depth">{segs.length}</Meta>
          <Meta label="Size">{formatBytes(size)}</Meta>
          {type === "string" && <Meta label="Length">{(value as string).length.toLocaleString()} chars</Meta>}
          {container && <Meta label={Array.isArray(value) ? "Items" : "Keys"}>{kids.length.toLocaleString()}</Meta>}
          {segs.length > 0 && (
            <Meta label={typeof segs[segs.length - 1] === "number" ? "Index" : "Key"}>{String(segs[segs.length - 1])}</Meta>
          )}
        </div>

        {!container && (
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Value</div>
            <pre
              className={`max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-sm ${TYPE_STYLES[type].text}`}
            >
              {type === "string" ? (value as string) : String(value)}
            </pre>
            {type === "string" && <StringInsights value={value as string} onNavigateInner={() => {}} />}
            {type === "number" && <NumberInsights value={value as number} />}
          </div>
        )}

        {container && (
          <div className="space-y-3">
            <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5 text-xs">
              {(["children", "json"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-md px-3 py-1.5 font-medium capitalize transition-colors ${
                    tab === t ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t === "json" ? "JSON" : "Children"}
                </button>
              ))}
            </div>

            {tab === "children" ? (
              kids.length === 0 ? (
                <p className="text-sm text-slate-500">Empty {type}.</p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-white/10">
                  {visibleKids.map(([k, v]) => (
                    <button
                      key={String(k)}
                      onClick={() => onNavigate([...segs, k])}
                      className="flex w-full items-center gap-3 border-b border-white/[0.05] px-3 py-2 text-left font-mono text-xs last:border-b-0 hover:bg-white/[0.05]"
                    >
                      <span className={`w-24 shrink-0 truncate ${typeof k === "number" ? "text-slate-500" : "text-sky-300"}`}>
                        {String(k)}
                      </span>
                      <span className={`min-w-0 flex-1 truncate ${TYPE_STYLES[typeOf(v)].text}`}>{previewValue(v, 80)}</span>
                    </button>
                  ))}
                  {kids.length > visibleKids.length && (
                    <button
                      onClick={() => setShowAll(true)}
                      className="w-full bg-white/[0.03] px-3 py-2 text-xs text-cyan-300 hover:bg-white/[0.06]"
                    >
                      Show all {kids.length.toLocaleString()}
                    </button>
                  )}
                </div>
              )
            ) : (
              <pre className="max-h-[28rem] overflow-auto rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-xs leading-5">
                {pretty.split("\n").map((l, i) => (
                  <div key={i} className="whitespace-pre">
                    <JsonLine line={l} />
                  </div>
                ))}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
