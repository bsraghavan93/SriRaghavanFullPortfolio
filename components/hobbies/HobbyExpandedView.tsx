"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import HobbyGallery from "./HobbyGallery";
import { Hobby } from "./types";

type Props = {
  hobby: Hobby;
  onClose: () => void;
};

export default function HobbyExpandedView({ hobby, onClose }: Props) {
  const Icon = hobby.icon;

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    // Prevent body scroll while open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const panel = (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />

      {/* Expanded panel — uses layoutId to morph from the tile */}
      <motion.div
        layoutId={`hobby-card-${hobby.id}`}
        className="fixed z-50 rounded-[28px] overflow-hidden"
        style={{
          inset: "clamp(8px, 3vw, 40px)",
        }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Background layer — morphs from tile bg */}
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
        />

        {/* Strong dark overlay so content is readable */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.88) 100%)",
          }}
        />

        {/* Subtle accent glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top right, ${hobby.accentColor}12 0%, transparent 55%)`,
          }}
        />

        {/* Close button */}
        <motion.button
          className="absolute top-4 right-4 z-10 rounded-full p-2 backdrop-blur-sm transition-colors"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
          onClick={onClose}
          whileHover={{ scale: 1.1, background: "rgba(255,255,255,0.15)" }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <X className="h-4 w-4 text-white/80" />
        </motion.button>

        {/* Scrollable content — NOT a motion.div to avoid scroll layout animation */}
        <div
          className="absolute inset-0 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          <div className="min-h-full p-6 md:p-10 flex flex-col gap-6 md:gap-8">
            {/* Header */}
            <div className="flex flex-col gap-4 pt-2 pr-10">
              {/* Category badge */}
              <motion.div
                layoutId={`hobby-category-${hobby.id}`}
                layout="position"
              >
                <div
                  className="inline-flex items-center gap-2 rounded-full backdrop-blur-sm w-fit"
                  style={{
                    border: `1px solid ${hobby.accentColor}35`,
                    background: `${hobby.accentColor}18`,
                    padding: "6px 14px",
                  }}
                >
                  <Icon
                    className="h-3.5 w-3.5"
                    style={{ color: hobby.accentColor }}
                  />
                  <span
                    className="text-[10px] uppercase tracking-[0.28em] font-medium"
                    style={{ color: hobby.accentColor }}
                  >
                    {hobby.category}
                  </span>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                layoutId={`hobby-title-${hobby.id}`}
                layout="position"
                className="text-3xl md:text-5xl font-bold text-white leading-tight"
              >
                {hobby.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-slate-300 text-sm md:text-base leading-7 max-w-2xl"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {hobby.description}
              </motion.p>
            </div>

            {/* Divider */}
            <motion.div
              className="h-px"
              style={{ background: `${hobby.accentColor}20` }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.5 }}
            >
              <HobbyGallery
                style={hobby.galleryStyle}
                items={hobby.gallery}
                accentColor={hobby.accentColor}
              />
            </motion.div>

            {/* Bottom padding for scroll */}
            <div className="h-6" />
          </div>
        </div>
      </motion.div>
    </>
  );

  // Portal to body so it renders above everything
  if (typeof window === "undefined") return null;
  return createPortal(panel, document.body);
}
