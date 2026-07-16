"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { QuickNotes } from "@/components/dashboard/QuickNotes";

const AUTH_KEY = "personal_authed";
const EASE = [0.22, 1, 0.36, 1] as const;

const BG = "linear-gradient(145deg, #04071a 0%, #0b0420 50%, #060e1c 100%)";

export default function NotesPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) !== "true") {
      router.replace("/personal");
    } else {
      setAuthed(true);
      setChecked(true);
    }
  }, [router]);

  if (!checked || !authed) return null;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: BG,
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-sans), -apple-system, sans-serif",
      }}
    >
      {/* Ambient orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,90,245,0.3), transparent 70%)",
            top: -200,
            left: -160,
            filter: "blur(32px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244,114,182,0.22), transparent 70%)",
            bottom: -100,
            right: 100,
            filter: "blur(28px)",
          }}
        />
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(16px)",
          background: "rgba(4,7,26,0.7)",
          flexShrink: 0,
          position: "relative",
          zIndex: 10,
        }}
      >
        <button
          onClick={() => router.push("/personal")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: "6px 12px",
            color: "rgba(255,255,255,0.5)",
            fontSize: 12,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          }}
        >
          <ArrowLeft size={12} />
          Hub
        </button>
      </div>

      {/* Notes App */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE }}
        style={{ flex: 1, overflow: "hidden", position: "relative", zIndex: 1 }}
      >
        <QuickNotes />
      </motion.div>
    </div>
  );
}
