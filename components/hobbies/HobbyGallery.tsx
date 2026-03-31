"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";
import { GalleryItem, GalleryStyle } from "./types";

type GalleryProps = {
  items: GalleryItem[];
  accentColor: string;
};

// ─── FILMSTRIP (Photography) — horizontal drag scroll, portrait cards ────────
function FilmstripGallery({ items, accentColor }: GalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  function getConstraints() {
    if (!containerRef.current) return { left: 0, right: 0 };
    const width = containerRef.current.scrollWidth - containerRef.current.offsetWidth;
    return { left: -width, right: 0 };
  }

  return (
    <div ref={containerRef} className="overflow-hidden cursor-grab active:cursor-grabbing select-none">
      <motion.div
        drag="x"
        dragConstraints={getConstraints()}
        dragElastic={0.08}
        style={{ x }}
        className="flex flex-row gap-3 pb-3"
      >
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            className="flex-shrink-0 rounded-[16px] overflow-hidden relative"
            style={{
              width: "200px",
              height: "280px",
              borderTop: `2px dashed ${accentColor}30`,
              borderBottom: `2px dashed ${accentColor}30`,
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {/* Background */}
            <div
              className="absolute inset-0"
              style={{
                background: item.gradient,
                backgroundImage: item.imagePath
                  ? `url(${item.imagePath}), ${item.gradient}`
                  : item.gradient,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {/* Overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
              }}
            />
            {/* Frame number */}
            <div
              className="absolute top-2 left-2 font-mono text-[9px] opacity-50"
              style={{ color: accentColor }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p
                className="text-[10px] uppercase tracking-widest text-white/60 truncate"
              >
                {item.caption}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
      <p
        className="text-[10px] text-center mt-1 opacity-40"
        style={{ color: accentColor }}
      >
        drag to explore
      </p>
    </div>
  );
}

// ─── BLUEPRINT GRID (3D Printing) — technical grid overlay ──────────────────
function BlueprintGridGallery({ items, accentColor }: GalleryProps) {
  const gridOverlay = `
    linear-gradient(${accentColor}12 1px, transparent 1px),
    linear-gradient(90deg, ${accentColor}12 1px, transparent 1px)
  `;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          className="rounded-[12px] overflow-hidden relative"
          style={{ aspectRatio: "1 / 1" }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          // stagger via delay
          custom={i}
        >
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{
              background: item.gradient,
              backgroundImage: item.imagePath
                ? `url(${item.imagePath}), ${item.gradient}`
                : item.gradient,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {/* Blueprint grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: gridOverlay,
              backgroundSize: "20px 20px",
            }}
          />
          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 70%)",
            }}
          />
          {/* Corner label */}
          <div
            className="absolute top-2 left-2 font-mono text-[9px] opacity-60"
            style={{ color: accentColor }}
          >
            {`CAD-${String(i + 1).padStart(2, "0")}`}
          </div>
          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <p className="font-mono text-[9px] text-white/50 truncate">
              {item.caption}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── PANORAMIC (Drone + Travel) — wide cinematic stacked cards ───────────────
function PanoramicGallery({ items, accentColor }: GalleryProps) {
  return (
    <div className="flex flex-col gap-5">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          className="rounded-[20px] overflow-hidden relative w-full"
          style={{ aspectRatio: "16 / 7" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.01 }}
        >
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{
              background: item.gradient,
              backgroundImage: item.imagePath
                ? `url(${item.imagePath}), ${item.gradient}`
                : item.gradient,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)",
            }}
          />
          {/* Caption */}
          <div className="absolute bottom-3 right-4">
            <p
              className="text-xs italic"
              style={{ color: `${accentColor}99` }}
            >
              {item.caption}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── TIMELINE STRIP (Multimedia Editing) — editorial horizontal panels ───────
function TimelineStripGallery({ items, accentColor }: GalleryProps) {
  return (
    <div className="overflow-x-auto pb-3 -mx-1">
      <div className="flex flex-row" style={{ minWidth: "max-content" }}>
        {items.map((item, i) => {
          const isFirst = i === 0;
          const isLast = i === items.length - 1;
          return (
            <motion.div
              key={item.id}
              className="relative overflow-hidden flex-shrink-0"
              style={{
                width: "260px",
                height: "200px",
                borderRadius: isFirst
                  ? "16px 0 0 16px"
                  : isLast
                  ? "0 16px 16px 0"
                  : "0",
                borderLeft: !isFirst ? `1px solid rgba(255,255,255,0.06)` : "none",
              }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {/* Background */}
              <div
                className="absolute inset-0"
                style={{
                  background: item.gradient,
                  backgroundImage: item.imagePath
                    ? `url(${item.imagePath}), ${item.gradient}`
                    : item.gradient,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              {/* Timeline mid-line */}
              <div
                className="absolute left-0 right-0"
                style={{
                  top: "50%",
                  height: "1px",
                  background: `${accentColor}40`,
                }}
              />
              {/* Dark overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.6) 100%)",
                }}
              />
              {/* Number badge */}
              <div
                className="absolute top-3 left-3 font-mono text-xs font-bold"
                style={{ color: accentColor }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                <p
                  className="text-[10px] uppercase tracking-widest text-white/50"
                >
                  {item.caption}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DEPTH CARDS (Gaming) — stacked rotated cards with hover pop ─────────────
function DepthCardsGallery({ items, accentColor }: GalleryProps) {
  const rotations = [-4, -1.5, 1, 3];
  const offsets = [0, 8, 16, 24]; // percent left offset

  return (
    <>
      {/* Desktop: stacked offset cards */}
      <div className="hidden md:block relative" style={{ minHeight: "300px" }}>
        {items.slice(0, 4).map((item, i) => (
          <motion.div
            key={item.id}
            className="absolute rounded-[18px] overflow-hidden"
            style={{
              width: "220px",
              height: "280px",
              left: `${offsets[i]}%`,
              top: 0,
              rotate: rotations[i],
              boxShadow: `0 8px 30px rgba(0,0,0,0.6), 0 0 20px ${accentColor}20`,
              zIndex: i,
            }}
            whileHover={{
              y: -16,
              rotate: 0,
              zIndex: 10,
              boxShadow: `0 16px 50px rgba(0,0,0,0.7), 0 0 40px ${accentColor}40`,
            }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Background */}
            <div
              className="absolute inset-0"
              style={{
                background: item.gradient,
                backgroundImage: item.imagePath
                  ? `url(${item.imagePath}), ${item.gradient}`
                  : item.gradient,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {/* Glow overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${accentColor}10 0%, transparent 60%)`,
              }}
            />
            {/* Dark overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)",
              }}
            />
            {/* Caption */}
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <p className="text-[10px] uppercase tracking-widest text-white/50">
                {item.caption}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="md:hidden flex flex-row gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 rounded-[16px] overflow-hidden relative"
            style={{ width: "180px", height: "240px" }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: item.gradient,
                backgroundImage: item.imagePath
                  ? `url(${item.imagePath}), ${item.gradient}`
                  : item.gradient,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
              }}
            />
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <p className="text-[10px] uppercase tracking-widest text-white/50">
                {item.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── DISPATCHER ───────────────────────────────────────────────────────────────
type HobbyGalleryProps = {
  style: GalleryStyle;
  items: GalleryItem[];
  accentColor: string;
};

export default function HobbyGallery({ style, items, accentColor }: HobbyGalleryProps) {
  switch (style) {
    case "filmstrip":
      return <FilmstripGallery items={items} accentColor={accentColor} />;
    case "blueprint-grid":
      return <BlueprintGridGallery items={items} accentColor={accentColor} />;
    case "panoramic":
      return <PanoramicGallery items={items} accentColor={accentColor} />;
    case "timeline-strip":
      return <TimelineStripGallery items={items} accentColor={accentColor} />;
    case "depth-cards":
      return <DepthCardsGallery items={items} accentColor={accentColor} />;
  }
}
