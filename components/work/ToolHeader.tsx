import Link from "next/link";
import { ArrowLeft, ShieldCheck, type LucideIcon } from "lucide-react";

export default function ToolHeader({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#070b16] px-3 py-2.5 md:px-4">
      <Link
        href="/work"
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Work
      </Link>
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 text-white">
          <Icon className="h-4 w-4" />
        </span>
        <h1 className="text-sm font-semibold tracking-tight text-white">{title}</h1>
      </div>
      <span className="ml-1 hidden items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-300 sm:inline-flex">
        <ShieldCheck className="h-3 w-3" /> Runs in your browser · nothing is uploaded
      </span>
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </header>
  );
}
