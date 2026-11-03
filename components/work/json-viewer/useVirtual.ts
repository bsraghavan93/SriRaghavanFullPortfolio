"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/** Minimal fixed-row-height windowing. Attach `ref` + `onScroll` to the scroll container. */
export function useVirtual(count: number, rowH: number, overscan = 12) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(600);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setHeight(el.clientHeight);
    const ro = new ResizeObserver(() => setHeight(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onScroll = useCallback(() => {
    if (ref.current) setScrollTop(ref.current.scrollTop);
  }, []);

  const start = Math.max(0, Math.floor(scrollTop / rowH) - overscan);
  const end = Math.min(count, Math.ceil((scrollTop + height) / rowH) + overscan);

  const scrollToIndex = useCallback(
    (i: number, center = false) => {
      const el = ref.current;
      if (!el) return;
      const top = i * rowH;
      if (center) el.scrollTop = Math.max(0, top - el.clientHeight / 2 + rowH);
      else if (top < el.scrollTop) el.scrollTop = top;
      else if (top + rowH > el.scrollTop + el.clientHeight) el.scrollTop = top + rowH - el.clientHeight;
    },
    [rowH],
  );

  // Keep the scroll position valid when the list shrinks.
  useEffect(() => {
    const el = ref.current;
    if (el && el.scrollTop > count * rowH) el.scrollTop = 0;
  }, [count, rowH]);

  return { ref, onScroll, start, end, total: count * rowH, scrollToIndex };
}
