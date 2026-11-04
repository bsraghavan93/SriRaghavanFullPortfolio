import type { Metadata } from "next";
import HomeVideo from "@/components/HomeVideo";

const INTRO_1 = "Engineer by trade, maker by habit.";
const INTRO_2 =
  "I build software, 3D-print things I probably don't need, play too many games, and keep collecting small ideas worth turning into tools.";

export const metadata: Metadata = {
  title: "Sri Raghavan | Software Engineer",
  description: `${INTRO_1} ${INTRO_2}`,
};

const fade = (i: number) => ({ "--i": i }) as React.CSSProperties;

export default function Home() {
  return (
    <main className="fixed inset-0 h-dvh overflow-hidden bg-[#05060f] text-white">
      <HomeVideo />

      {/* legibility overlay: vertical on mobile, horizontal on desktop */}
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(180deg,#05060f_0%,rgba(5,6,15,0.85)_35%,rgba(5,6,15,0)_60%)] min-[900px]:bg-[linear-gradient(90deg,#05060f_0%,rgba(5,6,15,0.9)_38%,rgba(5,6,15,0)_66%)]" />

      <div className="relative z-[2] flex h-dvh flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] min-[900px]:w-[38vw] min-[900px]:min-w-[320px] min-[900px]:max-w-[560px] min-[900px]:justify-center min-[900px]:py-0 min-[900px]:pl-[clamp(24px,6vw,96px)] min-[900px]:pr-0">
        <p
          className="intro-fade text-[0.7rem] font-medium uppercase tracking-[0.3em] text-cyan-400/90"
          style={fade(0)}
        >
          Hello, I&apos;m
        </p>
        <h1
          className="intro-fade mt-3 text-[clamp(2.2rem,11vw,2.8rem)] font-bold leading-none tracking-tight whitespace-nowrap min-[900px]:text-[clamp(2.5rem,4.6vw,5rem)]"
          style={fade(1)}
        >
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
            Sri Raghavan
          </span>
        </h1>
        <p
          className="intro-fade mt-4 max-w-[34ch] text-[clamp(0.9rem,3.8vw,1rem)] leading-relaxed text-slate-400 min-[900px]:mt-6 min-[900px]:text-[clamp(0.95rem,1.3vw,1.15rem)]"
          style={fade(2)}
        >
          {INTRO_1}
          <span className="[@media(max-height:700px)]:hidden"> {INTRO_2}</span>
        </p>

        <dl className="intro-fade mt-5 flex select-text flex-col gap-2 min-[900px]:mt-8" style={fade(3)}>
          <div>
            <dt className="text-[0.7rem] uppercase tracking-wider text-slate-500">Phone</dt>
            <dd className="text-base text-white">415 373 8202</dd>
          </div>
          <div>
            <dt className="text-[0.7rem] uppercase tracking-wider text-slate-500">Email</dt>
            <dd className="text-base text-white">bsraghavan93@gmail.com</dd>
          </div>
        </dl>

        <a
          href="/work"
          className="intro-fade group mt-5 w-fit text-sm text-slate-500 transition-colors hover:text-slate-300 min-[900px]:mt-8"
          style={fade(4)}
        >
          <span className="group-hover:underline">Take a look at my work</span>
          <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
        </a>
      </div>
    </main>
  );
}
