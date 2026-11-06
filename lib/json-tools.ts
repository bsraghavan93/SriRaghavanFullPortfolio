// Pure helpers for the JSON viewer (no React). Everything runs in the browser.

export type JsonType = "object" | "array" | "string" | "number" | "boolean" | "null";
export type Seg = string | number;

export type ParseResult =
  | { ok: true; value: unknown }
  | { ok: false; message: string; line: number; col: number; pos: number };

export function typeOf(v: unknown): JsonType {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  switch (typeof v) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    default:
      return "object";
  }
}

export const isContainer = (v: unknown): v is Record<string, unknown> | unknown[] =>
  typeof v === "object" && v !== null;

export function childrenOf(v: unknown): [Seg, unknown][] {
  if (Array.isArray(v)) return v.map((x, i) => [i, x] as [Seg, unknown]);
  if (isContainer(v)) return Object.entries(v);
  return [];
}

export const childCount = (v: unknown) =>
  Array.isArray(v) ? v.length : isContainer(v) ? Object.keys(v).length : 0;

// ─── Paths ────────────────────────────────────────────────────────────────────
const IDENT = /^[A-Za-z_$][\w$]*$/;

export function segToken(seg: Seg): string {
  if (typeof seg === "number") return `[${seg}]`;
  return IDENT.test(seg) ? `.${seg}` : `[${JSON.stringify(seg)}]`;
}

/** JSONPath-style id, e.g. $.users[0]["first name"]. Root is "$". */
export const pathToId = (segs: Seg[]) => segs.reduce<string>((acc, s) => acc + segToken(s), "$");

/** JS accessor, e.g. data.users[0]["first name"] */
export const pathToJs = (segs: Seg[], root = "data") =>
  segs.reduce<string>((acc, s) => acc + segToken(s), root);

export function getAt(root: unknown, segs: Seg[]): { found: boolean; value: unknown } {
  let cur: unknown = root;
  for (const s of segs) {
    if (!isContainer(cur) || !(s in (cur as object))) return { found: false, value: undefined };
    cur = (cur as Record<string | number, unknown>)[s];
  }
  return { found: true, value: cur };
}

export function ancestorIds(segs: Seg[]): string[] {
  const ids = ["$"];
  let id = "$";
  for (let i = 0; i < segs.length - 1; i++) {
    id += segToken(segs[i]);
    ids.push(id);
  }
  return ids;
}

// ─── Parsing & repair ─────────────────────────────────────────────────────────
function lineCol(text: string, pos: number) {
  let line = 1;
  let last = -1;
  for (let i = 0; i < pos && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) {
      line++;
      last = i;
    }
  }
  return { line, col: pos - last };
}

export function parseJson(text: string): ParseResult {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    let pos = 0;
    const byPos = /position (\d+)/.exec(message);
    const byLine = /line (\d+) column (\d+)/.exec(message);
    if (byPos) pos = Number(byPos[1]);
    else if (byLine) {
      const lines = text.split("\n");
      const ln = Number(byLine[1]);
      pos = lines.slice(0, ln - 1).reduce((a, l) => a + l.length + 1, 0) + Number(byLine[2]) - 1;
    } else if (/end of JSON|Unexpected end/i.test(message)) pos = text.length;
    const { line, col } = lineCol(text, pos);
    return { ok: false, message, line, col, pos };
  }
}

/** Best-effort fix for JSON-ish input: comments, trailing commas, single quotes, bare keys, Python literals. */
export function repairJson(input: string): string {
  let out = "";
  let i = 0;
  const n = input.length;
  while (i < n) {
    const c = input[i];
    if (c === '"' || c === "'") {
      const q = c;
      let j = i + 1;
      let s = "";
      while (j < n && input[j] !== q) {
        if (input[j] === "\\") {
          s += input[j] + (input[j + 1] ?? "");
          j += 2;
        } else {
          s += input[j];
          j++;
        }
      }
      if (q === "'") s = s.replace(/\\'/g, "'").replace(/"/g, '\\"');
      out += `"${s}"`;
      i = j + 1;
      continue;
    }
    if (c === "/" && input[i + 1] === "/") {
      while (i < n && input[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && input[i + 1] === "*") {
      i += 2;
      while (i < n && !(input[i] === "*" && input[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    if (c === ",") {
      let j = i + 1;
      while (j < n && /\s/.test(input[j])) j++;
      if (input[j] === "}" || input[j] === "]") {
        i++;
        continue;
      }
    }
    if (/[A-Za-z_$]/.test(c)) {
      let j = i;
      while (j < n && /[\w$]/.test(input[j])) j++;
      const word = input.slice(i, j);
      let k = j;
      while (k < n && /\s/.test(input[k])) k++;
      if (input[k] === ":") out += `"${word}"`;
      else if (word === "None" || word === "undefined" || word === "NaN") out += "null";
      else if (word === "True") out += "true";
      else if (word === "False") out += "false";
      else out += word;
      i = j;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

export function sortKeysDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeysDeep);
  if (isContainer(v)) {
    const o: Record<string, unknown> = {};
    for (const k of Object.keys(v).sort((a, b) => a.localeCompare(b))) {
      o[k] = sortKeysDeep((v as Record<string, unknown>)[k]);
    }
    return o;
  }
  return v;
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export type Stats = {
  nodes: number;
  containers: number;
  maxDepth: number;
  types: Record<JsonType, number>;
};

export function computeStats(root: unknown): Stats {
  const stats: Stats = {
    nodes: 0,
    containers: 0,
    maxDepth: 0,
    types: { object: 0, array: 0, string: 0, number: 0, boolean: 0, null: 0 },
  };
  const walk = (v: unknown, depth: number) => {
    stats.nodes++;
    stats.types[typeOf(v)]++;
    if (depth > stats.maxDepth) stats.maxDepth = depth;
    if (isContainer(v)) {
      stats.containers++;
      for (const [, c] of childrenOf(v)) walk(c, depth + 1);
    }
  };
  walk(root, 0);
  return stats;
}

export const byteSize = (v: unknown): number => {
  try {
    const s = JSON.stringify(v);
    return s === undefined ? 0 : new TextEncoder().encode(s).length;
  } catch {
    return 0;
  }
};

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

// ─── Visible rows (flattened tree) ────────────────────────────────────────────
export type Row = {
  id: string;
  segs: Seg[];
  keyLabel: Seg | null;
  depth: number;
  value: unknown;
  type: JsonType;
  count: number;
  expanded: boolean;
};

export function buildRows(root: unknown, expanded: Set<string>): Row[] {
  const rows: Row[] = [];
  const walk = (value: unknown, segs: Seg[], id: string, keyLabel: Seg | null, depth: number) => {
    const container = isContainer(value);
    const isOpen = container && expanded.has(id);
    rows.push({
      id,
      segs,
      keyLabel,
      depth,
      value,
      type: typeOf(value),
      count: container ? childCount(value) : 0,
      expanded: isOpen,
    });
    if (isOpen) {
      for (const [k, v] of childrenOf(value)) walk(v, [...segs, k], id + segToken(k), k, depth + 1);
    }
  };
  walk(root, [], "$", null, 0);
  return rows;
}

/** Ids of every container down to `maxDepth` (root is depth 0). Capped to keep huge docs responsive. */
export function containerIds(root: unknown, maxDepth = Infinity, cap = 200_000): Set<string> {
  const ids = new Set<string>();
  const walk = (v: unknown, id: string, depth: number) => {
    if (!isContainer(v) || ids.size >= cap) return;
    ids.add(id);
    if (depth >= maxDepth) return;
    for (const [k, c] of childrenOf(v)) walk(c, id + segToken(k), depth + 1);
  };
  walk(root, "$", 0);
  return ids;
}

// ─── Search ───────────────────────────────────────────────────────────────────
export type SearchMode = "all" | "keys" | "values";
export type SearchOpts = { query: string; mode: SearchMode; caseSensitive: boolean; regex: boolean };
export type Match = { id: string; segs: Seg[]; where: "key" | "value" | "path" };

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Global regex used both for matching and for highlighting text in rows. */
export function buildMatcher(o: SearchOpts): { re: RegExp | null; error?: string } {
  if (!o.query) return { re: null };
  try {
    const src = o.regex ? o.query : escapeRe(o.query);
    return { re: new RegExp(src, o.caseSensitive ? "g" : "gi") };
  } catch (e) {
    return { re: null, error: e instanceof Error ? e.message : "Invalid regex" };
  }
}

export const testRe = (re: RegExp, s: string) => {
  re.lastIndex = 0;
  return re.test(s);
};

export function searchTree(
  root: unknown,
  opts: SearchOpts,
  limit = 5000,
): { matches: Match[]; error?: string; truncated: boolean } {
  const q = opts.query.trim();
  if (!q) return { matches: [], truncated: false };

  if (q.startsWith("$")) {
    const res = queryPath(root, q, limit);
    if (res.error) return { matches: [], error: res.error, truncated: false };
    return {
      matches: res.results.map((r) => ({ id: pathToId(r.segs), segs: r.segs, where: "path" as const })),
      truncated: res.results.length >= limit,
    };
  }

  const { re, error } = buildMatcher({ ...opts, query: q });
  if (!re) return { matches: [], error, truncated: false };

  const matches: Match[] = [];
  let truncated = false;
  const walk = (v: unknown, segs: Seg[], id: string, key: Seg | null) => {
    if (truncated) return;
    if (key !== null && typeof key === "string" && opts.mode !== "values" && testRe(re, key)) {
      matches.push({ id, segs, where: "key" });
    }
    if (isContainer(v)) {
      for (const [k, c] of childrenOf(v)) {
        walk(c, [...segs, k], id + segToken(k), k);
        if (truncated) return;
      }
    } else if (opts.mode !== "keys" && testRe(re, String(v))) {
      matches.push({ id, segs, where: "value" });
    }
    if (matches.length >= limit) truncated = true;
  };
  walk(root, [], "$", null);
  return { matches, truncated };
}

// ─── JSONPath-ish queries ($.a[*].b, $..name, $["x y"][0]) ────────────────────
type Tok = { k: "key"; v: string } | { k: "idx"; v: number } | { k: "wild" } | { k: "desc"; v: string };

export function parsePath(expr: string): Tok[] | null {
  const s = expr.trim();
  if (!s.startsWith("$")) return null;
  const toks: Tok[] = [];
  let i = 1;
  const readIdent = () => {
    let j = i;
    while (j < s.length && s[j] !== "." && s[j] !== "[") j++;
    const name = s.slice(i, j);
    i = j;
    return name;
  };
  while (i < s.length) {
    if (s.startsWith("..", i)) {
      i += 2;
      if (s[i] === "*") {
        toks.push({ k: "desc", v: "*" });
        i++;
      } else {
        const name = readIdent();
        if (!name) return null;
        toks.push({ k: "desc", v: name });
      }
    } else if (s[i] === ".") {
      i++;
      if (s[i] === "*") {
        toks.push({ k: "wild" });
        i++;
      } else {
        const name = readIdent();
        if (!name) return null;
        toks.push({ k: "key", v: name });
      }
    } else if (s[i] === "[") {
      const q = s[i + 1];
      if (q === '"' || q === "'") {
        const end = s.indexOf(q + "]", i + 2);
        if (end < 0) return null;
        toks.push({ k: "key", v: s.slice(i + 2, end).replace(/\\(.)/g, "$1") });
        i = end + 2;
      } else {
        const end = s.indexOf("]", i);
        if (end < 0) return null;
        const inner = s.slice(i + 1, end).trim();
        if (inner === "*") toks.push({ k: "wild" });
        else if (/^\d+$/.test(inner)) toks.push({ k: "idx", v: Number(inner) });
        else return null;
        i = end + 1;
      }
    } else return null;
  }
  return toks;
}

export function queryPath(
  root: unknown,
  expr: string,
  limit = 5000,
): { results: { segs: Seg[]; value: unknown }[]; error?: string } {
  const toks = parsePath(expr);
  if (!toks) return { results: [], error: "Invalid path — try $.users[0].name or $..email" };

  let frontier: { segs: Seg[]; value: unknown }[] = [{ segs: [], value: root }];
  for (const t of toks) {
    const next: { segs: Seg[]; value: unknown }[] = [];
    for (const node of frontier) {
      if (next.length >= limit) break;
      if (t.k === "key") {
        if (isContainer(node.value) && !Array.isArray(node.value) && t.v in node.value)
          next.push({ segs: [...node.segs, t.v], value: (node.value as Record<string, unknown>)[t.v] });
      } else if (t.k === "idx") {
        if (Array.isArray(node.value) && t.v < node.value.length)
          next.push({ segs: [...node.segs, t.v], value: node.value[t.v] });
      } else if (t.k === "wild") {
        for (const [k, v] of childrenOf(node.value)) next.push({ segs: [...node.segs, k], value: v });
      } else {
        const visit = (v: unknown, segs: Seg[]) => {
          if (next.length >= limit || !isContainer(v)) return;
          for (const [k, c] of childrenOf(v)) {
            if (t.v === "*" || k === t.v) next.push({ segs: [...segs, k], value: c });
            visit(c, [...segs, k]);
          }
        };
        visit(node.value, node.segs);
      }
    }
    frontier = next;
  }
  return { results: frontier.slice(0, limit) };
}

// ─── Table view ───────────────────────────────────────────────────────────────
export function isTabular(v: unknown): v is Record<string, unknown>[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.slice(0, 50).every((x) => isContainer(x) && !Array.isArray(x))
  );
}

export function tableColumns(rows: Record<string, unknown>[], maxCols = 40): string[] {
  const cols: string[] = [];
  const seen = new Set<string>();
  for (const r of rows.slice(0, 300)) {
    for (const k of Object.keys(r)) {
      if (!seen.has(k)) {
        seen.add(k);
        cols.push(k);
        if (cols.length >= maxCols) return cols;
      }
    }
  }
  return cols;
}

export function cellText(v: unknown): string {
  if (v === undefined) return "";
  if (isContainer(v)) return JSON.stringify(v);
  return String(v);
}

export function toCsv(rows: Record<string, unknown>[], cols: string[]): string {
  const esc = (s: string) => (/[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  return [cols.map(esc).join(","), ...rows.map((r) => cols.map((c) => esc(cellText(r[c]))).join(","))].join("\n");
}

// ─── Display helpers ──────────────────────────────────────────────────────────
export function previewValue(v: unknown, max = 120): string {
  switch (typeOf(v)) {
    case "string": {
      const s = v as string;
      return JSON.stringify(s.length > max ? s.slice(0, max) + "…" : s);
    }
    case "object":
      return `{ ${childCount(v)} ${childCount(v) === 1 ? "key" : "keys"} }`;
    case "array":
      return `[ ${childCount(v)} ${childCount(v) === 1 ? "item" : "items"} ]`;
    default:
      return String(v);
  }
}

export const SAMPLE_JSON = {
  name: "Sri Raghavan",
  tagline: "Maker by habit",
  active: true,
  yearsPrinting: 4,
  website: "https://sriraghavan.dev",
  startedAt: "2022-03-14T18:30:00Z",
  accent: "#22d3ee",
  hobbies: {
    making: ["3D printing", "PC building", "Tinkering"],
    play: ["PC gaming", "Co-op nights", "Retro consoles"],
    outdoors: { flying: ["Drone"], camera: "Mirrorless", favouriteLight: "Golden hour", travelBucketList: null },
  },
  prints: [
    { id: 1, name: "Cable organiser", filament: "PLA", hours: 2.5, tags: ["desk", "useful"] },
    { id: 2, name: "Dragon, articulated", filament: "PETG", hours: 11, tags: ["fun", "showpiece"] },
    { id: 3, name: "Controller stand", filament: "PLA", hours: 4.25, tags: ["gaming", "desk"] },
  ],
  embedded: '{"note":"This string is itself JSON","ok":true}',
};
