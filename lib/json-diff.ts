// Structural + line diffing for the JSON Diff tool. Pure functions, browser-only use.
import { childrenOf, pathToId, sortKeysDeep, typeOf, type Seg } from "./json-tools";

export type ChangeKind = "added" | "removed" | "changed" | "type";

export type Change = {
  kind: ChangeKind;
  segs: Seg[];
  id: string;
  before?: unknown;
  after?: unknown;
};

export type DiffOptions = {
  /** Treat arrays as unordered collections (compare elements as a multiset). */
  ignoreArrayOrder: boolean;
};

export type DiffResult = {
  changes: Change[];
  counts: Record<ChangeKind, number>;
  truncated: boolean;
};

const canonical = (v: unknown) => JSON.stringify(sortKeysDeep(v));

export function diffJson(a: unknown, b: unknown, opts: DiffOptions, limit = 10_000): DiffResult {
  const changes: Change[] = [];
  const counts: Record<ChangeKind, number> = { added: 0, removed: 0, changed: 0, type: 0 };
  let truncated = false;

  const push = (c: Omit<Change, "id">) => {
    if (changes.length >= limit) {
      truncated = true;
      return;
    }
    counts[c.kind]++;
    changes.push({ ...c, id: pathToId(c.segs) });
  };

  const walk = (x: unknown, y: unknown, segs: Seg[]) => {
    if (truncated) return;
    const tx = typeOf(x);
    const ty = typeOf(y);
    if (tx !== ty) return push({ kind: "type", segs, before: x, after: y });

    if (tx === "array") {
      const xa = x as unknown[];
      const ya = y as unknown[];
      if (opts.ignoreArrayOrder) {
        const pool = new Map<string, number>();
        for (const item of ya) pool.set(canonical(item), (pool.get(canonical(item)) ?? 0) + 1);
        const leftovers: unknown[] = [];
        for (const item of xa) {
          const key = canonical(item);
          const n = pool.get(key) ?? 0;
          if (n > 0) pool.set(key, n - 1);
          else leftovers.push(item);
        }
        const extra: unknown[] = [];
        for (const item of ya) {
          const key = canonical(item);
          const n = pool.get(key) ?? 0;
          if (n > 0) {
            extra.push(item);
            pool.set(key, n - 1);
          }
        }
        leftovers.forEach((item) => push({ kind: "removed", segs: [...segs, xa.indexOf(item)], before: item }));
        extra.forEach((item) => push({ kind: "added", segs: [...segs, ya.indexOf(item)], after: item }));
        return;
      }
      const n = Math.max(xa.length, ya.length);
      for (let i = 0; i < n; i++) {
        if (i >= xa.length) push({ kind: "added", segs: [...segs, i], after: ya[i] });
        else if (i >= ya.length) push({ kind: "removed", segs: [...segs, i], before: xa[i] });
        else walk(xa[i], ya[i], [...segs, i]);
      }
      return;
    }

    if (tx === "object") {
      const xo = x as Record<string, unknown>;
      const yo = y as Record<string, unknown>;
      for (const [k, v] of childrenOf(xo)) {
        if (k in yo) walk(v, yo[k as string], [...segs, k]);
        else push({ kind: "removed", segs: [...segs, k], before: v });
      }
      for (const [k, v] of childrenOf(yo)) {
        if (!(k in xo)) push({ kind: "added", segs: [...segs, k], after: v });
      }
      return;
    }

    if (!Object.is(x, y)) push({ kind: "changed", segs, before: x, after: y });
  };

  walk(a, b, []);
  return { changes, counts, truncated };
}

// ─── RFC 6902 JSON Patch ──────────────────────────────────────────────────────
const ptr = (segs: Seg[]) => segs.map((s) => "/" + String(s).replace(/~/g, "~0").replace(/\//g, "~1")).join("");

/** Patch that turns A into B. Only valid for index-based array diffs (not "ignore array order"). */
export function toJsonPatch(changes: Change[]) {
  const replaces = changes.filter((c) => c.kind === "changed" || c.kind === "type");
  const removes = changes.filter((c) => c.kind === "removed");
  const adds = changes.filter((c) => c.kind === "added");
  // Removing array tail items must go from the highest index down.
  removes.sort((x, y) => {
    const lx = x.segs[x.segs.length - 1];
    const ly = y.segs[y.segs.length - 1];
    return typeof lx === "number" && typeof ly === "number" ? ly - lx : 0;
  });
  return [
    ...replaces.map((c) => ({ op: "replace", path: ptr(c.segs), value: c.after })),
    ...removes.map((c) => ({ op: "remove", path: ptr(c.segs) })),
    ...adds.map((c) => ({ op: "add", path: ptr(c.segs), value: c.after })),
  ];
}

export function changesToText(changes: Change[]): string {
  const show = (v: unknown) => (v === undefined ? "" : JSON.stringify(v));
  const sym: Record<ChangeKind, string> = { added: "+", removed: "-", changed: "~", type: "!" };
  return changes
    .map((c) => {
      if (c.kind === "added") return `${sym[c.kind]} ${c.id}  ${show(c.after)}`;
      if (c.kind === "removed") return `${sym[c.kind]} ${c.id}  ${show(c.before)}`;
      return `${sym[c.kind]} ${c.id}  ${show(c.before)} → ${show(c.after)}`;
    })
    .join("\n");
}

// ─── Line diff (for the side-by-side text view) ───────────────────────────────
export type DiffRow = {
  kind: "same" | "del" | "add" | "mod";
  left?: { n: number; text: string };
  right?: { n: number; text: string };
};

/** Aligned side-by-side rows from a classic LCS diff. Returns null if the input is too large. */
export function lineDiff(aText: string, bText: string, maxCells = 6_000_000): DiffRow[] | null {
  const a = aText.split("\n");
  const b = bText.split("\n");

  let pre = 0;
  while (pre < a.length && pre < b.length && a[pre] === b[pre]) pre++;
  let suf = 0;
  while (suf < a.length - pre && suf < b.length - pre && a[a.length - 1 - suf] === b[b.length - 1 - suf]) suf++;

  const am = a.slice(pre, a.length - suf);
  const bm = b.slice(pre, b.length - suf);
  if ((am.length + 1) * (bm.length + 1) > maxCells) return null;

  const w = bm.length + 1;
  const dp = new Uint16Array((am.length + 1) * w);
  for (let i = am.length - 1; i >= 0; i--) {
    for (let j = bm.length - 1; j >= 0; j--) {
      dp[i * w + j] = am[i] === bm[j] ? dp[(i + 1) * w + j + 1] + 1 : Math.max(dp[(i + 1) * w + j], dp[i * w + j + 1]);
    }
  }

  const rows: DiffRow[] = [];
  for (let i = 0; i < pre; i++) rows.push({ kind: "same", left: { n: i + 1, text: a[i] }, right: { n: i + 1, text: b[i] } });

  let i = 0;
  let j = 0;
  const dels: DiffRow["left"][] = [];
  const adds: DiffRow["right"][] = [];
  const flush = () => {
    const n = Math.max(dels.length, adds.length);
    for (let k = 0; k < n; k++) {
      const l = dels[k];
      const r = adds[k];
      rows.push({ kind: l && r ? "mod" : l ? "del" : "add", left: l, right: r });
    }
    dels.length = 0;
    adds.length = 0;
  };
  while (i < am.length || j < bm.length) {
    if (i < am.length && j < bm.length && am[i] === bm[j]) {
      flush();
      rows.push({
        kind: "same",
        left: { n: pre + i + 1, text: am[i] },
        right: { n: pre + j + 1, text: bm[j] },
      });
      i++;
      j++;
    } else if (j >= bm.length || (i < am.length && dp[(i + 1) * w + j] >= dp[i * w + j + 1])) {
      dels.push({ n: pre + i + 1, text: am[i] });
      i++;
    } else {
      adds.push({ n: pre + j + 1, text: bm[j] });
      j++;
    }
  }
  flush();

  for (let k = 0; k < suf; k++) {
    const li = a.length - suf + k;
    const ri = b.length - suf + k;
    rows.push({ kind: "same", left: { n: li + 1, text: a[li] }, right: { n: ri + 1, text: b[ri] } });
  }
  return rows;
}
