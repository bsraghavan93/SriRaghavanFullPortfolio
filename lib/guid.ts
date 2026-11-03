// UUID / GUID generation, formatting and inspection. Browser crypto only.

export type GuidVersion = "v4" | "v7" | "v5" | "nil" | "max";
export type GuidFormat =
  | "standard"
  | "upper"
  | "compact"
  | "braces"
  | "parens"
  | "urn"
  | "base64"
  | "base64url"
  | "csharp"
  | "sql"
  | "js";

export const FORMAT_LABELS: Record<GuidFormat, string> = {
  standard: "Standard (lowercase)",
  upper: "UPPERCASE",
  compact: "No hyphens",
  braces: "{Braces}",
  parens: "(Parentheses)",
  urn: "URN (urn:uuid:…)",
  base64: "Base64",
  base64url: "Base64URL (22 chars)",
  csharp: 'C#  Guid.Parse("…")',
  sql: "SQL  '…'",
  js: 'JS / JSON  "…"',
};

const HEX = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));

export function bytesToUuid(b: Uint8Array): string {
  const h = Array.from(b, (x) => HEX[x]);
  return `${h.slice(0, 4).join("")}-${h.slice(4, 6).join("")}-${h.slice(6, 8).join("")}-${h.slice(8, 10).join("")}-${h.slice(10, 16).join("")}`;
}

export function uuidToBytes(uuid: string): Uint8Array | null {
  const hex = normalise(uuid);
  if (!hex) return null;
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

/** Accepts any common GUID spelling and returns 32 lowercase hex chars, or null. */
export function normalise(input: string): string | null {
  let s = input.trim();
  s = s.replace(/^urn:uuid:/i, "").replace(/^[{(]/, "").replace(/[})]$/, "");
  s = s.replace(/-/g, "");
  return /^[0-9a-fA-F]{32}$/.test(s) ? s.toLowerCase() : null;
}

export function randomUuidV4(): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  return bytesToUuid(b);
}

/** Time-ordered UUIDv7 values; monotonic within a batch so they sort in creation order. */
export function uuidV7Batch(count: number): string[] {
  const out: string[] = [];
  let ms = Date.now();
  let seq = crypto.getRandomValues(new Uint16Array(1))[0] & 0x7ff; // leave headroom so the 12-bit counter doesn't overflow
  for (let i = 0; i < count; i++) {
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[0] = Math.floor(ms / 2 ** 40) & 0xff;
    b[1] = Math.floor(ms / 2 ** 32) & 0xff;
    b[2] = Math.floor(ms / 2 ** 24) & 0xff;
    b[3] = Math.floor(ms / 2 ** 16) & 0xff;
    b[4] = Math.floor(ms / 2 ** 8) & 0xff;
    b[5] = ms & 0xff;
    b[6] = 0x70 | ((seq >> 8) & 0x0f);
    b[7] = seq & 0xff;
    b[8] = (b[8] & 0x3f) | 0x80;
    out.push(bytesToUuid(b));
    seq++;
    if (seq > 0xfff) {
      seq = 0;
      ms++;
    }
  }
  return out;
}

export const NAMESPACES = {
  DNS: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  URL: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
  OID: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
  X500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
} as const;

export async function uuidV5(namespace: string, name: string): Promise<string | null> {
  const ns = uuidToBytes(namespace);
  if (!ns) return null;
  const nameBytes = new TextEncoder().encode(name);
  const data = new Uint8Array(ns.length + nameBytes.length);
  data.set(ns);
  data.set(nameBytes, ns.length);
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-1", data)).slice(0, 16);
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  return bytesToUuid(hash);
}

const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));

export function formatUuid(uuid: string, fmt: GuidFormat): string {
  switch (fmt) {
    case "standard":
      return uuid.toLowerCase();
    case "upper":
      return uuid.toUpperCase();
    case "compact":
      return uuid.replace(/-/g, "");
    case "braces":
      return `{${uuid}}`;
    case "parens":
      return `(${uuid})`;
    case "urn":
      return `urn:uuid:${uuid}`;
    case "base64":
      return b64(uuidToBytes(uuid)!);
    case "base64url":
      return b64(uuidToBytes(uuid)!).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    case "csharp":
      return `Guid.Parse("${uuid}")`;
    case "sql":
      return `'${uuid.toUpperCase()}'`;
    case "js":
      return `"${uuid}"`;
  }
}

// ─── Inspect ──────────────────────────────────────────────────────────────────
export type GuidInfo = {
  canonical: string;
  version: number | null;
  variant: string;
  timestamp: Date | null;
  note: string;
};

export function inspectUuid(input: string): GuidInfo | null {
  const hex = normalise(input);
  if (!hex) return null;
  const canonical = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  if (hex === "0".repeat(32)) return { canonical, version: null, variant: "Nil", timestamp: null, note: "The nil UUID (all zeros)." };
  if (hex === "f".repeat(32)) return { canonical, version: null, variant: "Max", timestamp: null, note: "The max UUID (all ones)." };

  const version = parseInt(hex[12], 16);
  const v = parseInt(hex[16], 16);
  const variant =
    (v & 0x8) === 0 ? "NCS (reserved)" : (v & 0xc) === 0x8 ? "RFC 4122 / 9562" : (v & 0xe) === 0xc ? "Microsoft (reserved)" : "Future (reserved)";

  let timestamp: Date | null = null;
  let note = "";
  if (version === 7) {
    timestamp = new Date(parseInt(hex.slice(0, 12), 16));
    note = "Time-ordered: the first 48 bits are a Unix timestamp in milliseconds.";
  } else if (version === 1) {
    const timeHex = hex.slice(13, 16) + hex.slice(8, 12) + hex.slice(0, 8);
    const gregorian100ns = BigInt("0x" + timeHex);
    const ms = Number((gregorian100ns - BigInt("122192928000000000")) / BigInt(10000));
    timestamp = new Date(ms);
    note = "Time-based (v1): timestamp plus node identifier.";
  } else if (version === 4) note = "Randomly generated.";
  else if (version === 5) note = "Name-based (SHA-1) — the same namespace and name always give the same UUID.";
  else if (version === 3) note = "Name-based (MD5).";
  else if (version === 6) note = "Reordered time-based (v6).";
  else if (version === 8) note = "Custom / vendor-specific (v8).";
  return { canonical, version, variant, timestamp, note };
}
