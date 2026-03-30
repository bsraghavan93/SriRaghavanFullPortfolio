"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, type TargetAndTransition } from "framer-motion";
import {
  ArrowUpRight,
  Camera,
  Film,
  Gamepad2,
  Printer,
  Video,
  X,
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type HobbyId =
  | "photography"
  | "3d-printing"
  | "drone-videography"
  | "multimedia-editing"
  | "gaming";

type Hobby = {
  id: HobbyId;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  image: string;
  icon: React.ElementType;
  gradient: string;
  accentHex: string;
  featured?: boolean;
  link?: string;
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const HOBBIES: Hobby[] = [
  {
    id: "photography",
    title: "Photography",
    category: "Visual Storytelling",
    description:
      "Capturing light, emotion, and unseen stories hidden in everyday moments — one frame at a time.",
    longDescription:
      "Photography is my window into patience and perspective. From golden-hour landscapes to candid street scenes, I chase the fleeting intersections of light, shadow, and emotion that most eyes pass over. Every frame is a deliberate choice — a frozen decision about what matters, and why.",
    image: "/hobbies/photography.jpg",
    icon: Camera,
    gradient: "linear-gradient(145deg, #040c1a 0%, #0a3050 45%, #160e30 100%)",
    accentHex: "#22d3ee",
    featured: true,
    link: "https://www.instagram.com/exposurechronicles/",
  },
  {
    id: "3d-printing",
    title: "3D Printing",
    category: "Digital Fabrication",
    description:
      "Turning digital blueprints into tangible reality — layer by precise layer.",
    longDescription:
      "There is something uniquely satisfying about watching an idea materialize from nothing. 3D printing sits at the intersection of engineering precision and artistic vision. I design custom mechanical parts, prototypes, and sculptural pieces that blur the line between digital and physical reality.",
    image: "/hobbies/3d-printing.jpg",
    icon: Printer,
    gradient: "linear-gradient(145deg, #120a04 0%, #3d1505 45%, #6b2008 100%)",
    accentHex: "#fb923c",
  },
  {
    id: "drone-videography",
    title: "Drone Videography",
    category: "Aerial Cinema",
    description:
      "Aerial perspectives that reframe the familiar — seeing the world as it rarely shows itself.",
    longDescription:
      "Piloting a drone forces you to think in three dimensions. I pursue cinematic aerial sequences that give familiar places a completely alien beauty — city grids from 400 feet, coastlines unfolding in smooth glides, forests dissolving into pure geometry. The sky is not a limit; it is a canvas.",
    image: "/hobbies/drone.jpg",
    icon: Video,
    gradient: "linear-gradient(145deg, #040c1a 0%, #0b1f38 45%, #0a2848 100%)",
    accentHex: "#38bdf8",
  },
  {
    id: "multimedia-editing",
    title: "Multimedia Editing",
    category: "Post Production",
    description:
      "Weaving footage, sound, and motion into narratives that feel inevitable.",
    longDescription:
      "Editing is where raw footage becomes story. I work across video timelines, color grading, and motion graphics — crafting the rhythm and pacing that makes an audience feel something. The edit is where real filmmaking happens. Precision over excess; every cut earns its place.",
    image: "/hobbies/multimedia.jpg",
    icon: Film,
    gradient: "linear-gradient(145deg, #0e0c26 0%, #2a1060 45%, #4a0e2a 100%)",
    accentHex: "#a78bfa",
  },
  {
    id: "gaming",
    title: "Gaming",
    category: "Interactive Worlds",
    description:
      "Immersive strategy and storytelling that sharpens instincts, creativity, and systems thinking.",
    longDescription:
      "Games are the only medium that places you inside the story. I am drawn to titles with deep systems, moral complexity, and worlds that reward curiosity. Gaming sharpens the same problem-solving and pattern-recognition that makes me a better engineer — and offers perspective from entirely different angles.",
    image: "/hobbies/gaming.jpg",
    icon: Gamepad2,
    gradient: "linear-gradient(145deg, #100320 0%, #230832 45%, #1e051a 100%)",
    accentHex: "#e879f9",
  },
];

// ─── EASING ───────────────────────────────────────────────────────────────────
const EASE_CINEMA = [0.22, 1, 0.36, 1] as const;
const EASE_SHARP = [0.16, 1, 0.3, 1] as const;
const EASE_SPRING = [0.34, 1.4, 0.64, 1] as const;

// ─── SHARED ANIMATION VARIANTS ────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_CINEMA },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── PER-CATEGORY IMAGE HOVER ─────────────────────────────────────────────────
// Each hobby gets a distinct scale/transform personality on the background image
const BG_HOVER: Record<HobbyId, TargetAndTransition> = {
  // Photography: slow, cinematic, breathe-in zoom
  photography: {
    scale: 1.04,
    transition: { duration: 0.9, ease: EASE_CINEMA },
  },
  // 3D Printing: structural, slight perspective tilt
  "3d-printing": {
    scale: 1.06,
    rotateY: 1.5,
    rotateX: -0.8,
    transition: { duration: 0.5, ease: EASE_SHARP },
  },
  // Drone: floats upward, aerial drift
  "drone-videography": {
    scale: 1.05,
    y: -6,
    transition: { duration: 1.0, ease: EASE_CINEMA },
  },
  // Multimedia: crisp, editor-precise
  "multimedia-editing": {
    scale: 1.06,
    transition: { duration: 0.45, ease: EASE_SHARP },
  },
  // Gaming: springy overshoot, energetic
  gaming: {
    scale: 1.08,
    transition: { duration: 0.35, ease: EASE_SPRING },
  },
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
function HobbyModal({
  hobby,
  onClose,
}: {
  hobby: Hobby;
  onClose: () => void;
}) {
  const Icon = hobby.icon;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        aria-modal="true"
        role="dialog"
        aria-label={`${hobby.title} details`}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Card */}
        <motion.div
          className="relative w-full max-w-2xl rounded-[28px] overflow-hidden border border-white/12 shadow-2xl"
          style={{ background: hobby.gradient }}
          initial={{ opacity: 0, scale: 0.92, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.45, ease: EASE_CINEMA }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35"
            style={{ backgroundImage: `url(${hobby.image})` }}
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 to-black/15" />

          {/* Accent glow — top edge */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${hobby.accentHex}70 40%, ${hobby.accentHex}70 60%, transparent 100%)`,
            }}
          />

          {/* Ambient accent */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              background: `radial-gradient(ellipse at 25% 0%, ${hobby.accentHex}60 0%, transparent 55%)`,
            }}
          />

          {/* Close button */}
          <motion.button
            className="absolute top-5 right-5 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 border border-white/12 text-white/60 hover:text-white hover:bg-black/70 hover:border-white/25 transition-all duration-200 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3, ease: EASE_SHARP }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </motion.button>

          {/* Content */}
          <div className="relative px-8 pt-8 pb-9 md:px-10 md:pt-10 md:pb-11 flex flex-col gap-5 min-h-[380px] justify-between">
            {/* Category badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5, ease: EASE_CINEMA }}
            >
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-sm w-fit"
                style={{
                  borderColor: `${hobby.accentHex}35`,
                  background: `${hobby.accentHex}12`,
                }}
              >
                <Icon
                  className="h-3.5 w-3.5"
                  style={{ color: hobby.accentHex }}
                />
                <span
                  className="text-[10px] uppercase tracking-[0.28em] font-medium"
                  style={{ color: `${hobby.accentHex}cc` }}
                >
                  {hobby.category}
                </span>
              </div>
            </motion.div>

            {/* Text block */}
            <div className="space-y-4 mt-auto">
              <motion.h3
                className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.55, ease: EASE_CINEMA }}
              >
                {hobby.title}
              </motion.h3>

              <motion.p
                className="text-slate-300/90 text-sm md:text-base leading-7 max-w-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.55, ease: EASE_CINEMA }}
              >
                {hobby.longDescription}
              </motion.p>

              {hobby.link && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4, ease: EASE_CINEMA }}
                >
                  <a
                    href={hobby.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/15 hover:border-white/25 transition-all duration-200 backdrop-blur-sm"
                  >
                    View on Instagram
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </a>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── FEATURED CARD — Photography ──────────────────────────────────────────────
function FeaturedCard({
  hobby,
  onClick,
}: {
  hobby: Hobby;
  onClick: () => void;
}) {
  const Icon = hobby.icon;

  return (
    <motion.div
      variants={fadeUp}
      onClick={onClick}
      className="relative rounded-[28px] overflow-hidden h-[360px] md:h-[460px] border border-white/8 group cursor-pointer hover:border-white/18 transition-colors duration-500"
      style={{ willChange: "transform" }}
      whileHover={{ y: -4, transition: { duration: 0.4, ease: EASE_CINEMA } }}
    >
      {/* Background */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          background: hobby.gradient,
          backgroundImage: `url(${hobby.image}), ${hobby.gradient}`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        whileHover={BG_HOVER[hobby.id]}
      />

      {/* Base overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/8" />

      {/* Photography identity: warm/cool cinematic wash on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(34,211,238,0.10) 0%, transparent 45%, rgba(139,92,246,0.09) 100%)",
        }}
      />

      {/* Horizontal lens-flare line — cinema identity */}
      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          top: "38%",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.5) 30%, rgba(34,211,238,0.5) 70%, transparent 100%)",
          scaleX: 0,
          originX: 0.5,
        }}
        whileHover={{
          scaleX: 1,
          opacity: [0, 0.8, 0],
          transition: { duration: 1.1, ease: EASE_CINEMA },
        }}
        initial={{ opacity: 0, scaleX: 0 }}
      />

      {/* Accent top-edge glow */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent 5%, ${hobby.accentHex}60 35%, ${hobby.accentHex}60 65%, transparent 95%)`,
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-sm"
            style={{
              borderColor: `${hobby.accentHex}30`,
              background: "rgba(0,0,0,0.35)",
            }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: hobby.accentHex }} />
            <span
              className="text-[10px] uppercase tracking-[0.28em] font-medium"
              style={{ color: `${hobby.accentHex}aa` }}
            >
              {hobby.category}
            </span>
          </div>

          <span className="text-[10px] uppercase tracking-[0.28em] text-white/20 font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
            Featured
          </span>
        </div>

        {/* Bottom */}
        <div className="space-y-4">
          <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
            {hobby.title}
          </h3>
          <p className="text-slate-300/85 text-sm md:text-base leading-7 max-w-xl">
            {hobby.description}
          </p>
          <div className="inline-flex items-center gap-2 text-white/30 group-hover:text-white/75 transition-colors duration-500">
            <span className="text-[11px] tracking-[0.22em] uppercase font-medium">
              Click to explore
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── HOBBY CARD ───────────────────────────────────────────────────────────────
function HobbyCard({
  hobby,
  onClick,
  tall,
}: {
  hobby: Hobby;
  onClick: () => void;
  tall?: boolean;
}) {
  const Icon = hobby.icon;

  return (
    <motion.div
      variants={fadeUp}
      onClick={onClick}
      className={`relative rounded-[22px] overflow-hidden border border-white/8 group cursor-pointer hover:border-white/16 transition-colors duration-300 ${
        tall ? "h-[280px] md:h-[300px]" : "h-[240px] md:h-[260px]"
      }`}
      style={{ willChange: "transform" }}
      whileHover={{ y: -5, transition: { duration: 0.3, ease: EASE_SHARP } }}
    >
      {/* Background */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          background: hobby.gradient,
          backgroundImage: `url(${hobby.image}), ${hobby.gradient}`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        whileHover={BG_HOVER[hobby.id]}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/28 to-black/5" />

      {/* Per-category identity layers */}

      {/* 3D Printing: technical grid overlay */}
      {hobby.id === "3d-printing" && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${hobby.accentHex}09 1px, transparent 1px), linear-gradient(90deg, ${hobby.accentHex}09 1px, transparent 1px)`,
            backgroundSize: "22px 22px",
          }}
        />
      )}

      {/* Drone: sky-light bloom from above */}
      {hobby.id === "drone-videography" && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% -10%, ${hobby.accentHex}22 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Multimedia: vertical timeline scan line */}
      {hobby.id === "multimedia-editing" && (
        <motion.div
          className="absolute top-0 bottom-0 w-px pointer-events-none"
          style={{
            left: "18%",
            background: `linear-gradient(to bottom, transparent 0%, ${hobby.accentHex}80 30%, ${hobby.accentHex}80 70%, transparent 100%)`,
            scaleY: 0,
            originY: 0,
          }}
          whileHover={{
            scaleY: 1,
            transition: { duration: 0.5, ease: EASE_CINEMA },
          }}
          initial={{ scaleY: 0 }}
        />
      )}

      {/* Gaming: neon inset border pulse */}
      {hobby.id === "gaming" && (
        <motion.div
          className="absolute inset-0 rounded-[22px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: `inset 0 0 0 1px ${hobby.accentHex}55, inset 0 0 24px ${hobby.accentHex}15`,
          }}
        />
      )}

      {/* Ambient accent glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 105%, ${hobby.accentHex}20 0%, transparent 65%)`,
        }}
      />

      {/* Top accent line on hover */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{
          background: `linear-gradient(90deg, transparent 10%, ${hobby.accentHex}55 40%, ${hobby.accentHex}55 60%, transparent 90%)`,
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-sm w-fit"
          style={{
            borderColor: `${hobby.accentHex}28`,
            background: `${hobby.accentHex}10`,
          }}
        >
          <Icon
            className="h-3 w-3"
            style={{ color: `${hobby.accentHex}cc` }}
          />
          <span
            className="text-[9px] uppercase tracking-[0.25em] font-medium"
            style={{ color: `${hobby.accentHex}99` }}
          >
            {hobby.category}
          </span>
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <div className="flex items-end justify-between gap-2">
            <h4 className="text-lg font-semibold text-white leading-snug">
              {hobby.title}
            </h4>
            <ArrowUpRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/65 mb-0.5 flex-shrink-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <p className="text-slate-400/90 text-xs leading-5 line-clamp-2">
            {hobby.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── INSTAGRAM CARD ───────────────────────────────────────────────────────────
function InstagramCard() {
  const INSTAGRAM_URL = "https://www.instagram.com/exposurechronicles/";

  const THUMBNAILS = [
    "/hobbies/instagram/thumb1.jpg",
    "/hobbies/instagram/thumb2.jpg",
    "/hobbies/instagram/thumb3.jpg",
  ];

  const IG_GRADIENT =
    "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)";

  return (
    <motion.div
      variants={fadeUp}
      className="relative rounded-[22px] overflow-hidden border border-white/8 group hover:border-white/16 transition-colors duration-400"
      whileHover={{ y: -3, transition: { duration: 0.3, ease: EASE_SHARP } }}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(145deg, #0a0012 0%, #140024 40%, #08001a 100%)",
        }}
      />

      {/* Subtle IG brand wash */}
      <div
        className="absolute inset-0 opacity-12"
        style={{ background: IG_GRADIENT }}
      />

      {/* Hover glow — IG brand colors */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 15% 50%, rgba(240,148,51,0.10) 0%, transparent 50%), radial-gradient(ellipse at 85% 50%, rgba(188,24,136,0.10) 0%, transparent 50%)",
        }}
      />

      {/* Inset glow border */}
      <div
        className="absolute inset-0 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(188,24,136,0.30)",
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{ background: IG_GRADIENT }}
      />

      {/* Content */}
      <div className="relative px-6 py-6 md:px-8 md:py-7 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
        {/* Profile block */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Avatar with IG ring */}
          <div
            className="rounded-full p-[2px] flex-shrink-0"
            style={{ background: IG_GRADIENT }}
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0a0012] flex items-center justify-center">
              <Camera className="h-5 w-5 md:h-6 md:w-6 text-white/70" />
            </div>
          </div>

          {/* Handle + label */}
          <div className="space-y-0.5">
            <p className="text-white font-semibold text-sm md:text-[15px] tracking-tight">
              @exposurechronicles
            </p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 font-medium">
              Instagram · Visual Journal
            </p>
          </div>
        </div>

        {/* Vertical divider — desktop */}
        <div className="hidden md:block w-px self-stretch bg-white/8 flex-shrink-0" />

        {/* Stats — desktop */}
        <div className="hidden md:flex items-center gap-7 text-center flex-shrink-0">
          {[
            { label: "Focus", value: "Light" },
            { label: "Style", value: "Editorial" },
            { label: "Medium", value: "35mm" },
          ].map(({ label, value }) => (
            <div key={label} className="space-y-0.5">
              <p className="text-white text-sm font-semibold">{value}</p>
              <p className="text-[9px] uppercase tracking-[0.22em] text-white/30">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Right side: thumbnails + CTA */}
        <div className="flex items-center gap-4 sm:ml-auto">
          {/* Thumbnail strip */}
          <div className="hidden sm:flex gap-1.5">
            {THUMBNAILS.map((src, i) => (
              <div
                key={i}
                className="w-11 h-11 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/8"
                style={{
                  backgroundImage: `url(${src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  background: `url(${src}) center/cover, linear-gradient(135deg, #1a0030, #0d001a)`,
                }}
              />
            ))}
          </div>

          {/* CTA */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group/cta flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-[13px] font-medium text-white hover:bg-white/12 hover:border-white/22 transition-all duration-200 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            View Profile
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ─── MAIN SECTION ─────────────────────────────────────────────────────────────
export default function HobbySection({
  hideHeader = false,
}: {
  hideHeader?: boolean;
}) {
  const [active, setActive] = useState<Hobby | null>(null);

  const featured = HOBBIES.find((h) => h.featured)!;
  const secondary = HOBBIES.filter((h) => !h.featured);

  // Asymmetric layout — alternating wide/narrow for visual rhythm
  // Row A: 3D Printing (narrow 1/3) | Drone (wide 2/3)
  // Row B: Multimedia (wide 2/3)    | Gaming (narrow 1/3)
  const [printing, drone, multimedia, gaming] = secondary;

  const open = useCallback((hobby: Hobby) => setActive(hobby), []);
  const close = useCallback(() => setActive(null), []);

  return (
    <>
      <section id="beyond-work" className="space-y-10">
        {/* ── Section header ── */}
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
            <motion.p
              variants={fadeUp}
              className="text-slate-400 text-base leading-7"
            >
              Engineering is craft — so is storytelling through a lens, building
              physical objects from code, and finding fresh perspective in
              worlds beyond the screen.
            </motion.p>
          </motion.div>
        )}

        {/* ── Cards ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-4"
        >
          {/* Hero: Photography */}
          <FeaturedCard hobby={featured} onClick={() => open(featured)} />

          {/* Row A: narrow | wide */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <HobbyCard hobby={printing} onClick={() => open(printing)} />
            </div>
            <div className="sm:col-span-2">
              <HobbyCard hobby={drone} onClick={() => open(drone)} />
            </div>
          </div>

          {/* Row B: wide | narrow (flipped for rhythm) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <HobbyCard hobby={multimedia} onClick={() => open(multimedia)} />
            </div>
            <div className="sm:col-span-1">
              <HobbyCard hobby={gaming} onClick={() => open(gaming)} />
            </div>
          </div>

          {/* Instagram snapshot card */}
          <InstagramCard />
        </motion.div>
      </section>

      {/* ── Modal ── */}
      <AnimatePresence>
        {active && <HobbyModal hobby={active} onClose={close} />}
      </AnimatePresence>
    </>
  );
}
