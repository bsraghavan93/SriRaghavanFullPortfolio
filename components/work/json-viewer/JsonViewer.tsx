"use client";

import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Braces,
  ChevronsDownUp,
  ChevronsUpDown,
  Clipboard,
  Download,
  FileText,
  Globe,
  ListTree,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Search,
  ShieldCheck,
  Sparkles,
  Table2,
  Trash2,
  Upload,
  Wrench,
  X,
  ArrowDownAZ,
  AlignLeft,
  Keyboard,
} from "lucide-react";
import {
  SAMPLE_JSON,
  ancestorIds,
  buildMatcher,
  buildRows,
  computeStats,
  containerIds,
  formatBytes,
  getAt,
  isTabular,
  parseJson,
  pathToId,
  repairJson,
  searchTree,
  sortKeysDeep,
  type SearchMode,
  type Seg,
  type Stats,
} from "@/lib/json-tools";
import TreeView from "./TreeView";
import TextView from "./TextView";
import TableView from "./TableView";
import DetailsPane from "./DetailsPane";
import { ToolButton } from "./ui";

type Parsed =
  | { status: "empty" }
  | { status: "ok"; value: unknown }
  | { status: "error"; message: string; line: number; col: number; pos: number };

type View = "tree" | "text" | "table";
type MobileTab = "input" | "viewer" | "details";

const STORAGE_KEY = "work.json-viewer.v1";
const MAX_PERSIST = 500_000;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function Splitter({ onDrag, side }: { onDrag: (dx: number) => void; side: "left" | "right" }) {
  const dragging = useRef(false);
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => dragging.current && onDrag(e.movementX)}
      onPointerUp={() => (dragging.current = false)}
      className={`absolute top-0 bottom-0 z-20 hidden w-1.5 cursor-col-resize bg-transparent transition-colors hover:bg-cyan-400/40 md:block ${
        side === "left" ? "right-0" : "left-0"
      }`}
    />
  );
}

export default function JsonViewer() {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<Parsed>({ status: "empty" });
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["$"]));
  const [selected, setSelected] = useState<Seg[] | null>(null);

  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("all");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [regex, setRegex] = useState(false);
  const [matchIdx, setMatchIdx] = useState(0);

  const [view, setView] = useState<View>("tree");
  const [inputOpen, setInputOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [leftW, setLeftW] = useState(380);
  const [rightW, setRightW] = useState(380);
  const [mobileTab, setMobileTab] = useState<MobileTab>("input");
  const [indent, setIndent] = useState<"2" | "4" | "tab">("2");

  const [urlOpen, setUrlOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wasOk = useRef(false);

  const flash = useCallback((msg: string) => {
    setNotice(msg);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3500);
  }, []);

  // ── Restore / persist the input (local only) ────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setText(saved);
        setMobileTab("viewer");
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (text && text.length <= MAX_PERSIST) localStorage.setItem(STORAGE_KEY, text);
        else localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }, 600);
    return () => clearTimeout(t);
  }, [text]);

  // ── Parse ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const run = () => {
      if (!text.trim()) {
        wasOk.current = false;
        setParsed({ status: "empty" });
        setSelected(null);
        setExpanded(new Set(["$"]));
        return;
      }
      const r = parseJson(text);
      if (r.ok) {
        setParsed({ status: "ok", value: r.value });
        if (!wasOk.current) {
          setExpanded(containerIds(r.value, 1));
          setSelected([]);
        }
        wasOk.current = true;
      } else {
        setParsed({ status: "error", message: r.message, line: r.line, col: r.col, pos: r.pos });
      }
    };
    const t = setTimeout(run, text.length > 100_000 ? 250 : 80);
    return () => clearTimeout(t);
  }, [text]);

  const root = parsed.status === "ok" ? parsed.value : undefined;
  const hasDoc = parsed.status === "ok";

  const stats: Stats | null = useMemo(() => (hasDoc ? computeStats(root) : null), [hasDoc, root]);
  const bytes = useMemo(() => new Blob([text]).size, [text]);

  const rows = useMemo(() => (hasDoc ? buildRows(root, expanded) : []), [hasDoc, root, expanded]);

  // ── Search ──────────────────────────────────────────────────────────────────
  const deferredQuery = useDeferredValue(query);
  const search = useMemo(
    () =>
      hasDoc
        ? searchTree(root, { query: deferredQuery, mode, caseSensitive, regex })
        : { matches: [], truncated: false, error: undefined as string | undefined },
    [hasDoc, root, deferredQuery, mode, caseSensitive, regex],
  );
  const matchIds = useMemo(() => new Set(search.matches.map((m) => m.id)), [search.matches]);
  const currentMatch = search.matches[matchIdx] ?? null;
  const highlightRe = useMemo(() => {
    const q = deferredQuery.trim();
    if (!q || q.startsWith("$")) return null;
    return buildMatcher({ query: q, mode, caseSensitive, regex }).re;
  }, [deferredQuery, mode, caseSensitive, regex]);

  useEffect(() => {
    if (!search.matches.length) return;
    setMatchIdx(0);
    setExpanded((prev) => {
      const next = new Set(prev);
      for (const m of search.matches) for (const id of ancestorIds(m.segs)) next.add(id);
      return next;
    });
    setSelected(search.matches[0].segs);
  }, [search.matches]);

  const gotoMatch = (delta: number) => {
    const n = search.matches.length;
    if (!n) return;
    const i = (matchIdx + delta + n) % n;
    setMatchIdx(i);
    setSelected(search.matches[i].segs);
  };

  // ── Selection & expansion ───────────────────────────────────────────────────
  const reveal = useCallback((segs: Seg[]) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      for (const id of ancestorIds(segs)) next.add(id);
      return next;
    });
    setSelected(segs);
  }, []);

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandLevel = (n: number) => hasDoc && setExpanded(containerIds(root, n - 1));
  const expandAll = () => {
    if (!hasDoc) return;
    const ids = containerIds(root);
    if (ids.size >= 200_000) flash("Very large document — expanded the first 200,000 containers.");
    setExpanded(ids);
  };
  const collapseAll = () => setExpanded(new Set(["$"]));

  const expandSubtree = (segs: Seg[]) => {
    const sub = getAt(root, segs);
    if (!sub.found) return;
    const base = pathToId(segs);
    const ids = containerIds(sub.value);
    setExpanded((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(base + id.slice(1)));
      for (const a of ancestorIds(segs)) next.add(a);
      return next;
    });
  };
  const collapseSubtree = (segs: Seg[]) => {
    const base = pathToId(segs);
    setExpanded((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        const inside = id === base || id.startsWith(base + ".") || id.startsWith(base + "[");
        if (!inside) next.add(id);
      });
      return next;
    });
  };

  const selectedNode = useMemo(() => {
    if (!hasDoc || !selected) return { segs: null as Seg[] | null, value: undefined as unknown };
    const r = getAt(root, selected);
    return r.found ? { segs: selected, value: r.value } : { segs: null, value: undefined };
  }, [hasDoc, root, selected]);

  // ── Table source ────────────────────────────────────────────────────────────
  const table = useMemo(() => {
    if (!hasDoc) return null;
    if (selectedNode.segs && isTabular(selectedNode.value))
      return { segs: selectedNode.segs, rows: selectedNode.value as Record<string, unknown>[] };
    if (isTabular(root)) return { segs: [] as Seg[], rows: root as Record<string, unknown>[] };
    return null;
  }, [hasDoc, root, selectedNode]);

  const prettyText = useMemo(() => {
    if (!hasDoc || view !== "text") return "";
    return JSON.stringify(root, null, indent === "tab" ? "\t" : Number(indent)) ?? "";
  }, [hasDoc, root, view, indent]);

  // ── Input actions ───────────────────────────────────────────────────────────
  const loadText = (t: string, label?: string) => {
    wasOk.current = false;
    setText(t);
    setMobileTab("viewer");
    if (label) flash(label);
  };

  const indentArg = indent === "tab" ? "\t" : Number(indent);

  const format = (sort = false) => {
    if (!hasDoc) return;
    setText(JSON.stringify(sort ? sortKeysDeep(root) : root, null, indentArg));
  };
  const minify = () => hasDoc && setText(JSON.stringify(root));
  const tryFix = () => {
    const fixed = repairJson(text);
    const r = parseJson(fixed);
    if (r.ok) {
      setText(JSON.stringify(r.value, null, indentArg));
      flash("Fixed: removed comments / trailing commas, quoted keys.");
    } else {
      setText(fixed);
      flash("Applied automatic fixes, but there are still errors to resolve manually.");
    }
  };

  const readFile = async (file: File) => {
    try {
      loadText(await file.text(), `Loaded ${file.name}`);
    } catch {
      flash("Couldn't read that file.");
    }
  };

  const pasteClipboard = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) loadText(t);
      else flash("Clipboard is empty.");
    } catch {
      flash("Clipboard access was blocked — paste into the input box instead.");
      setMobileTab("input");
      textareaRef.current?.focus();
    }
  };

  const fetchUrl = async () => {
    if (!url.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(url.trim());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      loadText(await res.text(), "Fetched from URL");
      setUrlOpen(false);
    } catch (e) {
      flash(`Couldn't fetch (${e instanceof Error ? e.message : "error"}). The server may block cross-origin requests (CORS).`);
    } finally {
      setBusy(false);
    }
  };

  const downloadText = () => {
    const blob = new Blob([text], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "data.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const jumpToError = () => {
    if (parsed.status !== "error") return;
    const ta = textareaRef.current;
    if (!ta) return;
    setMobileTab("input");
    setInputOpen(true);
    ta.focus();
    ta.setSelectionRange(parsed.pos, Math.min(text.length, parsed.pos + 1));
    const lineH = 18;
    ta.scrollTop = Math.max(0, (parsed.line - 1) * lineH - ta.clientHeight / 2);
  };

  // ── Global shortcuts ────────────────────────────────────────────────────────
  const onRootKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
      e.preventDefault();
      setMobileTab("viewer");
      searchRef.current?.focus();
      searchRef.current?.select();
    } else if (e.key === "/" && !typing) {
      e.preventDefault();
      searchRef.current?.focus();
    } else if (e.key === "F3") {
      e.preventDefault();
      gotoMatch(e.shiftKey ? -1 : 1);
    }
  };

  const lineCount = useMemo(() => (text ? text.split("\n").length : 0), [text]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      onKeyDown={onRootKeyDown}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragOver(false);
      }}
      onDrop={async (e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) await readFile(f);
        else {
          const t = e.dataTransfer.getData("text");
          if (t) loadText(t);
        }
      }}
      className="relative flex h-[100dvh] flex-col bg-[#030711] text-slate-200"
    >
      {/* Top bar */}
      <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#070b16] px-3 py-2.5 md:px-4">
        <Link
          href="/work"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Work
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 text-white">
            <Braces className="h-4 w-4" />
          </span>
          <h1 className="text-sm font-semibold tracking-tight text-white">JSON Viewer</h1>
        </div>
        <span className="ml-1 hidden items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-300 sm:inline-flex">
          <ShieldCheck className="h-3 w-3" /> Runs in your browser · nothing is uploaded
        </span>
        <div className="relative ml-auto">
          <ToolButton onClick={() => setHelpOpen((v) => !v)} active={helpOpen} title="Shortcuts & tips">
            <Keyboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Shortcuts</span>
          </ToolButton>
          {helpOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-white/10 bg-[#0b1120] p-4 text-xs shadow-2xl">
              <div className="mb-2 font-semibold text-white">Shortcuts</div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-slate-300">
                {[
                  ["Ctrl/⌘ + F  or  /", "Search"],
                  ["Enter / Shift+Enter", "Next / previous match"],
                  ["↑ ↓", "Move through the tree"],
                  ["→ / ←", "Expand / collapse (or go to parent)"],
                  ["Enter · Space", "Toggle selected node"],
                  ["Double-click", "Toggle a node"],
                  ["Esc", "Clear search (in search box)"],
                ].map(([k, d]) => (
                  <React.Fragment key={k}>
                    <dt className="font-mono text-cyan-300">{k}</dt>
                    <dd>{d}</dd>
                  </React.Fragment>
                ))}
              </dl>
              <div className="mt-3 border-t border-white/10 pt-3 text-slate-400">
                <div className="mb-1 font-semibold text-white">Path queries</div>
                Start the search with <code className="text-cyan-300">$</code> to run a JSONPath-style query:
                <ul className="mt-1.5 space-y-0.5 font-mono text-[11px] text-slate-300">
                  <li>$.projects[0].client</li>
                  <li>$.projects[*].impact</li>
                  <li>$..tags</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </header>

      {notice && (
        <div className="absolute left-1/2 top-16 z-50 max-w-[90vw] -translate-x-1/2 rounded-xl border border-white/15 bg-[#0f172a] px-4 py-2.5 text-xs text-slate-200 shadow-2xl">
          {notice}
        </div>
      )}

      {dragOver && (
        <div className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center bg-[#030711]/80 backdrop-blur-sm">
          <div className="rounded-2xl border-2 border-dashed border-cyan-400/60 px-10 py-8 text-center text-cyan-200">
            <Upload className="mx-auto mb-2 h-8 w-8" />
            Drop a .json file or text to load it
          </div>
        </div>
      )}

      {/* Panes */}
      <div
        className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[var(--l)_minmax(0,1fr)_var(--r)]"
        style={
          {
            "--l": inputOpen ? `${leftW}px` : "44px",
            "--r": detailsOpen ? `${rightW}px` : "44px",
          } as React.CSSProperties
        }
      >
        {/* ── Input pane ─────────────────────────────────────────────────────── */}
        <section
          className={`relative min-h-0 min-w-0 flex-col border-r border-white/10 bg-[#070b16] ${
            mobileTab === "input" ? "flex" : "hidden"
          } md:flex`}
        >
          {inputOpen ? (
            <>
              <Splitter side="left" onDrag={(dx) => setLeftW((w) => clamp(w + dx, 260, 720))} />
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Input</h2>
                <button
                  onClick={() => setInputOpen(false)}
                  className="ml-auto hidden rounded p-1 text-slate-500 hover:bg-white/10 hover:text-white md:block"
                  aria-label="Collapse input"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 border-b border-white/10 p-2.5">
                <ToolButton onClick={pasteClipboard} title="Paste from clipboard">
                  <Clipboard className="h-3.5 w-3.5" /> Paste
                </ToolButton>
                <ToolButton onClick={() => fileRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5" /> Open
                </ToolButton>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".json,.txt,.log,application/json,text/plain"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) readFile(f);
                    e.target.value = "";
                  }}
                />
                <ToolButton onClick={() => setUrlOpen((v) => !v)} active={urlOpen}>
                  <Globe className="h-3.5 w-3.5" /> URL
                </ToolButton>
                <ToolButton onClick={() => loadText(JSON.stringify(SAMPLE_JSON, null, 2))}>
                  <Sparkles className="h-3.5 w-3.5" /> Sample
                </ToolButton>
                <ToolButton onClick={() => loadText("")} disabled={!text}>
                  <Trash2 className="h-3.5 w-3.5" /> Clear
                </ToolButton>
              </div>

              {urlOpen && (
                <form
                  className="flex gap-1.5 border-b border-white/10 p-2.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    fetchUrl();
                  }}
                >
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://api.example.com/data.json"
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                  />
                  <ToolButton onClick={fetchUrl} disabled={busy || !url.trim()}>
                    {busy ? "Loading…" : "Fetch"}
                  </ToolButton>
                </form>
              )}

              <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 p-2.5">
                <ToolButton onClick={() => format(false)} disabled={!hasDoc} title="Pretty-print">
                  <AlignLeft className="h-3.5 w-3.5" /> Format
                </ToolButton>
                <ToolButton onClick={minify} disabled={!hasDoc} title="Remove whitespace">
                  <Minimize2 className="h-3.5 w-3.5" /> Minify
                </ToolButton>
                <ToolButton onClick={() => format(true)} disabled={!hasDoc} title="Sort all keys A→Z">
                  <ArrowDownAZ className="h-3.5 w-3.5" /> Sort
                </ToolButton>
                <select
                  value={indent}
                  onChange={(e) => setIndent(e.target.value as "2" | "4" | "tab")}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-slate-300 outline-none"
                  aria-label="Indent"
                >
                  <option value="2">2 spaces</option>
                  <option value="4">4 spaces</option>
                  <option value="tab">Tab</option>
                </select>
                <ToolButton onClick={downloadText} disabled={!text} title="Download as .json">
                  <Download className="h-3.5 w-3.5" />
                </ToolButton>
              </div>

              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                wrap="off"
                placeholder={"Paste JSON here, drop a file anywhere, or load the sample…"}
                className="min-h-0 flex-1 resize-none bg-transparent p-3 font-mono text-[12.5px] leading-[18px] text-slate-300 outline-none placeholder:text-slate-600"
              />

              {parsed.status === "error" && (
                <div className="space-y-2 border-t border-rose-400/20 bg-rose-500/[0.07] p-3 text-xs">
                  <div className="flex items-start gap-2 text-rose-300">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <div>
                      <div className="font-semibold">
                        Invalid JSON · line {parsed.line}, col {parsed.col}
                      </div>
                      <div className="mt-0.5 break-words text-rose-300/80">{parsed.message}</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <ToolButton onClick={jumpToError}>Go to error</ToolButton>
                    <ToolButton onClick={tryFix}>
                      <Wrench className="h-3.5 w-3.5" /> Try to fix
                    </ToolButton>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 border-t border-white/10 px-3 py-1.5 text-[11px] text-slate-500">
                <span>{formatBytes(bytes)}</span>
                <span>{lineCount.toLocaleString()} lines</span>
                <span className={`ml-auto font-medium ${parsed.status === "ok" ? "text-emerald-400" : parsed.status === "error" ? "text-rose-400" : ""}`}>
                  {parsed.status === "ok" ? "✓ Valid JSON" : parsed.status === "error" ? "✕ Invalid" : "Empty"}
                </span>
              </div>
            </>
          ) : (
            <button
              onClick={() => setInputOpen(true)}
              className="hidden h-full w-full flex-col items-center gap-3 pt-3 text-slate-500 hover:text-white md:flex"
              aria-label="Expand input"
            >
              <PanelLeftOpen className="h-4 w-4" />
              <span className="text-[10px] font-semibold uppercase tracking-widest [writing-mode:vertical-rl]">Input</span>
            </button>
          )}
        </section>

        {/* ── Viewer pane ────────────────────────────────────────────────────── */}
        <section className={`min-h-0 min-w-0 flex-col ${mobileTab === "viewer" ? "flex" : "hidden"} md:flex`}>
          {/* View tabs + expand controls */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
            <div className="flex gap-0.5 rounded-lg border border-white/10 bg-white/[0.03] p-0.5 text-xs">
              {(
                [
                  ["tree", "Tree", ListTree],
                  ["text", "Text", FileText],
                  ["table", "Table", Table2],
                ] as const
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors ${
                    view === id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>

            {view === "tree" && hasDoc && (
              <div className="flex items-center gap-1">
                <ToolButton onClick={expandAll} title="Expand all">
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">Expand</span>
                </ToolButton>
                <ToolButton onClick={collapseAll} title="Collapse all">
                  <ChevronsDownUp className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">Collapse</span>
                </ToolButton>
                <div className="ml-1 hidden items-center gap-0.5 sm:flex">
                  <span className="mr-1 text-[10px] uppercase tracking-wider text-slate-600">Level</span>
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => expandLevel(n)}
                      className="h-6 w-6 rounded-md border border-white/10 bg-white/[0.03] text-[11px] font-medium text-slate-300 hover:bg-white/10 hover:text-white"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {stats && (
              <div className="ml-auto hidden items-center gap-3 text-[11px] text-slate-500 xl:flex">
                <span>{stats.nodes.toLocaleString()} nodes</span>
                <span>depth {stats.maxDepth}</span>
                <span>{stats.types.object.toLocaleString()} objects</span>
                <span>{stats.types.array.toLocaleString()} arrays</span>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    gotoMatch(e.shiftKey ? -1 : 1);
                  } else if (e.key === "Escape") {
                    setQuery("");
                    (e.target as HTMLElement).blur();
                  }
                }}
                disabled={!hasDoc}
                placeholder="Search keys & values — or type $.path[*].to.query"
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-1.5 pl-8 pr-8 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40 disabled:opacity-50"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as SearchMode)}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-slate-300 outline-none"
              aria-label="Search in"
            >
              <option value="all">Keys + values</option>
              <option value="keys">Keys only</option>
              <option value="values">Values only</option>
            </select>
            <ToolButton onClick={() => setCaseSensitive((v) => !v)} active={caseSensitive} title="Match case">
              Aa
            </ToolButton>
            <ToolButton onClick={() => setRegex((v) => !v)} active={regex} title="Regular expression">
              .*
            </ToolButton>
            {query.trim() && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                {search.error ? (
                  <span className="max-w-[16rem] truncate text-rose-300" title={search.error}>
                    {search.error}
                  </span>
                ) : (
                  <span className="tabular-nums">
                    {search.matches.length ? matchIdx + 1 : 0} / {search.matches.length.toLocaleString()}
                    {search.truncated ? "+" : ""}
                  </span>
                )}
                <button
                  onClick={() => gotoMatch(-1)}
                  disabled={!search.matches.length}
                  className="rounded p-1 hover:bg-white/10 hover:text-white disabled:opacity-30"
                  aria-label="Previous match"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => gotoMatch(1)}
                  disabled={!search.matches.length}
                  className="rounded p-1 hover:bg-white/10 hover:text-white disabled:opacity-30"
                  aria-label="Next match"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 bg-[#070b16]">
            {parsed.status === "empty" && (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-300">
                  <Braces className="h-7 w-7" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-white">Paste, drop or load some JSON</h2>
                  <p className="mt-1 max-w-sm text-sm text-slate-400">
                    Explore it as a collapsible tree, search keys and values, query paths, and inspect any node in the
                    side panel.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <ToolButton onClick={pasteClipboard}>
                    <Clipboard className="h-3.5 w-3.5" /> Paste from clipboard
                  </ToolButton>
                  <ToolButton onClick={() => fileRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5" /> Open file
                  </ToolButton>
                  <ToolButton onClick={() => loadText(JSON.stringify(SAMPLE_JSON, null, 2))}>
                    <Sparkles className="h-3.5 w-3.5" /> Try the sample
                  </ToolButton>
                </div>
              </div>
            )}

            {parsed.status === "error" && (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                <AlertTriangle className="h-8 w-8 text-rose-400" />
                <h2 className="text-base font-semibold text-white">That isn&apos;t valid JSON yet</h2>
                <p className="max-w-md break-words text-sm text-slate-400">
                  Line {parsed.line}, column {parsed.col}: {parsed.message}
                </p>
                <div className="flex gap-2">
                  <ToolButton onClick={jumpToError}>Go to error</ToolButton>
                  <ToolButton onClick={tryFix}>
                    <Wrench className="h-3.5 w-3.5" /> Try to fix
                  </ToolButton>
                </div>
              </div>
            )}

            {hasDoc && view === "tree" && (
              <TreeView
                rows={rows}
                selectedId={selected ? pathToId(selected) : null}
                matchIds={matchIds}
                currentMatchId={currentMatch?.id ?? null}
                highlightRe={highlightRe}
                onSelect={(row) => setSelected(row.segs)}
                onToggle={toggle}
              />
            )}
            {hasDoc && view === "text" && <TextView text={prettyText} highlightRe={highlightRe} />}
            {hasDoc && view === "table" && (
              <TableView
                rows={table?.rows ?? null}
                sourceLabel={table ? pathToId(table.segs) : ""}
                selectedIndex={
                  table && selected && selected.length === table.segs.length + 1 && typeof selected[selected.length - 1] === "number"
                    ? (selected[selected.length - 1] as number)
                    : null
                }
                onSelectRow={(i) => table && reveal([...table.segs, i])}
              />
            )}
          </div>
        </section>

        {/* ── Details pane ───────────────────────────────────────────────────── */}
        <section
          className={`relative min-h-0 min-w-0 flex-col border-l border-white/10 bg-[#0a0f1d] ${
            mobileTab === "details" ? "flex" : "hidden"
          } md:flex`}
        >
          {detailsOpen ? (
            <>
              <Splitter side="right" onDrag={(dx) => setRightW((w) => clamp(w - dx, 280, 720))} />
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Details</h2>
                <button
                  onClick={() => setDetailsOpen(false)}
                  className="ml-auto hidden rounded p-1 text-slate-500 hover:bg-white/10 hover:text-white md:block"
                  aria-label="Collapse details"
                >
                  <PanelRightClose className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1">
                {hasDoc ? (
                  <DetailsPane
                    segs={selectedNode.segs}
                    value={selectedNode.value}
                    onNavigate={reveal}
                    onExpandSubtree={expandSubtree}
                    onCollapseSubtree={collapseSubtree}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-8 text-center text-sm text-slate-500">
                    Load some JSON to inspect nodes here.
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setDetailsOpen(true)}
              className="hidden h-full w-full flex-col items-center gap-3 pt-3 text-slate-500 hover:text-white md:flex"
              aria-label="Expand details"
            >
              <PanelRightOpen className="h-4 w-4" />
              <span className="text-[10px] font-semibold uppercase tracking-widest [writing-mode:vertical-rl]">Details</span>
            </button>
          )}
        </section>
      </div>

      {/* Mobile tab bar */}
      <nav className="grid shrink-0 grid-cols-3 border-t border-white/10 bg-[#070b16] md:hidden">
        {(
          [
            ["input", "Input"],
            ["viewer", "Viewer"],
            ["details", "Details"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setMobileTab(id)}
            className={`py-3 text-xs font-medium ${mobileTab === id ? "text-cyan-300" : "text-slate-500"}`}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
