import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Binary,
  Braces,
  Clock,
  Database,
  Fingerprint,
  GitCompare,
  KeyRound,
  Link2,
  Palette,
  Regex,
  Sparkles,
  Timer,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Work — Sri Raghavan · Developer Tools",
  description: "Small, fast, private developer tools by Sri Raghavan. Everything runs in your browser.",
};

type Tool = {
  name: string;
  blurb: string;
  icon: LucideIcon;
  href?: string;
  tags: string[];
  accent: string; // tailwind gradient classes
};

const LIVE: Tool[] = [
  {
    name: "JSON Viewer",
    blurb:
      "Explore any JSON as a collapsible tree with a node details panel, key/value search, JSONPath queries, table view and one-click error repair.",
    icon: Braces,
    href: "/work/json-viewer",
    tags: ["Tree", "Search", "JSONPath", "Table"],
    accent: "from-cyan-500 to-violet-500",
  },
  {
    name: "JSON Diff",
    blurb:
      "Compare two JSON documents structurally: every added, removed and changed value by path, a side-by-side view, and an exportable JSON Patch.",
    icon: GitCompare,
    href: "/work/json-diff",
    tags: ["Compare", "Patch", "Side by side"],
    accent: "from-emerald-500 to-cyan-500",
  },
  {
    name: "GUID / UUID Generator",
    blurb:
      "Bulk-generate v4, time-ordered v7 and name-based v5 GUIDs in .NET, SQL, Base64 and JSON formats, and inspect any GUID.",
    icon: Fingerprint,
    href: "/work/guid-generator",
    tags: [".NET", "v7", "Bulk"],
    accent: "from-violet-500 to-purple-500",
  },
];

const SOON: Tool[] = [
  {
    name: "JWT Decoder",
    blurb: "Decode headers and claims, check expiry and see which algorithm signed the token.",
    icon: KeyRound,
    tags: ["Auth"],
    accent: "from-amber-500 to-orange-500",
  },
  {
    name: "Base64 & URL Encoder",
    blurb: "Encode and decode Base64, Base64URL and percent-encoding, including files.",
    icon: Binary,
    tags: ["Encode"],
    accent: "from-fuchsia-500 to-violet-500",
  },
  {
    name: "Regex Tester",
    blurb: "Live match highlighting, capture groups and a plain-English explanation of your pattern.",
    icon: Regex,
    tags: ["Text"],
    accent: "from-pink-500 to-rose-500",
  },
  {
    name: "Timestamp Converter",
    blurb: "Unix seconds and milliseconds to readable dates across time zones, and back.",
    icon: Clock,
    tags: ["Time"],
    accent: "from-sky-500 to-indigo-500",
  },
  {
    name: "Colour Converter",
    blurb: "HEX, RGB, HSL and OKLCH in one place, with contrast ratios for accessibility.",
    icon: Palette,
    tags: ["Design"],
    accent: "from-orange-500 to-pink-500",
  },
  {
    name: "Link & Query Builder",
    blurb: "Break URLs into parts, edit query strings visually and copy the result.",
    icon: Link2,
    tags: ["Web"],
    accent: "from-teal-500 to-emerald-500",
  },
  {
    name: "Cron Expression Explainer",
    blurb: "Turn cron strings into plain English and preview the next run times.",
    icon: Timer,
    tags: ["DevOps"],
    accent: "from-indigo-500 to-sky-500",
  },
  {
    name: "SQL Formatter",
    blurb: "Tidy up long queries with consistent casing and indentation across dialects.",
    icon: Database,
    tags: ["SQL"],
    accent: "from-cyan-500 to-blue-500",
  },
];

function LiveCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <Link
      href={tool.href!}
      className="group relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_20px_60px_-20px_rgba(34,211,238,0.35)]"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 blur-3xl transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.accent} text-white shadow-lg`}>
          <Icon className="h-6 w-6" />
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live
        </span>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-white">{tool.name}</h3>
        <p className="text-sm leading-6 text-slate-400">{tool.blurb}</p>
      </div>
      <div className="mt-auto flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {tool.tags.map((t) => (
            <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-300">
              {t}
            </span>
          ))}
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all group-hover:bg-cyan-400 group-hover:text-slate-950">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function SoonCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <div className="relative flex flex-col gap-4 rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 opacity-80">
      <div className="flex items-start justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tool.accent} text-white opacity-60`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-400">
          Coming soon
        </span>
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold tracking-tight text-slate-200">{tool.name}</h3>
        <p className="text-sm leading-6 text-slate-500">{tool.blurb}</p>
      </div>
      <div className="mt-auto flex flex-wrap gap-1.5">
        {tool.tags.map((t) => (
          <span key={t} className="rounded-full border border-white/[0.07] px-2.5 py-0.5 text-[11px] text-slate-500">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function WorkPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030711] text-white">
      {/* background glow + grid, matching the portfolio */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-60 left-1/4 h-[700px] w-[700px] rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-20 h-[600px] w-[600px] rounded-full bg-cyan-600/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-8 md:px-10">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[13px] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Portfolio
          </Link>
          <span className="text-sm font-semibold tracking-tight text-slate-300">Sri Raghavan</span>
        </nav>

        <header className="max-w-3xl pb-14 pt-16 md:pt-24">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-cyan-400/50" />
            <span className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-400/80">Work · Developer tools</span>
          </div>
          <h1 className="text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-tight">
            Small tools,{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">built properly.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
            A growing collection of utilities I wanted for my own day-to-day engineering work. They&apos;re fast, free,
            and everything runs in your browser — your data never leaves your machine.
          </p>
        </header>

        <section aria-labelledby="live-tools">
          <h2 id="live-tools" className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Available now
          </h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {LIVE.map((t) => (
              <LiveCard key={t.name} tool={t} />
            ))}
          </div>
        </section>

        <section className="mt-16" aria-labelledby="soon-tools">
          <div className="mb-5 flex items-center gap-3">
            <h2 id="soon-tools" className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              On the roadmap
            </h2>
            <Sparkles className="h-3.5 w-3.5 text-slate-600" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SOON.map((t) => (
              <SoonCard key={t.name} tool={t} />
            ))}
          </div>
        </section>

        <footer className="mt-20 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center">
          <p>Have a tool you&apos;d like to see? I&apos;m always collecting ideas.</p>
          <Link href="/#contact" className="inline-flex items-center gap-1.5 text-cyan-300 hover:underline">
            Suggest a tool <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </footer>
      </div>
    </main>
  );
}
