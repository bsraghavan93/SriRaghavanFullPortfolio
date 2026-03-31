"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

type Props = {
  username: string;
  profileUrl: string;
  previewGradients: string[]; // 6 gradient strings for preview tiles
  followerCount?: string;
  tagline?: string;
};

export default function InstagramSnapshotCard({
  username,
  profileUrl,
  previewGradients,
  followerCount,
  tagline = "A visual diary from behind the lens",
}: Props) {
  const accentColor = "#38bdf8"; // photography accent

  // Pad or trim to always have 6 tiles
  const tiles = [...previewGradients].slice(0, 6);
  while (tiles.length < 6) {
    tiles.push("linear-gradient(135deg, #0f172a, #1e3a5f)");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[24px] border border-white/10 p-5 md:p-7 space-y-5"
      style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(8px)" }}
    >
      {/* Top row: icon + handle + CTA */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Instagram icon container */}
          <div
            className="rounded-xl p-2 flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)",
            }}
          >
            {/* Instagram camera icon — inline SVG (lucide-react v1.7.0 lacks Instagram) */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-white"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">{username}</p>
            {followerCount && (
              <p className="text-xs text-white/40">{followerCount} followers</p>
            )}
          </div>
        </div>

        {/* Follow / View CTA */}
        <motion.a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-4 py-2 transition-all duration-200 flex-shrink-0"
          style={{
            border: `1px solid ${accentColor}40`,
            color: accentColor,
            background: `${accentColor}10`,
          }}
          whileHover={{
            background: `${accentColor}20`,
            borderColor: `${accentColor}70`,
          }}
        >
          View Profile
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </motion.a>
      </div>

      {/* Label */}
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/35 font-medium">
        Instagram Visual Journal
      </p>

      {/* Preview grid — 6 tiles */}
      <div className="grid grid-cols-6 gap-1.5">
        {tiles.map((gradient, i) => (
          <motion.div
            key={i}
            className="rounded-[8px] overflow-hidden cursor-pointer"
            style={{ aspectRatio: "1 / 1", background: gradient }}
            whileHover={{ scale: 1.08, zIndex: 1 }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>

      {/* Tagline */}
      <p className="text-xs text-white/40 italic">{tagline}</p>
    </motion.div>
  );
}
