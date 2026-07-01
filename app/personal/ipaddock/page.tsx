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

const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.07)",
  backdropFilter: "blur(24px) saturate(1.5)",
  WebkitBackdropFilter: "blur(24px) saturate(1.5)",
  border: "1px solid rgba(255,255,255,0.13)",
  borderRadius: 22,
};

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

  // ── Auth check ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) !== "true") {
      router.replace("/personal");
    } else {
      setAuthed(true);
    }
  }, [router]);

  // ── Load Orbitron font ─────────────────────────────────────────────────────
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@300;400;600&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
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

  // ── Weather fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("https://wttr.in/Philadelphia,PA?format=j1")
      .then((r) => r.json())
      .then((data) => {
        const c = data.current_condition[0];
        const desc: string = c.weatherDesc[0].value;
        setWeather({
          icon: weatherIcon(desc),
          temp: `${c.temp_F}°F`,
          desc,
          humidity: `${c.humidity}%`,
          wind: `${c.windspeedMiles} mph`,
          feels: `${c.FeelsLikeF}°F`,
        });
      })
      .catch(() => setWeather((w) => ({ ...w, desc: "No connection" })));

    // Re-fetch every 10 min
    const id = setInterval(
      () => {
        fetch("https://wttr.in/Philadelphia,PA?format=j1")
          .then((r) => r.json())
          .then((data) => {
            const c = data.current_condition[0];
            const desc: string = c.weatherDesc[0].value;
            setWeather({
              icon: weatherIcon(desc),
              temp: `${c.temp_F}°F`,
              desc,
              humidity: `${c.humidity}%`,
              wind: `${c.windspeedMiles} mph`,
              feels: `${c.FeelsLikeF}°F`,
            });
          })
          .catch(() => {});
      },
      10 * 60 * 1000
    );
    return () => clearInterval(id);
  }, []);

  // ── Fullscreen API ─────────────────────────────────────────────────────────
  const enterFullscreen = useCallback(() => {
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
      mozRequestFullScreen?: () => Promise<void>;
    };
    (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.() ?? el.mozRequestFullScreen?.())
      ?.catch(() => {});
  }, []);

  const exitFullscreen = useCallback(() => {
    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void>;
      mozCancelFullScreen?: () => Promise<void>;
    };
    (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.() ?? doc.mozCancelFullScreen?.())
      ?.catch(() => {});
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

      {/* ── Top controls ── */}
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
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.45)", fontSize: 11, cursor: "pointer",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <ArrowLeft size={12} />
          Hub
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={isFullscreen ? exitFullscreen : enterFullscreen}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 12px", borderRadius: 10,
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.45)", fontSize: 11, cursor: "pointer",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      </div>

      {/* ── Dashboard layout ── */}
      <div
        style={{
          position: "relative", zIndex: 1,
          width: "100%", height: "100%",
          padding: 18, paddingTop: 52,
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
              {([["Humidity", weather.humidity], ["Wind", weather.wind], ["Feels like", weather.feels]] as const).map(([lbl, val]) => (
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
                <div key={h} style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "rgba(255,255,255,0.26)", paddingBottom: 4 }}>{h}</div>
              ))}
              {cal.days.map((d, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    aspectRatio: "1", fontSize: 12, borderRadius: 8,
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
                transition: "transform 0.12s ease",
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
