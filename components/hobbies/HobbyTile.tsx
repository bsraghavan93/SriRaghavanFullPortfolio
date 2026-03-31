"use client";

import { motion } from "framer-motion";
import { Maximize2 } from "lucide-react";
import { Hobby } from "./types";

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

type HobbyTileProps = {
  hobby: Hobby;
  variant?: "featured" | "regular";
  isSelected: boolean;
  hasSelection: boolean;
  onClick: () => void;
};

export default function HobbyTile({
  hobby,
  variant = "regular",
  isSelected,
  hasSelection,
  onClick,
}: HobbyTileProps) {
  const Icon = hobby.icon;
  const isFeatured = variant === "featured";

  // When this tile is the selected one, hide it in place (layoutId morph takes over)
  // When another tile is selected, blur + fade out this tile
  const outerStyle: React.CSSProperties = {
    opacity: isSelected ? 0 : hasSelection ? 0.4 : 1,
    pointerEvents: isSelected ? "none" : "auto",
    filter: hasSelection && !isSelected ? "blur(2px)" : "none",
    transform: hasSelection && !isSelected ? "scale(0.97)" : "scale(1)",
    transition: "opacity 0.35s ease, filter 0.35s ease, transform 0.35s ease",
  };

  return (
    <div style={outerStyle}>
      <motion.div
        layoutId={`hobby-card-${hobby.id}`}
        variants={fadeUp}
        onClick={onClick}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-[24px] overflow-hidden border border-white/10 group cursor-pointer hover:border-white/20"
        style={{
          minHeight: isFeatured ? "340px" : "220px",
          boxShadow: hasSelection && !isSelected
            ? "none"
            : `0 0 0 0 ${hobby.accentColor}00`,
        }}
        whileHover={
          !hasSelection
            ? {
                y: -5,
                scale: 1.02,
                boxShadow: `0 8px 40px ${hobby.accentColor}25, 0 0 0 1px ${hobby.accentColor}20`,
              }
            : {}
        }
      >
        {/* Background */}
        <motion.div
          layoutId={`hobby-bg-${hobby.id}`}
          className="absolute inset-0"
          style={{
            background: hobby.gradient,
            backgroundImage: hobby.image
              ? `url(${hobby.image}), ${hobby.gradient}`
              : hobby.gradient,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: hobby.gradient }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>

        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: isFeatured
              ? "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)"
              : "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.05) 100%)",
          }}
        />

        {/* Hover glow overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse at bottom left, ${hobby.accentColor}15 0%, transparent 60%)`,
          }}
        />

        {/* Expand icon — appears on hover */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div
            className="rounded-full p-1.5 backdrop-blur-sm"
            style={{
              background: `${hobby.accentColor}20`,
              border: `1px solid ${hobby.accentColor}30`,
            }}
          >
            <Maximize2 className="h-3 w-3 text-white/70" />
          </div>
        </div>

        {/* Content */}
        <div
          className="absolute inset-0 flex flex-col justify-between"
          style={{ padding: isFeatured ? "2rem" : "1.25rem" }}
        >
          {/* Category badge */}
          <motion.div layoutId={`hobby-category-${hobby.id}`} layout="position">
            <div
              className="inline-flex items-center gap-1.5 rounded-full backdrop-blur-sm w-fit"
              style={{
                border: `1px solid ${hobby.accentColor}30`,
                background: `${hobby.accentColor}15`,
                padding: isFeatured ? "6px 12px" : "4px 10px",
              }}
            >
              <Icon
                style={{ color: hobby.accentColor, opacity: 0.9 }}
                className={isFeatured ? "h-3.5 w-3.5" : "h-3 w-3"}
              />
              <span
                className="uppercase font-medium tracking-[0.25em]"
                style={{
                  color: hobby.accentColor,
                  opacity: 0.85,
                  fontSize: isFeatured ? "10px" : "9px",
                }}
              >
                {hobby.category}
              </span>
            </div>
          </motion.div>

          {/* Title + description */}
          <div className="space-y-2">
            <motion.h3
              layoutId={`hobby-title-${hobby.id}`}
              layout="position"
              className="font-bold text-white leading-tight"
              style={{ fontSize: isFeatured ? "clamp(1.75rem,4vw,2.5rem)" : "1.125rem" }}
            >
              {hobby.title}
            </motion.h3>
            <p
              className="text-slate-400 leading-5 line-clamp-2"
              style={{ fontSize: isFeatured ? "0.9rem" : "0.75rem" }}
            >
              {hobby.description}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
