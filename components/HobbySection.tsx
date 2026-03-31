"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Camera } from "lucide-react";
import { useCallback, useState } from "react";
import { HOBBIES } from "./hobbies/data";
import HobbyExpandedView from "./hobbies/HobbyExpandedView";
import HobbyTile from "./hobbies/HobbyTile";
import InstagramSnapshotCard from "./hobbies/InstagramSnapshotCard";

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

export default function HobbySection({ hideHeader = false }: { hideHeader?: boolean }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const featured = HOBBIES.find((h) => h.featured)!;
  const rest = HOBBIES.filter((h) => !h.featured);
  const firstRow = rest.slice(0, 3);
  const secondRow = rest.slice(3);

  const selectedHobby = selectedId
    ? HOBBIES.find((h) => h.id === selectedId) ?? null
    : null;

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  // Photography gallery gradients for Instagram preview tiles
  const instagramPreviews = featured.gallery.slice(0, 6).map((g) => g.gradient);

  return (
    <section id="beyond-work" className="space-y-10">
      {/* Section header — suppressed when embedded inside InterestsPage */}
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

      {/* Tile grid */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="space-y-4"
      >
        {/* Featured tile — full width */}
        <HobbyTile
          hobby={featured}
          variant="featured"
          isSelected={selectedId === featured.id}
          hasSelection={selectedId !== null}
          onClick={() => handleSelect(featured.id)}
        />

        {/* First row: 3 tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {firstRow.map((hobby) => (
            <HobbyTile
              key={hobby.id}
              hobby={hobby}
              isSelected={selectedId === hobby.id}
              hasSelection={selectedId !== null}
              onClick={() => handleSelect(hobby.id)}
            />
          ))}
        </div>

        {/* Second row: 2 tiles, centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:max-w-[66%] mx-auto">
          {secondRow.map((hobby) => (
            <HobbyTile
              key={hobby.id}
              hobby={hobby}
              isSelected={selectedId === hobby.id}
              hasSelection={selectedId !== null}
              onClick={() => handleSelect(hobby.id)}
            />
          ))}
        </div>
      </motion.div>

      {/* Instagram snapshot card */}
      <InstagramSnapshotCard
        username="@exposurechronicles"
        profileUrl="https://instagram.com/exposurechronicles"
        previewGradients={instagramPreviews}
        followerCount="2.4k"
      />

      {/* Expanded overlay — portal rendered, AnimatePresence for exit animation */}
      <AnimatePresence>
        {selectedHobby && (
          <HobbyExpandedView
            key={selectedHobby.id}
            hobby={selectedHobby}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
