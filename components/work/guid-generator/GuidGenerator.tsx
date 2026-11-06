"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Fingerprint, RefreshCw, Search } from "lucide-react";
import ToolHeader from "@/components/work/ToolHeader";
import { CopyButton, ToolButton, useCopy } from "@/components/work/json-viewer/ui";
import {
  FORMAT_LABELS,
  NAMESPACES,
  formatUuid,
  inspectUuid,
  randomUuidV4,
  uuidV5,
  uuidV7Batch,
  type GuidFormat,
  type GuidVersion,
} from "@/lib/guid";

const VERSIONS: { id: GuidVersion; label: string; hint: string }[] = [
  { id: "v4", label: "v4 · Random", hint: "What Guid.NewGuid() returns. Best general default." },
  { id: "v7", label: "v7 · Time-ordered", hint: "Sorts by creation time — great for database keys (.NET 9: Guid.CreateVersion7())." },
  { id: "v5", label: "v5 · Name-based", hint: "Deterministic: the same namespace + name always gives the same GUID." },
  { id: "nil", label: "Nil", hint: "00000000-0000-0000-0000-000000000000 (Guid.Empty)." },
  { id: "max", label: "Max", hint: "ffffffff-ffff-ffff-ffff-ffffffffffff." },
];

const SEPARATORS = { newline: "\n", comma: ", ", commaNewline: ",\n", space: " " } as const;
type Sep = keyof typeof SEPARATORS;

const MAX_COUNT = 10_000;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40";

export default function GuidGenerator() {
  const [version, setVersion] = useState<GuidVersion>("v4");
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState<GuidFormat>("standard");
  const [sep, setSep] = useState<Sep>("newline");
  const [wrapArray, setWrapArray] = useState(false);

  const [ns, setNs] = useState<keyof typeof NAMESPACES | "custom">("DNS");
  const [customNs, setCustomNs] = useState("");
  const [names, setNames] = useState("benchy\narticulated-dragon\ncontroller-stand");

  const [uuids, setUuids] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inspectText, setInspectText] = useState("");
  const { copied, copy } = useCopy();

  const generate = useCallback(async () => {
    setError(null);
    const n = Math.min(MAX_COUNT, Math.max(1, Math.floor(count) || 1));
    switch (version) {
      case "v4":
        setUuids(Array.from({ length: n }, randomUuidV4));
        break;
      case "v7":
        setUuids(uuidV7Batch(n));
        break;
      case "nil":
        setUuids(Array(n).fill("00000000-0000-0000-0000-000000000000"));
        break;
      case "max":
        setUuids(Array(n).fill("ffffffff-ffff-ffff-ffff-ffffffffffff"));
        break;
      case "v5": {
        const namespace = ns === "custom" ? customNs.trim() : NAMESPACES[ns];
        const list = names.split("\n").map((s) => s.replace(/\r$/, "")).filter((s) => s.length > 0);
        if (!list.length) return setError("Enter at least one name (one per line).");
        const out = await Promise.all(list.map((nm) => uuidV5(namespace, nm)));
        if (out.some((x) => x === null)) return setError("The custom namespace isn't a valid UUID.");
        setUuids(out as string[]);
        break;
      }
    }
  }, [version, count, ns, customNs, names]);

  // Generate on first load and whenever the generator type changes.
  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const formatted = useMemo(() => uuids.map((u) => formatUuid(u, format)), [uuids, format]);

  const output = useMemo(() => {
    if (wrapArray) {
      const items = uuids.map((u) => (format === "js" ? formatUuid(u, "js") : JSON.stringify(formatUuid(u, format))));
      return `[\n${items.map((i) => "  " + i).join(",\n")}\n]`;
    }
    return formatted.join(SEPARATORS[sep]);
  }, [formatted, uuids, format, sep, wrapArray]);

  const info = useMemo(() => (inspectText.trim() ? inspectUuid(inspectText) : null), [inspectText]);
  const hint = VERSIONS.find((v) => v.id === version)?.hint;

  const download = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "guids.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#030711] text-slate-200">
      <ToolHeader title="GUID / UUID Generator" icon={Fingerprint} />

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 p-4 md:p-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Options */}
        <aside className="space-y-5 rounded-2xl border border-white/10 bg-[#070b16] p-5 lg:self-start">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Type</span>
            <div className="grid grid-cols-1 gap-1.5">
              {VERSIONS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVersion(v.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    version === v.id
                      ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <p className="text-xs leading-5 text-slate-500">{hint}</p>
          </div>

          {version === "v5" ? (
            <div className="space-y-3">
              <Field label="Namespace">
                <select value={ns} onChange={(e) => setNs(e.target.value as typeof ns)} className={inputCls}>
                  <option value="DNS">DNS</option>
                  <option value="URL">URL</option>
                  <option value="OID">OID</option>
                  <option value="X500">X.500</option>
                  <option value="custom">Custom UUID…</option>
                </select>
              </Field>
              {ns === "custom" && (
                <input
                  value={customNs}
                  onChange={(e) => setCustomNs(e.target.value)}
                  placeholder="namespace UUID"
                  className={`${inputCls} font-mono`}
                />
              )}
              <Field label="Names (one per line)">
                <textarea
                  value={names}
                  onChange={(e) => setNames(e.target.value)}
                  rows={4}
                  spellCheck={false}
                  className={`${inputCls} font-mono`}
                />
              </Field>
            </div>
          ) : (
            <Field label={`How many (1–${MAX_COUNT.toLocaleString()})`}>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={MAX_COUNT}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className={inputCls}
                />
                {[1, 10, 100].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-xs text-slate-300 hover:bg-white/10"
                  >
                    {n}
                  </button>
                ))}
              </div>
            </Field>
          )}

          <Field label="Format">
            <select value={format} onChange={(e) => setFormat(e.target.value as GuidFormat)} className={inputCls}>
              {(Object.keys(FORMAT_LABELS) as GuidFormat[]).map((f) => (
                <option key={f} value={f}>
                  {FORMAT_LABELS[f]}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 items-end gap-3">
            <Field label="Separator">
              <select
                value={sep}
                onChange={(e) => setSep(e.target.value as Sep)}
                disabled={wrapArray}
                className={`${inputCls} disabled:opacity-40`}
              >
                <option value="newline">New line</option>
                <option value="comma">Comma</option>
                <option value="commaNewline">Comma + line</option>
                <option value="space">Space</option>
              </select>
            </Field>
            <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={wrapArray}
                onChange={(e) => setWrapArray(e.target.checked)}
                className="h-4 w-4 accent-cyan-400"
              />
              JSON array
            </label>
          </div>

          <button
            onClick={generate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-opacity hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" /> Generate
          </button>
          {error && <p className="text-xs text-rose-300">{error}</p>}
        </aside>

        {/* Results */}
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-white/10 bg-[#070b16]">
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-3">
              <h2 className="text-sm font-semibold text-white">
                Result <span className="ml-1 font-normal text-slate-500">{uuids.length.toLocaleString()}</span>
              </h2>
              <div className="ml-auto flex gap-2">
                <CopyButton tag="all" label="Copy all" text={() => output} />
                <ToolButton onClick={download} disabled={!uuids.length}>
                  <Download className="h-3.5 w-3.5" /> .txt
                </ToolButton>
              </div>
            </div>

            {uuids.length <= 20 && !wrapArray ? (
              <ul className="divide-y divide-white/[0.06]">
                {formatted.map((f, i) => (
                  <li key={i} className="group flex items-center gap-3 px-4 py-2.5">
                    <span className="w-6 shrink-0 text-right text-[11px] text-slate-600">{i + 1}</span>
                    <code className="min-w-0 flex-1 break-all font-mono text-sm text-emerald-300">{f}</code>
                    <button
                      onClick={() => copy(f, `row${i}`)}
                      className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {copied === `row${i}` ? "Copied" : "Copy"}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <textarea
                readOnly
                value={output}
                spellCheck={false}
                wrap="off"
                className="h-80 w-full resize-y bg-transparent p-4 font-mono text-[13px] leading-6 text-emerald-300 outline-none"
              />
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#070b16] p-5">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
              <Search className="h-4 w-4 text-slate-500" /> Inspect a GUID
            </h2>
            <p className="mb-3 text-xs text-slate-500">
              Paste any GUID (braces, URN or no hyphens are fine) to see its version, variant and embedded time.
            </p>
            <input
              value={inspectText}
              onChange={(e) => setInspectText(e.target.value)}
              placeholder="e.g. 0190c2b4-6a1e-7c3a-9f2e-3b5d8a1c4e7f"
              spellCheck={false}
              className={`${inputCls} font-mono`}
            />
            {inspectText.trim() && !info && <p className="mt-3 text-sm text-rose-300">That doesn&apos;t look like a valid GUID.</p>}
            {info && (
              <div className="mt-4 space-y-4">
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    ["Version", info.version === null ? "—" : `v${info.version}`],
                    ["Variant", info.variant],
                    [
                      "Timestamp",
                      info.timestamp && !isNaN(info.timestamp.getTime()) ? info.timestamp.toLocaleString() : "—",
                    ],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500">{k}</div>
                      <div className="mt-0.5 truncate text-sm text-slate-200">{v}</div>
                    </div>
                  ))}
                </div>
                {info.note && <p className="text-xs text-slate-400">{info.note}</p>}
                <div className="overflow-hidden rounded-lg border border-white/10">
                  {(Object.keys(FORMAT_LABELS) as GuidFormat[]).map((f) => {
                    const val = formatUuid(info.canonical, f);
                    return (
                      <button
                        key={f}
                        onClick={() => copy(val, `ins-${f}`)}
                        className="flex w-full items-center gap-3 border-b border-white/[0.05] px-3 py-2 text-left last:border-b-0 hover:bg-white/[0.05]"
                      >
                        <span className="w-44 shrink-0 text-[11px] text-slate-500">{FORMAT_LABELS[f]}</span>
                        <code className="min-w-0 flex-1 truncate font-mono text-xs text-slate-300">{val}</code>
                        <span className="text-[11px] text-slate-500">{copied === `ins-${f}` ? "Copied" : "Copy"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
