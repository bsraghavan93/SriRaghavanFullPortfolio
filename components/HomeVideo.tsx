"use client";

import { useEffect, useRef } from "react";

/** Full-screen background clip. Loops; static first frame under reduced motion. */
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
      className="fixed inset-x-0 top-0 z-0 h-[52dvh] w-full bg-[#05060f] object-cover object-[68%_center] [mask-image:linear-gradient(180deg,#000_65%,transparent_100%)] min-[900px]:inset-0 min-[900px]:h-dvh min-[900px]:object-[70%_center] min-[900px]:[mask-image:none]"
      autoPlay
      loop
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
