import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Briefcase, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Sri Raghavan",
  description:
    "Sri Raghavan: engineer, maker, gamer and perpetual tinkerer. Portfolio, interests and small browser tools.",
};

const LINKS = [
  {
    href: "/portfolio",
    label: "Portfolio",
    note: "Work, experience & interests",
    icon: Briefcase,
  },
  {
    href: "/work",
    label: "Tools",
    note: "Small tools that run in your browser",
    icon: Wrench,
  },
];

const SOCIAL = [
  { href: "https://github.com/bsraghavan93", label: "GitHub" },
  { href: "mailto:raghavbala35@gmail.com", label: "Email" },
];

export default function Home() {
  return (
    <main className="relative flex h-svh w-full items-center justify-center overflow-hidden bg-[#030711] px-6 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute -bottom-40 right-1/4 h-[500px] w-[500px] rounded-full bg-cyan-600/15 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="relative flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-cyan-400/80">Hello, I&apos;m</p>
        <h1 className="text-[clamp(2.8rem,10vw,5.5rem)] font-bold leading-none tracking-tight">
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
            Sri Raghavan
          </span>
        </h1>
        <p className="max-w-lg text-base leading-7 text-slate-400 md:text-lg">
          Engineer by trade, maker by habit. I build software, 3D-print things I probably don&apos;t need, play too
          many games, and keep collecting small ideas worth turning into tools.
        </p>

        <div className="grid w-full gap-3 sm:grid-cols-2">
          {LINKS.map(({ href, label, note, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/[0.07]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{label}</span>
                <span className="block truncate text-xs text-slate-400">{note}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-500 transition-colors group-hover:text-cyan-300" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {SOCIAL.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[13px] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
