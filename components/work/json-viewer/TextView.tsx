"use client";

import React, { useMemo } from "react";
import { JsonLine } from "./ui";
import { useVirtual } from "./useVirtual";

const ROW_H = 20;

export default function TextView({ text, highlightRe }: { text: string; highlightRe: RegExp | null }) {
  const lines = useMemo(() => text.split("\n"), [text]);
  const { ref, onScroll, start, end, total } = useVirtual(lines.length, ROW_H);
  const gutter = String(lines.length).length;

  return (
    <div ref={ref} onScroll={onScroll} className="h-full overflow-auto font-mono text-[12.5px] text-slate-300">
      <div style={{ height: total, position: "relative", minWidth: "max-content" }}>
        {lines.slice(start, end).map((line, k) => {
          const i = start + k;
          return (
            <div
              key={i}
              className="absolute left-0 right-0 flex whitespace-pre hover:bg-white/[0.03]"
              style={{ top: i * ROW_H, height: ROW_H, lineHeight: `${ROW_H}px` }}
            >
              <span
                className="sticky left-0 shrink-0 select-none bg-[#070b16] pr-3 pl-3 text-right text-slate-600"
                style={{ minWidth: `${gutter + 3}ch` }}
              >
                {i + 1}
              </span>
              <span className="pr-6">
                <JsonLine line={line} re={highlightRe} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
