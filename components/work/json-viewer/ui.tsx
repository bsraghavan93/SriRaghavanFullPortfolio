"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { JsonType } from "@/lib/json-tools";

export const TYPE_STYLES: Record<JsonType, { text: string; chip: string; label: string }> = {
  object: { text: "text-violet-300", chip: "bg-violet-400/10 text-violet-300 border-violet-400/20", label: "object" },
  array: { text: "text-cyan-300", chip: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20", label: "array" },
  string: { text: "text-emerald-300", chip: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20", label: "string" },
  number: { text: "text-amber-300", chip: "bg-amber-400/10 text-amber-300 border-amber-400/20", label: "number" },
  boolean: { text: "text-fuchsia-300", chip: "bg-fuchsia-400/10 text-fuchsia-300 border-fuchsia-400/20", label: "boolean" },
  null: { text: "text-slate-400", chip: "bg-slate-400/10 text-slate-300 border-slate-400/20", label: "null" },
};

export function TypeBadge({ type }: { type: JsonType }) {
  const s = TYPE_STYLES[type];
  return (
    <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${s.chip}`}>
      {s.label}
    </span>
  );
}

/** Wraps regex matches in <mark>. `re` must be global. */
export function Highlight({ text, re: source }: { text: string; re: RegExp | null }) {
  if (!source || !text) return <>{text}</>;
  const re = new RegExp(source.source, source.flags); // private copy: exec() mutates lastIndex
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let guard = 0;
  while ((m = re.exec(text)) && guard++ < 200) {
    if (m[0].length === 0) {
      re.lastIndex++;
      continue;
    }
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <mark key={m.index} className="rounded-[3px] bg-amber-300/30 text-amber-100 px-px">
        {m[0]}
      </mark>,
    );
    last = m.index + m[0].length;
  }
  if (last === 0) return <>{text}</>;
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async (text: string, tag = "x") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tag);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };
  return { copied, copy };
}

export function ToolButton({
  children,
  onClick,
  active,
  title,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  title?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none ${
        active
          ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-200"
          : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10 hover:text-white"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function CopyButton({ text, tag, label }: { text: () => string; tag: string; label: string }) {
  const { copied, copy } = useCopy();
  const done = copied === tag;
  return (
    <ToolButton onClick={() => copy(text(), tag)} active={done}>
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? "Copied" : label}
    </ToolButton>
  );
}

/** Tokenises one line of pretty-printed JSON into coloured spans. */
const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
export function JsonLine({ line, re }: { line: string; re?: RegExp | null }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const tokenRe = new RegExp(TOKEN.source, "g");
  while ((m = tokenRe.exec(line))) {
    if (m.index > last) out.push(<span key={`p${last}`}>{line.slice(last, m.index)}</span>);
    const tok = m[0];
    let cls = "text-amber-300";
    let content = tok;
    if (m[1] !== undefined) {
      cls = m[2] ? "text-sky-300" : "text-emerald-300";
      content = m[1];
      out.push(
        <span key={m.index} className={cls}>
          <Highlight text={content} re={re ?? null} />
        </span>,
      );
      if (m[2]) out.push(<span key={`c${m.index}`} className="text-slate-500">{m[2]}</span>);
    } else {
      if (m[3]) cls = "text-fuchsia-300";
      else if (tok === "null") cls = "text-slate-400";
      out.push(
        <span key={m.index} className={cls}>
          {tok}
        </span>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < line.length) out.push(<span key="tail">{line.slice(last)}</span>);
  return <>{out}</>;
}
