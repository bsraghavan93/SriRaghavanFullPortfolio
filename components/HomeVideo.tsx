"use client";

import { useEffect, useRef } from "react";

/** Full-screen background clip. Plays once and holds the last frame; static first frame under reduced motion. */
export default function HomeVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (v && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      v.currentTime = 0;
    }
  }, []);

  return (
    <video
      ref={ref}
      className="fixed inset-0 z-0 h-dvh w-full bg-[#05060f] object-cover object-[75%_center] min-[900px]:object-[70%_center]"
      autoPlay
      muted
      playsInline
      preload="auto"
      aria-hidden
    >
      {/* Add <source src="/videos/main-hero-portrait.mp4" media="(max-width: 700px)" /> here if a 9:16 cut is made. */}
      <source src="/videos/main-hero.mp4#t=0.001" type="video/mp4" />
    </video>
  );
}
