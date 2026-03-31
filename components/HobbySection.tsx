"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  type TargetAndTransition,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Camera,
  Film,
  Gamepad2,
  Printer,
  Video,
  X,
  ZoomIn,
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type HobbyId =
  | "photography"
  | "3d-printing"
  | "drone-videography"
  | "multimedia-editing"
  | "gaming";

type ModalVariant = "bento" | "carousel" | "filmstrip" | "reel" | "achievement";

type Hobby = {
  id: HobbyId;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  image: string;
  gallery: string[];
  modalVariant: ModalVariant;
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
      "Capturing light, emotion, and unseen stories in everyday moments — one frame at a time.",
    longDescription:
      "Photography is my window into patience and perspective. From golden-hour landscapes to candid street scenes, I chase the fleeting intersections of light, shadow, and emotion that most eyes pass over. Every frame is a deliberate choice — a frozen decision about what matters, and why.",
    image: "/hobbies/photography/photo1.jpg",
    gallery: [
      "/hobbies/photography/photo1.jpg",
      "/hobbies/photography/photo2.jpg",
      "/hobbies/photography/photo3.jpg",
      "/hobbies/photography/photo4.jpg",
      "/hobbies/photography/photo5.jpg",
      "/hobbies/photography/photo6.jpg",
    ],
    modalVariant: "bento",
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
      "There is something uniquely satisfying about watching an idea materialize from nothing. I design custom mechanical parts, prototypes, and sculptural pieces that blur the line between digital and physical reality.",
    image: "/hobbies/3d-printing/cover.jpg",
    gallery: [
      "/hobbies/3d-printing/print1.jpg",
      "/hobbies/3d-printing/print2.jpg",
      "/hobbies/3d-printing/print3.jpg",
      "/hobbies/3d-printing/print4.jpg",
    ],
    modalVariant: "carousel",
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
      "Piloting a drone forces you to think in three dimensions. I pursue cinematic aerial sequences that give familiar places a completely alien beauty — city grids from 400 feet, coastlines unfolding in smooth glides, forests dissolving into pure geometry.",
    image: "/hobbies/drone/cover.jpg",
    gallery: [
      "/hobbies/drone/shot1.jpg",
      "/hobbies/drone/shot2.jpg",
      "/hobbies/drone/shot3.jpg",
      "/hobbies/drone/shot4.jpg",
      "/hobbies/drone/shot5.jpg",
    ],
    modalVariant: "filmstrip",
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
      "Editing is where raw footage becomes story. I work across video timelines, color grading, and motion graphics — crafting the rhythm and pacing that makes an audience feel something. The edit is where real filmmaking happens.",
    image: "/hobbies/multimedia/cover.jpg",
    gallery: [
      "/hobbies/multimedia/frame1.jpg",
      "/hobbies/multimedia/frame2.jpg",
      "/hobbies/multimedia/frame3.jpg",
      "/hobbies/multimedia/frame4.jpg",
      "/hobbies/multimedia/frame5.jpg",
      "/hobbies/multimedia/frame6.jpg",
    ],
    modalVariant: "reel",
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
      "Games are the only medium that places you inside the story. I am drawn to titles with deep systems, moral complexity, and worlds that reward curiosity. Gaming sharpens the same problem-solving and pattern-recognition that makes me a better engineer.",
    image: "/hobbies/gaming/cover.jpg",
    gallery: [
      "/hobbies/gaming/screen1.jpg",
      "/hobbies/gaming/screen2.jpg",
      "/hobbies/gaming/screen3.jpg",
      "/hobbies/gaming/screen4.jpg",
    ],
    modalVariant: "achievement",
    icon: Gamepad2,
    gradient: "linear-gradient(145deg, #100320 0%, #230832 45%, #1e051a 100%)",
    accentHex: "#e879f9",
  },
];

// ─── EASING ───────────────────────────────────────────────────────────────────
const EASE_CINEMA = [0.22, 1, 0.36, 1] as const;
const EASE_SHARP = [0.16, 1, 0.3, 1] as const;
const EASE_SPRING = [0.34, 1.4, 0.64, 1] as const;

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

const BG_HOVER: Record<HobbyId, TargetAndTransition> = {
  photography: { scale: 1.04, transition: { duration: 0.9, ease: EASE_CINEMA } },
  "3d-printing": {
    scale: 1.06,
    rotateY: 1.5,
    rotateX: -0.8,
    transition: { duration: 0.5, ease: EASE_SHARP },
  },
  "drone-videography": {
    scale: 1.05,
    y: -6,
    transition: { duration: 1.0, ease: EASE_CINEMA },
  },
  "multimedia-editing": {
    scale: 1.06,
    transition: { duration: 0.45, ease: EASE_SHARP },
  },
  gaming: { scale: 1.08, transition: { duration: 0.35, ease: EASE_SPRING } },
};

// ─── PHOTO SLOT ───────────────────────────────────────────────────────────────
function PhotoSlot({
  src,
  alt,
  className = "",
  placeholder,
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  placeholder: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden group/slot ${
        onClick ? "cursor-zoom-in" : ""
      } ${className}`}
      style={{
        backgroundImage: `url(${src}), ${placeholder}`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      title={alt}
    >
      {onClick && (
        <div className="absolute inset-0 bg-black/0 group-hover/slot:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover/slot:opacity-100 transition-opacity duration-200" />
        </div>
      )}
    </div>
  );
}

// ─── LIGHTBOX ─────────────────────────────────────────────────────────────────
function Lightbox({
  photos,
  index,
  gradient,
  accentHex,
  onClose,
  onPrev,
  onNext,
}: {
  photos: string[];
  index: number;
  gradient: string;
  accentHex: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.96)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      {/* Photo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="relative w-full h-full flex items-center justify-center p-10 md:p-16"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: EASE_CINEMA }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="w-full h-full max-w-2xl max-h-[65vh] rounded-xl shadow-2xl"
            style={{
              backgroundImage: `url(${photos[index]}), ${gradient}`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {photos.map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              background: i === index ? accentHex : `${accentHex}40`,
              transform: i === index ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* Prev */}
      {photos.length > 1 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/15 text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      )}

      {/* Next */}
      {photos.length > 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/15 text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      )}

      {/* Close */}
      <button
        className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/15 text-white/60 hover:text-white hover:bg-white/20 transition-all duration-200"
        onClick={onClose}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

// ─── BENTO GALLERY — Photography ──────────────────────────────────────────────
// Layout: large 2×2 top-left + small slots filling around it
function BentoGallery({
  hobby,
  onPhotoClick,
}: {
  hobby: Hobby;
  onPhotoClick: (i: number) => void;
}) {
  const p = hobby.gallery;
  const ph = hobby.gradient;

  return (
    <div className="grid grid-cols-3 gap-2" style={{ height: 420 }}>
      {/* Large featured — col 1-2, row 1-2 */}
      <motion.div
        className="col-span-2 row-span-2"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE_CINEMA }}
      >
        <PhotoSlot
          src={p[0] ?? ""}
          alt="Photo 1"
          className="w-full h-full rounded-xl"
          placeholder={ph}
          onClick={() => onPhotoClick(0)}
        />
      </motion.div>

      {/* Right column small */}
      {[1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.07, duration: 0.5, ease: EASE_CINEMA }}
        >
          <PhotoSlot
            src={p[i] ?? ""}
            alt={`Photo ${i + 1}`}
            className="w-full h-full rounded-xl"
            placeholder={ph}
            onClick={() => onPhotoClick(i)}
          />
        </motion.div>
      ))}

      {/* Bottom row — 3 equal */}
      {[3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.15 + (i - 3) * 0.07,
            duration: 0.45,
            ease: EASE_CINEMA,
          }}
        >
          <PhotoSlot
            src={p[i] ?? ""}
            alt={`Photo ${i + 1}`}
            className="w-full h-full rounded-xl"
            placeholder={ph}
            onClick={() => onPhotoClick(i)}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ─── CAROUSEL GALLERY — 3D Printing ───────────────────────────────────────────
// Centre-stage with perspective-skewed side cards
function CarouselGallery({
  hobby,
  onPhotoClick,
}: {
  hobby: Hobby;
  onPhotoClick: (i: number) => void;
}) {
  const [active, setActive] = useState(0);
  const photos = hobby.gallery;
  const prev = () => setActive((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setActive((i) => (i + 1) % photos.length);

  return (
    <div className="space-y-4">
      {/* Stage */}
      <div
        className="relative flex items-center justify-center h-72 overflow-hidden"
        style={{ perspective: 900 }}
      >
        {photos.map((src, i) => {
          const offset = i - active;
          if (Math.abs(offset) > 1) return null;
          const isActive = offset === 0;
          return (
            <motion.div
              key={src}
              className="absolute w-[64%] h-full cursor-pointer"
              animate={{
                x: `${offset * 108}%`,
                scale: isActive ? 1 : 0.76,
                rotateY: isActive ? 0 : offset < 0 ? 20 : -20,
                opacity: isActive ? 1 : 0.42,
                zIndex: isActive ? 2 : 1,
              }}
              transition={{ duration: 0.5, ease: EASE_SHARP }}
              onClick={() => (isActive ? onPhotoClick(i) : setActive(i))}
            >
              <PhotoSlot
                src={src}
                alt={`Print ${i + 1}`}
                className="w-full h-full rounded-xl"
                placeholder={hobby.gradient}
                onClick={isActive ? () => onPhotoClick(i) : undefined}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={prev}
          className="flex items-center justify-center w-8 h-8 rounded-full border border-white/15 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                background:
                  i === active ? hobby.accentHex : `${hobby.accentHex}40`,
                transform: i === active ? "scale(1.4)" : "scale(1)",
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="flex items-center justify-center w-8 h-8 rounded-full border border-white/15 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={active}
          className="text-center text-[10px] uppercase tracking-[0.25em] text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          Print {active + 1} / {photos.length}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

// ─── FILMSTRIP GALLERY — Drone Videography ────────────────────────────────────
// Large active frame + film-strip thumbnail row below
function FilmstripGallery({
  hobby,
  onPhotoClick,
}: {
  hobby: Hobby;
  onPhotoClick: (i: number) => void;
}) {
  const [active, setActive] = useState(0);
  const photos = hobby.gallery;

  return (
    <div className="space-y-3">
      {/* Large frame */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          className="relative w-full rounded-xl overflow-hidden cursor-zoom-in group/main"
          style={{ height: 280 }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.4, ease: EASE_CINEMA }}
          onClick={() => onPhotoClick(active)}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${photos[active]}), ${hobby.gradient}`,
            }}
          />
          {/* Cinematic letterbox bars */}
          <div className="absolute inset-x-0 top-0 h-5 bg-black/70" />
          <div className="absolute inset-x-0 bottom-0 h-5 bg-black/70" />
          <div className="absolute inset-0 bg-black/0 group-hover/main:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <ZoomIn className="h-7 w-7 text-white opacity-0 group-hover/main:opacity-100 transition-opacity duration-200" />
          </div>
          {/* Shot label */}
          <div
            className="absolute bottom-6 right-3 text-[9px] font-mono uppercase tracking-widest"
            style={{ color: `${hobby.accentHex}99` }}
          >
            SHOT {String(active + 1).padStart(2, "0")}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Film strip */}
      <div className="relative rounded overflow-hidden" style={{ background: "#080808" }}>
        {/* Sprocket holes top */}
        <div className="flex items-center gap-2 px-2 h-4 bg-[#111]">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="w-3 h-2 flex-shrink-0 rounded-sm bg-black border border-white/8" />
          ))}
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto px-2 py-1.5 scrollbar-hide">
          {photos.map((src, i) => (
            <motion.div
              key={src}
              onClick={() => setActive(i)}
              className="relative flex-shrink-0 w-[72px] h-12 rounded cursor-pointer overflow-hidden"
              animate={{
                scale: i === active ? 1.06 : 1,
                opacity: i === active ? 1 : 0.45,
              }}
              transition={{ duration: 0.25, ease: EASE_SHARP }}
              whileHover={{ opacity: 0.8 }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${src}), ${hobby.gradient}` }}
              />
              {i === active && (
                <div
                  className="absolute inset-0 rounded border-2"
                  style={{ borderColor: hobby.accentHex }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Sprocket holes bottom */}
        <div className="flex items-center gap-2 px-2 h-4 bg-[#111]">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="w-3 h-2 flex-shrink-0 rounded-sm bg-black border border-white/8" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── REEL GALLERY — Multimedia Editing ────────────────────────────────────────
// Frame grid with timecode labels and film-corner markers
const TIMECODES = [
  "00:00:00",
  "00:01:23",
  "00:02:47",
  "00:04:15",
  "00:05:42",
  "00:07:08",
];

function ReelGallery({
  hobby,
  onPhotoClick,
}: {
  hobby: Hobby;
  onPhotoClick: (i: number) => void;
}) {
  const photos = hobby.gallery;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {photos.map((src, i) => (
          <motion.div
            key={src}
            className="relative aspect-video rounded overflow-hidden cursor-zoom-in group/frame"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: EASE_CINEMA }}
            onClick={() => onPhotoClick(i)}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover/frame:scale-105"
              style={{ backgroundImage: `url(${src}), ${hobby.gradient}` }}
            />

            {/* Film-frame corner markers */}
            <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-white/30" />
            <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-white/30" />
            <div className="absolute bottom-4 left-1 w-2.5 h-2.5 border-b border-l border-white/30" />
            <div className="absolute bottom-4 right-1 w-2.5 h-2.5 border-b border-r border-white/30" />

            {/* Timecode */}
            <div className="absolute bottom-1.5 left-2 text-[7px] font-mono text-white/40 tracking-widest">
              {TIMECODES[i] ?? "00:00:00"}
            </div>

            {/* Hover */}
            <div className="absolute inset-0 bg-black/0 group-hover/frame:bg-black/25 transition-all duration-200 flex items-center justify-center">
              <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover/frame:opacity-100 transition-opacity duration-150" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Timeline bar */}
      <div
        className="relative h-5 rounded flex items-center px-2 gap-1 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        {photos.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full"
            style={{ background: `${hobby.accentHex}35` }}
          >
            <div
              className="h-full w-1/2 rounded-full"
              style={{ background: `${hobby.accentHex}90` }}
            />
          </div>
        ))}
        <span className="text-[7px] font-mono text-white/25 tracking-widest ml-1 flex-shrink-0">
          {TIMECODES[photos.length - 1] ?? "00:00:00"}
        </span>
      </div>
    </div>
  );
}

// ─── ACHIEVEMENT GALLERY — Gaming ─────────────────────────────────────────────
// Neon-bordered screenshot grid with scanlines + achievement badges
function AchievementGallery({
  hobby,
  onPhotoClick,
}: {
  hobby: Hobby;
  onPhotoClick: (i: number) => void;
}) {
  const photos = hobby.gallery;

  return (
    <div className="grid grid-cols-2 gap-3">
      {photos.map((src, i) => (
        <motion.div
          key={src}
          className="relative aspect-video rounded-lg overflow-hidden cursor-zoom-in group/screen"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: EASE_SPRING }}
          onClick={() => onPhotoClick(i)}
          style={{
            boxShadow: `0 0 0 1px ${hobby.accentHex}30, 0 0 18px ${hobby.accentHex}10`,
          }}
          whileHover={{
            boxShadow: `0 0 0 1px ${hobby.accentHex}65, 0 0 28px ${hobby.accentHex}22`,
            transition: { duration: 0.2 },
          }}
        >
          {/* Screenshot */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover/screen:scale-105"
            style={{ backgroundImage: `url(${src}), ${hobby.gradient}` }}
          />

          {/* Scanlines */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.6) 1px, transparent 1px, transparent 3px)",
            }}
          />

          {/* Achievement badge */}
          <div
            className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded px-1.5 py-0.5 backdrop-blur-sm"
            style={{
              background: `${hobby.accentHex}20`,
              border: `1px solid ${hobby.accentHex}35`,
            }}
          >
            <div
              className="w-1 h-1 rounded-full animate-pulse"
              style={{ background: hobby.accentHex }}
            />
            <span
              className="text-[7px] font-mono uppercase tracking-widest"
              style={{ color: `${hobby.accentHex}bb` }}
            >
              {`SS-${String(i + 1).padStart(2, "0")}`}
            </span>
          </div>

          {/* Hover */}
          <div className="absolute inset-0 bg-black/0 group-hover/screen:bg-black/25 transition-all duration-200 flex items-center justify-center">
            <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover/screen:opacity-100 transition-opacity duration-150" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── HOBBY MODAL ──────────────────────────────────────────────────────────────
function HobbyModal({
  hobby,
  onClose,
}: {
  hobby: Hobby;
  onClose: () => void;
}) {
  const Icon = hobby.icon;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevPhoto = useCallback(
    () =>
      setLightboxIndex((i) =>
        i !== null ? (i - 1 + hobby.gallery.length) % hobby.gallery.length : null
      ),
    [hobby.gallery.length]
  );
  const nextPhoto = useCallback(
    () =>
      setLightboxIndex((i) =>
        i !== null ? (i + 1) % hobby.gallery.length : null
      ),
    [hobby.gallery.length]
  );

  // Escape closes modal only when lightbox is not open
  useEffect(() => {
    if (lightboxIndex !== null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, lightboxIndex]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/78 backdrop-blur-xl" />

      {/* Card */}
      <motion.div
        className="relative w-full max-w-3xl rounded-[28px] overflow-hidden border border-white/12 shadow-2xl flex flex-col"
        style={{ background: hobby.gradient, maxHeight: "90vh" }}
        initial={{ opacity: 0, scale: 0.91, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 18 }}
        transition={{ duration: 0.45, ease: EASE_CINEMA }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle bg image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
          style={{ backgroundImage: `url(${hobby.image})` }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/82 via-black/72 to-black/88 pointer-events-none" />
        {/* Accent ambient */}
        <div
          className="absolute inset-0 opacity-12 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 20% 0%, ${hobby.accentHex}55 0%, transparent 55%)`,
          }}
        />
        {/* Top glow line */}
        <div
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent 5%, ${hobby.accentHex}65 40%, ${hobby.accentHex}65 60%, transparent 95%)`,
          }}
        />

        {/* Close button */}
        <motion.button
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 border border-white/12 text-white/60 hover:text-white hover:bg-black/70 transition-all duration-200 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
        >
          <X className="h-3.5 w-3.5" />
        </motion.button>

        {/* Scrollable content */}
        <div className="relative overflow-y-auto flex-1 p-6 md:p-8 space-y-5">
          {/* Category badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.45, ease: EASE_CINEMA }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-sm w-fit"
              style={{
                borderColor: `${hobby.accentHex}30`,
                background: `${hobby.accentHex}10`,
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

          {/* Title + description */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: EASE_CINEMA }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight">
              {hobby.title}
            </h3>
            <p className="text-slate-300/85 text-sm leading-6 max-w-lg">
              {hobby.longDescription}
            </p>
          </motion.div>

          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.5, ease: EASE_CINEMA }}
          >
            {hobby.modalVariant === "bento" && (
              <BentoGallery hobby={hobby} onPhotoClick={openLightbox} />
            )}
            {hobby.modalVariant === "carousel" && (
              <CarouselGallery hobby={hobby} onPhotoClick={openLightbox} />
            )}
            {hobby.modalVariant === "filmstrip" && (
              <FilmstripGallery hobby={hobby} onPhotoClick={openLightbox} />
            )}
            {hobby.modalVariant === "reel" && (
              <ReelGallery hobby={hobby} onPhotoClick={openLightbox} />
            )}
            {hobby.modalVariant === "achievement" && (
              <AchievementGallery hobby={hobby} onPhotoClick={openLightbox} />
            )}
          </motion.div>

          {/* Instagram CTA */}
          {hobby.link && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.4, ease: EASE_CINEMA }}
            >
              <a
                href={hobby.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/15 hover:border-white/25 transition-all duration-200"
              >
                View on Instagram
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </a>
            </motion.div>
          )}
        </div>

        {/* Lightbox — absolute inside fixed parent covers full viewport */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <Lightbox
              photos={hobby.gallery}
              index={lightboxIndex}
              gradient={hobby.gradient}
              accentHex={hobby.accentHex}
              onClose={closeLightbox}
              onPrev={prevPhoto}
              onNext={nextPhoto}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
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
      whileHover={{ y: -4, transition: { duration: 0.4, ease: EASE_CINEMA } }}
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${hobby.image}), ${hobby.gradient}`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        whileHover={BG_HOVER[hobby.id]}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/8" />

      {/* Cinematic hover wash */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(34,211,238,0.10) 0%, transparent 45%, rgba(139,92,246,0.09) 100%)",
        }}
      />

      {/* Accent top line */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent 5%, ${hobby.accentHex}55 35%, ${hobby.accentHex}55 65%, transparent 95%)`,
        }}
      />

      <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-sm"
            style={{
              borderColor: `${hobby.accentHex}28`,
              background: "rgba(0,0,0,0.35)",
            }}
          >
            <Icon
              className="h-3.5 w-3.5"
              style={{ color: hobby.accentHex }}
            />
            <span
              className="text-[10px] uppercase tracking-[0.28em] font-medium"
              style={{ color: `${hobby.accentHex}aa` }}
            >
              {hobby.category}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.28em] text-white/20 font-medium mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
            Featured
          </span>
        </div>

        <div className="space-y-4">
          <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
            {hobby.title}
          </h3>
          <p className="text-slate-300/85 text-sm md:text-base leading-7 max-w-xl">
            {hobby.description}
          </p>
          <div className="inline-flex items-center gap-2 text-white/30 group-hover:text-white/70 transition-colors duration-500">
            <span className="text-[11px] tracking-[0.22em] uppercase font-medium">
              Open gallery
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
}: {
  hobby: Hobby;
  onClick: () => void;
}) {
  const Icon = hobby.icon;

  return (
    <motion.div
      variants={fadeUp}
      onClick={onClick}
      className="relative rounded-[22px] overflow-hidden h-[240px] md:h-[260px] border border-white/8 group cursor-pointer hover:border-white/16 transition-colors duration-300"
      whileHover={{ y: -5, transition: { duration: 0.3, ease: EASE_SHARP } }}
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${hobby.image}), ${hobby.gradient}`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        whileHover={BG_HOVER[hobby.id]}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/25 to-black/5" />

      {/* Category-specific overlays */}
      {hobby.id === "3d-printing" && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${hobby.accentHex}08 1px, transparent 1px), linear-gradient(90deg, ${hobby.accentHex}08 1px, transparent 1px)`,
            backgroundSize: "22px 22px",
          }}
        />
      )}
      {hobby.id === "drone-videography" && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% -10%, ${hobby.accentHex}22 0%, transparent 60%)`,
          }}
        />
      )}
      {hobby.id === "multimedia-editing" && (
        <motion.div
          className="absolute top-0 bottom-0 w-px pointer-events-none"
          style={{
            left: "18%",
            background: `linear-gradient(to bottom, transparent 0%, ${hobby.accentHex}70 35%, ${hobby.accentHex}70 65%, transparent 100%)`,
            scaleY: 0,
            originY: 0,
          }}
          whileHover={{ scaleY: 1, transition: { duration: 0.5, ease: EASE_CINEMA } }}
          initial={{ scaleY: 0 }}
        />
      )}
      {hobby.id === "gaming" && (
        <motion.div
          className="absolute inset-0 rounded-[22px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: `inset 0 0 0 1px ${hobby.accentHex}50, inset 0 0 24px ${hobby.accentHex}12`,
          }}
        />
      )}

      {/* Accent glow bottom */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 105%, ${hobby.accentHex}18 0%, transparent 60%)`,
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{
          background: `linear-gradient(90deg, transparent 10%, ${hobby.accentHex}50 40%, ${hobby.accentHex}50 60%, transparent 90%)`,
        }}
      />

      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        <div
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-sm w-fit"
          style={{
            borderColor: `${hobby.accentHex}25`,
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
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(145deg, #0a0012 0%, #140024 40%, #08001a 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{ background: IG_GRADIENT }}
      />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 15% 50%, rgba(240,148,51,0.09) 0%, transparent 50%), radial-gradient(ellipse at 85% 50%, rgba(188,24,136,0.09) 0%, transparent 50%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{ background: IG_GRADIENT }}
      />

      <div className="relative px-6 py-6 md:px-8 md:py-7 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
        {/* Profile */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div
            className="rounded-full p-[2px] flex-shrink-0"
            style={{ background: IG_GRADIENT }}
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0a0012] flex items-center justify-center">
              <Camera className="h-5 w-5 md:h-6 md:w-6 text-white/70" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-white font-semibold text-sm md:text-[15px] tracking-tight">
              @exposurechronicles
            </p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 font-medium">
              Instagram · Visual Journal
            </p>
          </div>
        </div>

        <div className="hidden md:block w-px self-stretch bg-white/8 flex-shrink-0" />

        {/* Stats */}
        <div className="hidden md:flex items-center gap-7 flex-shrink-0">
          {[
            { label: "Focus", value: "Light" },
            { label: "Style", value: "Editorial" },
            { label: "Medium", value: "35mm" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center space-y-0.5">
              <p className="text-white text-sm font-semibold">{value}</p>
              <p className="text-[9px] uppercase tracking-[0.22em] text-white/30">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Thumbnails + CTA */}
        <div className="flex items-center gap-4 sm:ml-auto">
          <div className="hidden sm:flex gap-1.5">
            {THUMBNAILS.map((src, i) => (
              <div
                key={i}
                className="w-11 h-11 md:w-12 md:h-12 rounded-lg flex-shrink-0 border border-white/8"
                style={{
                  background: `url(${src}) center/cover, linear-gradient(135deg, #1a0030, #0d001a)`,
                }}
              />
            ))}
          </div>
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
  const [printing, drone, multimedia, gaming] = HOBBIES.filter(
    (h) => !h.featured
  );

  const open = useCallback((hobby: Hobby) => setActive(hobby), []);
  const close = useCallback(() => setActive(null), []);

  return (
    <>
      <section id="beyond-work" className="space-y-10">
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
              physical objects from code, and finding fresh perspective in worlds
              beyond the screen.
            </motion.p>
          </motion.div>
        )}

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-4"
        >
          {/* Hero */}
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

          {/* Row B: wide | narrow */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <HobbyCard hobby={multimedia} onClick={() => open(multimedia)} />
            </div>
            <div className="sm:col-span-1">
              <HobbyCard hobby={gaming} onClick={() => open(gaming)} />
            </div>
          </div>

          <InstagramCard />
        </motion.div>
      </section>

      <AnimatePresence>
        {active && <HobbyModal hobby={active} onClose={close} />}
      </AnimatePresence>
    </>
  );
}
