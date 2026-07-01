"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Maximize2, Minimize2, ArrowLeft } from "lucide-react";

const AUTH_KEY = "personal_authed";

const DAYS = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",
];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const SHORTCUTS = [
  { label: "Google",   emoji: "🔍", url: "https://google.com" },
  { label: "YouTube",  emoji: "▶️",  url: "https://youtube.com" },
  { label: "Gmail",    emoji: "✉️",  url: "https://mail.google.com" },
  { label: "Maps",     emoji: "🗺️",  url: "https://maps.google.com" },
  { label: "Calendar", emoji: "📅",  url: "https://calendar.google.com" },
  { label: "Drive",    emoji: "📁",  url: "https://drive.google.com" },
  { label: "GitHub",   emoji: "💻",  url: "https://github.com" },
  { label: "Reddit",   emoji: "🐾",  url: "https://reddit.com" },
  { label: "Netflix",  emoji: "🎬",  url: "https://netflix.com" },
];

function weatherIcon(desc: string) {
  const d = desc.toLowerCase();
  if (d.includes("thunder") || d.includes("storm")) return "⛈";
  if (d.includes("heavy rain") || d.includes("torrential")) return "🌧";
  if (d.includes("drizzle") || d.includes("light rain") || d.includes("shower")) return "🌦";
  if (d.includes("rain")) return "🌧";
  if (d.includes("snow") || d.includes("blizzard") || d.includes("sleet")) return "❄️";
  if (d.includes("fog") || d.includes("mist") || d.includes("haze")) return "🌫";
  if (d.includes("overcast")) return "☁️";
  if (d.includes("cloudy")) return "⛅";
  if (d.includes("clear") || d.includes("sunny")) return "☀️";
  return "🌤";
}

type Weather = {
  icon: string;
  temp: string;
  desc: string;
  humidity: string;
  wind: string;
  feels: string;
};

type CalDay = { num: number | null; isToday: boolean };

// Solid fallback background — works on old Safari without backdrop-filter
const GLASS: React.CSSProperties = {
  background: "rgba(20,15,45,0.82)",
  backdropFilter: "blur(24px) saturate(1.5)",
  WebkitBackdropFilter: "blur(24px) saturate(1.5)",
  border: "1px solid rgba(255,255,255,0.13)",
  borderRadius: 22,
};

// XHR-based weather fetch — works on iOS < 10 where fetch() is unavailable
function fetchWeatherXHR(
  url: string,
  onSuccess: (data: Record<string, unknown>) => void,
  onError: () => void
) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          onSuccess(JSON.parse(xhr.responseText));
        } catch {
          onError();
        }
      } else {
        onError();
      }
    }
  };
  xhr.onerror = onError;
  try {
    xhr.send();
  } catch {
    onError();
  }
}

function parseWeather(data: Record<string, unknown>): Weather | null {
  try {
    const conditions = data.current_condition as Array<Record<string, unknown>>;
    const c = conditions[0];
    const descArr = c.weatherDesc as Array<Record<string, string>>;
    const desc: string = descArr[0].value;
    return {
      icon: weatherIcon(desc),
      temp: `${c.temp_F}°F`,
      desc,
      humidity: `${c.humidity}%`,
      wind: `${c.windspeedMiles} mph`,
      feels: `${c.FeelsLikeF}°F`,
    };
  } catch {
    return null;
  }
}

export default function IpadDockPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  // Clock
  const [clock, setClock] = useState({ h: "00", m: "00", s: "00", day: "", date: "" });

  // Calendar
  const [cal, setCal] = useState<{ month: string; year: string; days: CalDay[] }>({
    month: "", year: "", days: [],
  });

  // Weather
  const [weather, setWeather] = useState<Weather>({
    icon: "🌤", temp: "--°F", desc: "Loading...",
    humidity: "--%", wind: "-- mph", feels: "--°F",
  });

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // iOS detection (set once on mount, not SSR-safe to inline)
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // ── Auth check ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) !== "true") {
      router.replace("/personal");
    } else {
      setAuthed(true);
    }
  }, [router]);

  // ── iOS / standalone detection ─────────────────────────────────────────────
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const iosDevice = /iPad|iPhone|iPod/.test(ua);
    setIsIOS(iosDevice);
    // standalone = launched from "Add to Home Screen"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setIsStandalone((window.navigator as any).standalone === true);
  }, []);

  // ── Load Orbitron font ─────────────────────────────────────────────────────
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@300;400;600&display=swap";
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  // ── Clock tick ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setClock({
        h: p(now.getHours()),
        m: p(now.getMinutes()),
        s: p(now.getSeconds()),
        day: DAYS[now.getDay()],
        date: `${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Calendar build ─────────────────────────────────────────────────────────
  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
    const firstDay = new Date(y, m, 1).getDay();
    const total = new Date(y, m + 1, 0).getDate();
    const days: CalDay[] = [];
    for (let i = 0; i < firstDay; i++) days.push({ num: null, isToday: false });
    for (let d = 1; d <= total; d++) days.push({ num: d, isToday: d === today });
    setCal({ month: MONTHS[m], year: String(y), days });
  }, []);

  // ── Weather fetch (XHR for old iOS < 10 compat) ───────────────────────────
  useEffect(() => {
    const url = "https://wttr.in/Philadelphia,PA?format=j1";

    const doFetch = () => {
      fetchWeatherXHR(
        url,
        (data) => {
          const w = parseWeather(data);
          if (w) setWeather(w);
        },
        () => setWeather((prev) => ({ ...prev, desc: "No connection" }))
      );
    };

    doFetch();
    const id = setInterval(doFetch, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // ── Fullscreen API (desktop/Android only — not available on iOS Safari) ────
  const enterFullscreen = useCallback(() => {
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => void;
      mozRequestFullScreen?: () => void;
    };
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    const doc = document as Document & {
      webkitExitFullscreen?: () => void;
      mozCancelFullScreen?: () => void;
    };
    if (doc.exitFullscreen) {
      doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen();
    }
  }, []);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  if (!authed) return null;

  // On iOS in standalone mode → already fullscreen, hide top controls entirely
  // On iOS in browser → show "Add to Home Screen" tip instead of fullscreen button
  // On desktop → show normal fullscreen toggle

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "linear-gradient(145deg, #080d1f 0%, #130824 50%, #0c1830 100%)",
        color: "#fff",
        fontFamily: "'Inter', -apple-system, sans-serif",
        userSelect: "none",
        WebkitUserSelect: "none",
        position: "relative",
      }}
    >
      {/* ── Ambient orbs ── */}
      <div
        style={{
          position: "fixed", width: 520, height: 520, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,90,245,0.45), transparent 70%)",
          top: -200, left: -140, filter: "blur(30px)", pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed", width: 420, height: 420, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(240,98,146,0.35), transparent 70%)",
          bottom: -120, right: 160, filter: "blur(30px)", pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed", width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(38,198,218,0.3), transparent 70%)",
          top: "35%", right: -90, filter: "blur(30px)", pointerEvents: "none",
        }}
      />

      {/* ── Top controls — hidden when iOS standalone (already fullscreen) ── */}
      {!isStandalone && (
        <div
          style={{
            position: "absolute", top: 14, left: 14, right: 14,
            zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center",
          }}
        >
          {/* Back to hub */}
          <button
            onClick={() => router.push("/personal")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 12px", borderRadius: 10,
              background: "rgba(30,20,60,0.85)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.55)", fontSize: 11, cursor: "pointer",
            }}
          >
            <ArrowLeft size={12} />
            Hub
          </button>

          {/* iOS: show Add to Home Screen tip; desktop: show fullscreen toggle */}
          {isIOS ? (
            <div
              style={{
                padding: "7px 12px", borderRadius: 10,
                background: "rgba(124,90,245,0.25)", border: "1px solid rgba(124,90,245,0.4)",
                color: "rgba(255,255,255,0.65)", fontSize: 10,
                maxWidth: 200, textAlign: "right", lineHeight: 1.4,
              }}
            >
              Tip: tap <strong>Share ⬆</strong> → <strong>Add to Home Screen</strong> for fullscreen
            </div>
          ) : (
            <button
              onClick={isFullscreen ? exitFullscreen : enterFullscreen}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 12px", borderRadius: 10,
                background: "rgba(30,20,60,0.85)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.55)", fontSize: 11, cursor: "pointer",
              }}
            >
              {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </button>
          )}
        </div>
      )}

      {/* ── Dashboard layout ── */}
      <div
        style={{
          position: "relative", zIndex: 1,
          width: "100%", height: "100%",
          padding: 18,
          paddingTop: isStandalone ? 18 : 52,
          display: "flex", flexDirection: "column", gap: 14,
        }}
      >
        {/* Top row: Clock | Weather | Calendar */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1.3fr 0.85fr 1fr",
            gap: 14,
            minHeight: 0,
          }}
        >
          {/* Clock */}
          <div style={{ ...GLASS, padding: "28px 32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: "clamp(42px, 6.5vw, 72px)",
                fontWeight: 900,
                letterSpacing: 3,
                lineHeight: 1,
                background: "linear-gradient(135deg, #e0d7ff 0%, #a78bfa 50%, #7c5af5 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 18px rgba(124,90,245,0.55))",
              }}
            >
              {clock.h}:{clock.m}:{clock.s}
            </div>
            <div style={{ marginTop: 14, fontSize: 26, fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>
              {clock.day}
            </div>
            <div style={{ marginTop: 5, fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.45)", letterSpacing: "2.5px", textTransform: "uppercase" }}>
              {clock.date}
            </div>
          </div>

          {/* Weather */}
          <div style={{ ...GLASS, padding: "22px 18px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <div style={{ fontSize: 52, lineHeight: 1 }}>{weather.icon}</div>
            <div style={{ fontSize: 44, fontWeight: 700, marginTop: 8, lineHeight: 1 }}>{weather.temp}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 5 }}>{weather.desc}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 2, letterSpacing: 1 }}>Philadelphia, PA</div>
            <div style={{ display: "flex", gap: 16, marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12, width: "100%", justifyContent: "center" }}>
              {(
                [
                  ["Humidity", weather.humidity],
                  ["Wind", weather.wind],
                  ["Feels like", weather.feels],
                ] as [string, string][]
              ).map(([lbl, val]) => (
                <div key={lbl} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{val}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", marginTop: 2, letterSpacing: "0.5px", textTransform: "uppercase" }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div style={{ ...GLASS, padding: "20px 22px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.88)" }}>{cal.month}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.28)" }}>{cal.year}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, flex: 1, alignContent: "start" }}>
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map((h) => (
                <div
                  key={h}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    height: 20, fontSize: 9, color: "rgba(255,255,255,0.26)", paddingBottom: 4,
                  }}
                >
                  {h}
                </div>
              ))}
              {cal.days.map((d, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    // explicit height instead of aspect-ratio (not supported on old iOS)
                    height: 28,
                    fontSize: 12, borderRadius: 8,
                    color: d.num ? (d.isToday ? "#fff" : "rgba(255,255,255,0.6)") : "transparent",
                    background: d.isToday ? "rgba(124,90,245,0.8)" : "transparent",
                    fontWeight: d.isToday ? 700 : 400,
                    boxShadow: d.isToday ? "0 0 14px rgba(124,90,245,0.55)" : "none",
                  }}
                >
                  {d.num}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dock */}
        <div
          style={{
            ...GLASS,
            height: 96,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "0 16px",
            flexShrink: 0,
          }}
        >
          {SHORTCUTS.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 5,
                textDecoration: "none", color: "#fff",
                padding: "7px 14px", borderRadius: 16,
                cursor: "pointer", WebkitTapHighlightColor: "transparent",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.12) translateY(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1) translateY(0)"; }}
            >
              <div
                style={{
                  width: 46, height: 46, borderRadius: 13,
                  background: "rgba(255,255,255,0.11)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, lineHeight: 1,
                }}
              >
                {s.emoji}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.3px", whiteSpace: "nowrap" }}>
                {s.label}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
