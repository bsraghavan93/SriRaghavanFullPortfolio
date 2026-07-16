"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, ArrowRight, LogOut } from "lucide-react";

const PASSWORD = "Jarvison";
const AUTH_KEY = "personal_authed";

const APPS = [
  {
    id: "ipaddock",
    label: "iPad Dock",
    description: "Clock, weather & shortcuts dashboard",
    emoji: "🖥️",
    accent: "rgba(124,90,245,0.35)",
    border: "rgba(124,90,245,0.4)",
    href: "/personal/ipaddock",
    available: true,
  },
  {
    id: "notes",
    label: "Quick Notes",
    description: "Checklists, tags & priorities",
    emoji: "📝",
    accent: "rgba(124,90,245,0.2)",
    border: "rgba(124,90,245,0.35)",
    href: "/personal/notes",
    available: true,
  },
  {
    id: "links",
    label: "Link Vault",
    description: "Coming soon",
    emoji: "🔗",
    accent: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.06)",
    href: "#",
    available: false,
  },
  {
    id: "gallery",
    label: "Private Gallery",
    description: "Coming soon",
    emoji: "📸",
    accent: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.06)",
    href: "#",
    available: false,
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export default function PersonalPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) === "true") setAuthed(true);
    setChecked(true);
  }, []);

  const submit = () => {
    if (password === PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setPassword("");
      setTimeout(() => setShake(false), 550);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setPassword("");
    setError(false);
  };

  if (!checked) return null;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, #080d1f 0%, #130824 50%, #0c1830 100%)",
        color: "#fff",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            width: 520,
            height: 520,
            background:
              "radial-gradient(circle, rgba(124,90,245,0.38), transparent 70%)",
            top: -200,
            left: -140,
            filter: "blur(32px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 420,
            height: 420,
            background:
              "radial-gradient(circle, rgba(240,98,146,0.28), transparent 70%)",
            bottom: -120,
            right: 160,
            filter: "blur(32px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 320,
            height: 320,
            background:
              "radial-gradient(circle, rgba(38,198,218,0.22), transparent 70%)",
            top: "35%",
            right: -90,
            filter: "blur(28px)",
          }}
        />
      </div>

      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {/* ── PASSWORD GATE ── */}
          {!authed ? (
            <motion.div
              key="gate"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="max-w-sm mx-auto"
            >
              <motion.div
                animate={shake ? { x: [-10, 10, -7, 7, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(28px) saturate(1.4)",
                  WebkitBackdropFilter: "blur(28px) saturate(1.4)",
                  border: "1px solid rgba(255,255,255,0.11)",
                  borderRadius: 28,
                  padding: "40px 36px",
                  boxShadow:
                    "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                {/* Lock icon */}
                <div className="flex justify-center mb-8">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(124,90,245,0.25), rgba(38,198,218,0.18))",
                      border: "1px solid rgba(124,90,245,0.35)",
                    }}
                  >
                    <Lock className="h-7 w-7" style={{ color: "#a78bfa" }} />
                  </div>
                </div>

                {/* Greeting */}
                <div className="text-center mb-8 space-y-1.5">
                  <h1
                    className="text-2xl font-bold text-white tracking-tight"
                    style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                  >
                    Welcome, Raghav
                  </h1>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)" }}>
                    Enter your password to continue
                  </p>
                </div>

                {/* Input */}
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(false);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                      placeholder="Password"
                      autoFocus
                      style={{
                        width: "100%",
                        borderRadius: 14,
                        padding: "13px 44px 13px 16px",
                        background: "rgba(255,255,255,0.07)",
                        border: `1px solid ${
                          error
                            ? "rgba(248,113,113,0.55)"
                            : "rgba(255,255,255,0.1)"
                        }`,
                        color: "#fff",
                        fontSize: 14,
                        outline: "none",
                        caretColor: "#a78bfa",
                        transition: "border-color 0.2s",
                      }}
                    />
                    <button
                      onClick={() => setShowPw((v) => !v)}
                      style={{
                        position: "absolute",
                        right: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "rgba(255,255,255,0.3)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        lineHeight: 0,
                      }}
                    >
                      {showPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                          fontSize: 12,
                          color: "rgba(248,113,113,0.85)",
                          textAlign: "center",
                        }}
                      >
                        Incorrect password. Try again.
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={submit}
                    style={{
                      width: "100%",
                      borderRadius: 14,
                      padding: "13px 0",
                      background:
                        "linear-gradient(135deg, #7c5af5 0%, #5b8ef5 100%)",
                      border: "none",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "opacity 0.15s",
                      letterSpacing: "0.02em",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.opacity = "0.88")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* ── AUTHENTICATED HUB ── */
            <motion.div
              key="hub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="max-w-2xl mx-auto space-y-8"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h1
                    className="text-3xl font-bold text-white"
                    style={{
                      fontFamily: "var(--font-rubik), sans-serif",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    Personal Hub
                  </h1>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.32)", marginTop: 3 }}>
                    Your private space, Raghav
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5"
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.3)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 0",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.6)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.3)")
                  }
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>

              {/* App grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {APPS.map((app, i) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.45, ease: EASE }}
                  >
                    {app.available ? (
                      <a
                        href={app.href}
                        className="group block"
                        style={{
                          borderRadius: 22,
                          padding: "22px 18px",
                          background: app.accent,
                          border: `1px solid ${app.border}`,
                          backdropFilter: "blur(16px)",
                          WebkitBackdropFilter: "blur(16px)",
                          textDecoration: "none",
                          color: "#fff",
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                          transition:
                            "transform 0.25s ease, border-color 0.25s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform =
                            "translateY(-4px)";
                          e.currentTarget.style.borderColor =
                            "rgba(124,90,245,0.65)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.borderColor = app.border;
                        }}
                      >
                        <div style={{ fontSize: 32, lineHeight: 1 }}>
                          {app.emoji}
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#fff",
                            }}
                          >
                            {app.label}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              color: "rgba(255,255,255,0.4)",
                              marginTop: 2,
                            }}
                          >
                            {app.description}
                          </p>
                        </div>
                        <div
                          className="flex items-center gap-1"
                          style={{
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: "0.12em",
                            color: "rgba(255,255,255,0.28)",
                          }}
                        >
                          Open
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </a>
                    ) : (
                      <div
                        style={{
                          borderRadius: 22,
                          padding: "22px 18px",
                          background: app.accent,
                          border: `1px solid ${app.border}`,
                          opacity: 0.35,
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        <div style={{ fontSize: 32, lineHeight: 1, filter: "grayscale(1)" }}>
                          {app.emoji}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                            {app.label}
                          </p>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                            {app.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
