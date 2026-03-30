"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Camera,
  Film,
  Gamepad2,
  Mountain,
  Printer,
  Video,
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Hobby = {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  icon: React.ElementType;
  gradient: string;
  featured?: boolean;
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const HOBBIES: Hobby[] = [
  {
    id: "photography",
    title: "Photography",
    category: "Visual Arts",
    description:
      "Capturing light, emotion, and the unseen stories hidden in everyday moments — one frame at a time.",
    image: "/hobbies/photography.jpg",
    icon: Camera,
    gradient:
      "linear-gradient(135deg, #0f172a 0%, #0c4a6e 50%, #1e1b4b 100%)",
    featured: true,
  },
  {
    id: "3d-printing",
    title: "3D Printing",
    category: "Fabrication",
    description: "Turning digital blueprints into tangible objects layer by layer.",
    image: "/hobbies/3d-printing.jpg",
    icon: Printer,
    gradient:
      "linear-gradient(135deg, #1c1917 0%, #7c2d12 60%, #431407 100%)",
  },
  {
    id: "drone-videography",
    title: "Drone Videography",
    category: "Aerial Media",
    description: "Aerial perspectives that reframe how we see the landscape below.",
    image: "/hobbies/drone.jpg",
    icon: Video,
    gradient:
      "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0d1b35 100%)",
  },
  {
    id: "multimedia-editing",
    title: "Multimedia Editing",
    category: "Post Production",
    description: "Weaving footage, music, and motion into compelling visual stories.",
    image: "/hobbies/multimedia.jpg",
    icon: Film,
    gradient:
      "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 60%, #831843 100%)",
  },
  {
    id: "travel",
    title: "Travel & Adventure",
    category: "Exploration",
    description: "Chasing new horizons, cultures, and perspectives across the globe.",
    image: "/hobbies/travel.jpg",
    icon: Mountain,
    gradient:
      "linear-gradient(135deg, #022c22 0%, #0f4c3a 60%, #134e4a 100%)",
  },
  {
    id: "gaming",
    title: "Gaming",
    category: "Interactive",
    description: "Strategy, immersion, and worlds that sharpen problem-solving instincts.",
    image: "/hobbies/gaming.jpg",
    icon: Gamepad2,
    gradient:
      "linear-gradient(135deg, #1a0536 0%, #3b0764 60%, #300a16 100%)",
  },
];

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

// ─── FEATURED CARD ────────────────────────────────────────────────────────────
function FeaturedCard({ hobby }: { hobby: Hobby }) {
  const Icon = hobby.icon;
  return (
    <motion.div
      variants={fadeUp}
      className="relative rounded-[28px] overflow-hidden h-[320px] md:h-[400px] border border-white/10 group cursor-default"
    >
      {/* Background gradient + optional image */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          background: hobby.gradient,
          backgroundImage: `url(${hobby.image}), ${hobby.gradient}`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        whileHover={{ scale: 1.04 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Layered dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

      {/* Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-cyan-500/10 via-transparent to-violet-500/10" />

      {/* Content */}
      <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
            <Icon className="h-3.5 w-3.5 text-white/70" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-white/70 font-medium">
              {hobby.category}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.28em] text-white/30 font-medium">
            Featured
          </span>
        </div>

        {/* Bottom text */}
        <div className="space-y-3">
          <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            {hobby.title}
          </h3>
          <p className="text-slate-300 text-sm md:text-base leading-6 max-w-xl">
            {hobby.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── HOBBY CARD ───────────────────────────────────────────────────────────────
function HobbyCard({ hobby }: { hobby: Hobby }) {
  const Icon = hobby.icon;
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="relative rounded-[24px] overflow-hidden h-[220px] md:h-[240px] border border-white/10 group cursor-default hover:border-white/20 hover:shadow-lg hover:shadow-black/40 transition-all duration-300"
    >
      {/* Background gradient + optional image */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          background: hobby.gradient,
          backgroundImage: `url(${hobby.image}), ${hobby.gradient}`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />

      {/* Subtle glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 bg-gradient-to-t from-white/5 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        {/* Icon badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 backdrop-blur-sm w-fit">
          <Icon className="h-3 w-3 text-white/60" />
          <span className="text-[9px] uppercase tracking-[0.25em] text-white/60 font-medium">
            {hobby.category}
          </span>
        </div>

        {/* Title + description */}
        <div className="space-y-1.5">
          <h4 className="text-lg font-semibold text-white leading-snug">
            {hobby.title}
          </h4>
          <p className="text-slate-400 text-xs leading-5 line-clamp-2">
            {hobby.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── MAIN SECTION ─────────────────────────────────────────────────────────────
export default function HobbySection({ hideHeader = false }: { hideHeader?: boolean }) {
  const featured = HOBBIES.find((h) => h.featured)!;
  const rest = HOBBIES.filter((h) => !h.featured);
  const firstRow = rest.slice(0, 3);
  const secondRow = rest.slice(3);

  return (
    <section id="beyond-work" className="space-y-10">
      {/* Section header — hidden when embedded inside the interests page */}
      {!hideHeader && (
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="space-y-4 max-w-2xl"
        >
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-400/25 bg-pink-400/8 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-pink-300/80">
              <Camera className="h-3 w-3" />
              Beyond Work
            </div>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-bold text-white leading-tight"
          >
            Life beyond the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
              terminal
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-400 text-base leading-7">
            Engineering is craft — so is storytelling through a lens, building
            physical objects from code, and exploring the world for fresh
            perspective.
          </motion.p>
        </motion.div>
      )}

      {/* Cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="space-y-4"
      >
        {/* Featured card */}
        <FeaturedCard hobby={featured} />

        {/* First row: 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {firstRow.map((hobby) => (
            <HobbyCard key={hobby.id} hobby={hobby} />
          ))}
        </div>

        {/* Second row: 2 cards (centered on large screens) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:max-w-[66%] mx-auto">
          {secondRow.map((hobby) => (
            <HobbyCard key={hobby.id} hobby={hobby} />
          ))}
        </div>
      </motion.div>

      {/* Instagram CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex justify-center"
      >
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2.5 rounded-full border border-pink-400/20 bg-pink-400/6 px-6 py-3 text-sm font-medium text-pink-300 hover:bg-pink-400/12 hover:border-pink-400/35 transition-all duration-200 backdrop-blur-sm"
        >
          View Instagram
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </motion.div>
    </section>
  );
}
