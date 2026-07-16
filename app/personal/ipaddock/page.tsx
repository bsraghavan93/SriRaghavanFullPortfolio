"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const AUTH_KEY = "personal_authed";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const ZONES = [
  { label: "PST", city: "Los Angeles", tz: "America/Los_Angeles", color: "#a78bfa", glow: "rgba(167,139,250,0.55)" },
  { label: "CST", city: "Chicago",     tz: "America/Chicago",     color: "#34d399", glow: "rgba(52,211,153,0.55)"  },
  { label: "EST", city: "New York",    tz: "America/New_York",    color: "#f472b6", glow: "rgba(244,114,182,0.55)" },
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
  if (d.includes("thunder")) return "⛈";
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
  icon: string; temp: string; desc: string;
  humidity: string; wind: string; feels: string;
};
type CalDay = { num: number | null; isToday: boolean };
type ZoneTime = { time: string; ampm: string };

function fetchWeatherXHR(
  url: string,
  onSuccess: (d: Record<string, unknown>) => void,
  onError: () => void
) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try { onSuccess(JSON.parse(xhr.responseText)); } catch { onError(); }
      } else onError();
    }
  };
  xhr.onerror = onError;
  try { xhr.send(); } catch { onError(); }
}

// CSS keyframe animations for characters
const CHAR_CSS = `
  /* ── Running cat (bottom, left → right, then returns) ── */
  @keyframes cat-x {
    0%   { transform: translateX(-100px); opacity: 0; }
    2%   { opacity: 1; }
    22%  { transform: translateX(calc(100vw + 100px)); opacity: 1; }
    23%  { transform: translateX(calc(100vw + 100px)) scaleX(-1); opacity: 1; }
    43%  { transform: translateX(-100px) scaleX(-1); opacity: 1; }
    44%  { opacity: 0; transform: translateX(-100px) scaleX(-1); }
    100% { opacity: 0; transform: translateX(-100px); }
  }
  @keyframes cat-bob {
    0%, 100% { transform: translateY(0px); }
    25% { transform: translateY(-10px); }
    75% { transform: translateY(-5px); }
  }

  /* ── UFO flies right → left across top ── */
  @keyframes ufo-x {
    0%, 14%  { transform: translateX(calc(100vw + 150px)); opacity: 0; }
    16%  { opacity: 1; }
    36%  { transform: translateX(-150px); opacity: 1; }
    37%  { opacity: 0; }
    100% { opacity: 0; transform: translateX(calc(100vw + 150px)); }
  }
  @keyframes ufo-bob {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    30% { transform: translateY(-12px) rotate(-4deg); }
    60% { transform: translateY(6px) rotate(3deg); }
  }

  /* ── Ghost peeks from right side ── */
  @keyframes ghost-x {
    0%, 8%   { transform: translateX(88%); opacity: 0; }
    10%  { transform: translateX(88%); opacity: 1; }
    14%, 65% { transform: translateX(5%); opacity: 1; }
    70%  { transform: translateX(88%); opacity: 1; }
    72%  { opacity: 0; }
    100% { opacity: 0; transform: translateX(88%); }
  }
  @keyframes ghost-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-14px); }
  }

  /* ── Penguin walks left → right near dock ── */
  @keyframes penguin-x {
    0%, 60%, 100% { transform: translateX(-80px); opacity: 0; }
    62%  { opacity: 1; }
    78%  { transform: translateX(calc(100vw + 80px)); opacity: 1; }
    80%  { opacity: 0; }
  }
  @keyframes penguin-wobble {
    0%, 100% { transform: rotate(-10deg) translateY(0px); }
    50%  { transform: rotate(10deg) translateY(-6px); }
  }

  /* ── Rocket shoots up from bottom ── */
  @keyframes rocket-up {
    0%, 72%, 100% { transform: translateY(100vh); opacity: 0; }
    74% { opacity: 1; }
    88% { transform: translateY(-120px); opacity: 1; }
    90% { opacity: 0; }
  }

  /* ── Star twinkle decoration ── */
  @keyframes twinkle {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50% { opacity: 0.9; transform: scale(1.6); }
  }

  /* ── Scanning line across clock ── */
  @keyframes scan-line {
    0% { transform: translateY(-100%); opacity: 0; }
    5% { opacity: 0.25; }
    95% { opacity: 0.25; }
    100% { transform: translateY(200%); opacity: 0; }
  }

  /* ── Orb pulse ── */
  @keyframes orb-pulse {
    0%, 100% { transform: scale(1); opacity: 0.55; }
    50% { transform: scale(1.15); opacity: 0.75; }
  }
`;

export default function IpadDockPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  const [zoneTimes, setZoneTimes] = useState<ZoneTime[]>(
    ZONES.map(() => ({ time: "00:00:00", ampm: "AM" }))
  );
  const [dateInfo, setDateInfo] = useState({ day: "", date: "" });
  const [cal, setCal] = useState<{ month: string; year: string; days: CalDay[] }>({
    month: "", year: "", days: [],
  });
  const [weather, setWeather] = useState<Weather>({
    icon: "🌤", temp: "--°F", desc: "Loading...",
    humidity: "--%", wind: "-- mph", feels: "--°F",
  });

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) !== "true") {
      router.replace("/personal");
    } else {
      setAuthed(true);
    }
  }, [router]);

  // ── Fonts ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@300;400;600&display=swap";
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, []);

  // ── Clock (all three zones) ───────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const times = ZONES.map((z) => {
        const fmt = new Intl.DateTimeFormat("en-US", {
          timeZone: z.tz,
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(now);
        const parts = fmt.split(" ");
        return { time: parts[0] || "00:00:00", ampm: parts[1] || "" };
      });
      setZoneTimes(times);
      setDateInfo({
        day: DAYS[now.getDay()],
        date: `${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Calendar ──────────────────────────────────────────────────────────────
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

  // ── Weather (XHR for old iOS compat) ─────────────────────────────────────
  useEffect(() => {
    const url = "https://wttr.in/Philadelphia,PA?format=j1";
    const doFetch = () => {
      fetchWeatherXHR(
        url,
        (data) => {
          try {
            const c = (data.current_condition as Array<Record<string, unknown>>)[0];
            const desc = (c.weatherDesc as Array<Record<string, string>>)[0].value;
            setWeather({
              icon: weatherIcon(desc),
              temp: `${c.temp_F}°F`,
              desc,
              humidity: `${c.humidity}%`,
              wind: `${c.windspeedMiles} mph`,
              feels: `${c.FeelsLikeF}°F`,
            });
          } catch {
            setWeather((w) => ({ ...w, desc: "No data" }));
          }
        },
        () => setWeather((w) => ({ ...w, desc: "No connection" }))
      );
    };
    doFetch();
    const id = setInterval(doFetch, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (!authed) return null;

  return (
    <>
      <style>{CHAR_CSS}</style>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          background: "linear-gradient(145deg, #04071a 0%, #0b0420 50%, #060e1c 100%)",
          color: "#fff",
          fontFamily: "'Inter', -apple-system, sans-serif",
          userSelect: "none",
          WebkitUserSelect: "none",
          position: "relative",
        }}
      >
        {/* ── Ambient background orbs ── */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{
            position: "absolute", width: 700, height: 700, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,90,245,0.35), transparent 70%)",
            top: -250, left: -200,
            animation: "orb-pulse 8s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244,114,182,0.28), transparent 70%)",
            bottom: -150, right: 100,
            animation: "orb-pulse 11s ease-in-out infinite 3s",
          }} />
          <div style={{
            position: "absolute", width: 380, height: 380, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(52,211,153,0.20), transparent 70%)",
            top: "40%", right: -100,
            animation: "orb-pulse 9s ease-in-out infinite 5s",
          }} />
        </div>

        {/* ── Decorative star dots ── */}
        {[
          [8,12], [15,88], [22,35], [35,7], [42,65], [55,22], [62,80],
          [70,45], [78,15], [85,72], [92,38], [5,55], [48,92], [88,5],
        ].map(([left, top], i) => (
          <div
            key={i}
            style={{
              position: "fixed",
              left: `${left}%`, top: `${top}%`,
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              borderRadius: "50%",
              background: "#fff",
              opacity: 0.3,
              pointerEvents: "none",
              zIndex: 0,
              animation: `twinkle ${2.5 + (i * 0.4)}s ease-in-out infinite ${i * 0.3}s`,
            }}
          />
        ))}

        {/* ══════════════════════════════════════════════════════════
            ANIMATED CHARACTERS  (pointer-events: none — don't block clicks)
        ══════════════════════════════════════════════════════════ */}

        {/* 🐱 Cat — runs left→right along bottom, then returns */}
        <div style={{
          position: "fixed", bottom: 118, left: 0,
          zIndex: 50, pointerEvents: "none",
          animation: "cat-x 70s linear infinite",
          transformOrigin: "center center",
        }}>
          <div style={{
            fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1,
            animation: "cat-bob 0.45s ease-in-out infinite",
          }}>🐱</div>
        </div>

        {/* 🛸 UFO — flies right→left across the upper area */}
        <div style={{
          position: "fixed", top: 80, right: 0,
          zIndex: 50, pointerEvents: "none",
          animation: "ufo-x 85s linear infinite -18s",
        }}>
          <div style={{
            fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1,
            animation: "ufo-bob 3s ease-in-out infinite",
          }}>🛸</div>
        </div>

        {/* 👻 Ghost — peeks in from the right side, mid-screen */}
        <div style={{
          position: "fixed", right: 0, top: "42%",
          zIndex: 50, pointerEvents: "none",
          overflow: "hidden",
          animation: "ghost-x 65s ease-in-out infinite -10s",
        }}>
          <div style={{
            fontSize: "clamp(48px, 6vw, 80px)", lineHeight: 1,
            animation: "ghost-float 2.8s ease-in-out infinite",
          }}>👻</div>
        </div>

        {/* 🐧 Penguin — waddles across near the dock */}
        <div style={{
          position: "fixed", bottom: 122, left: 0,
          zIndex: 49, pointerEvents: "none",
          animation: "penguin-x 55s linear infinite -35s",
        }}>
          <div style={{
            fontSize: "clamp(28px, 3.2vw, 44px)", lineHeight: 1,
            animation: "penguin-wobble 0.55s ease-in-out infinite",
          }}>🐧</div>
        </div>

        {/* 🚀 Rocket — shoots up from bottom center occasionally */}
        <div style={{
          position: "fixed", left: "47%", bottom: 0,
          zIndex: 50, pointerEvents: "none",
          animation: "rocket-up 90s ease-in infinite -60s",
        }}>
          <div style={{ fontSize: "clamp(36px, 4.5vw, 60px)", lineHeight: 1 }}>🚀</div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            MAIN DASHBOARD LAYOUT
        ══════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: "relative", zIndex: 1,
            width: "100%", height: "100%",
            padding: 16,
            display: "flex", flexDirection: "column", gap: 12,
          }}
        >
          {/* ── Top bar: Back button + Date ── */}
          <div
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexShrink: 0, paddingBottom: 2,
            }}
          >
            <button
              onClick={() => router.push("/personal")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 10,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.4)", fontSize: "clamp(10px, 1vw, 13px)",
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={11} />
              Hub
            </button>
            <div style={{
              fontSize: "clamp(11px, 1.1vw, 15px)",
              color: "rgba(255,255,255,0.28)",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}>
              {dateInfo.day} · {dateInfo.date}
            </div>
          </div>

          {/* ── Three timezone clocks (main element) ── */}
          <div
            style={{
              flex: "1.7",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              minHeight: 0,
            }}
          >
            {ZONES.map((zone, i) => (
              <div
                key={zone.label}
                style={{
                  background: "rgba(10,6,28,0.90)",
                  border: `1px solid ${zone.color}30`,
                  borderRadius: 22,
                  padding: "clamp(20px, 3vh, 36px) clamp(16px, 2.5vw, 32px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: `0 0 60px ${zone.glow}20, inset 0 1px 0 ${zone.color}18`,
                }}
              >
                {/* Subtle scan line */}
                <div style={{
                  position: "absolute", left: 0, right: 0, height: 1,
                  background: `linear-gradient(90deg, transparent, ${zone.color}55, transparent)`,
                  animation: `scan-line ${6 + i}s linear infinite ${i * 2}s`,
                  pointerEvents: "none",
                }} />

                {/* Corner accent */}
                <div style={{
                  position: "absolute", top: 12, right: 14,
                  width: 6, height: 6, borderRadius: "50%",
                  background: zone.color,
                  boxShadow: `0 0 10px ${zone.color}`,
                  animation: `twinkle 2s ease-in-out infinite ${i * 0.7}s`,
                }} />

                {/* Zone badge */}
                <div style={{
                  fontSize: "clamp(13px, 1.6vw, 22px)",
                  fontWeight: 800,
                  color: zone.color,
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  marginBottom: "clamp(8px, 1.5vh, 18px)",
                  textShadow: `0 0 20px ${zone.color}`,
                }}>
                  {zone.label}
                </div>

                {/* Clock digits */}
                <div
                  style={{
                    fontFamily: "'Orbitron', 'Courier New', monospace",
                    fontSize: "clamp(48px, 6.5vw, 96px)",
                    fontWeight: 900,
                    letterSpacing: "clamp(2px, 0.3vw, 5px)",
                    lineHeight: 1,
                    color: "#fff",
                    filter: `drop-shadow(0 0 28px ${zone.glow})`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {zoneTimes[i].time}
                </div>

                {/* AM/PM */}
                <div style={{
                  marginTop: "clamp(4px, 0.8vh, 10px)",
                  fontSize: "clamp(14px, 1.6vw, 22px)",
                  fontWeight: 700,
                  color: zone.color,
                  letterSpacing: "0.2em",
                  opacity: 0.8,
                }}>
                  {zoneTimes[i].ampm}
                </div>

                {/* City name */}
                <div style={{
                  marginTop: "clamp(10px, 1.5vh, 18px)",
                  fontSize: "clamp(10px, 1.1vw, 15px)",
                  color: "rgba(255,255,255,0.32)",
                  letterSpacing: "clamp(2px, 0.3vw, 4px)",
                  textTransform: "uppercase",
                }}>
                  {zone.city}
                </div>
              </div>
            ))}
          </div>

          {/* ── Middle row: Weather + Calendar ── */}
          <div
            style={{
              flex: "1",
              display: "grid",
              gridTemplateColumns: "0.9fr 1.1fr",
              gap: 12,
              minHeight: 0,
            }}
          >
            {/* Weather */}
            <div
              style={{
                background: "rgba(10,6,28,0.90)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 22,
                padding: "clamp(16px, 2vh, 26px) clamp(14px, 2vw, 24px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: 0,
              }}
            >
              <div style={{ fontSize: "clamp(36px, 5vw, 68px)", lineHeight: 1 }}>
                {weather.icon}
              </div>
              <div style={{
                fontSize: "clamp(28px, 4vw, 58px)",
                fontWeight: 700,
                marginTop: "clamp(6px, 1vh, 12px)",
                lineHeight: 1,
              }}>
                {weather.temp}
              </div>
              <div style={{
                fontSize: "clamp(9px, 1vw, 13px)",
                color: "rgba(255,255,255,0.45)",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginTop: "clamp(4px, 0.6vh, 8px)",
              }}>
                {weather.desc}
              </div>
              <div style={{
                fontSize: "clamp(8px, 0.9vw, 12px)",
                color: "rgba(255,255,255,0.22)",
                marginTop: 3,
                letterSpacing: "1px",
              }}>
                Philadelphia, PA
              </div>
              <div style={{
                display: "flex", gap: "clamp(12px, 2vw, 28px)",
                marginTop: "clamp(10px, 1.5vh, 18px)",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: "clamp(10px, 1.5vh, 16px)",
                width: "100%", justifyContent: "center",
              }}>
                {([["Humidity", weather.humidity], ["Wind", weather.wind], ["Feels", weather.feels]] as [string,string][]).map(([l, v]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "clamp(11px, 1.4vw, 18px)", fontWeight: 600 }}>{v}</div>
                    <div style={{ fontSize: "clamp(7px, 0.75vw, 10px)", color: "rgba(255,255,255,0.32)", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div
              style={{
                background: "rgba(10,6,28,0.90)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 22,
                padding: "clamp(16px, 2vh, 24px) clamp(16px, 2vw, 28px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "baseline", marginBottom: "clamp(10px, 1.5vh, 16px)",
                flexShrink: 0,
              }}>
                <div style={{
                  fontSize: "clamp(13px, 1.5vw, 20px)",
                  fontWeight: 700,
                  letterSpacing: "clamp(2px, 0.3vw, 4px)",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.88)",
                }}>
                  {cal.month}
                </div>
                <div style={{ fontSize: "clamp(11px, 1.2vw, 16px)", color: "rgba(255,255,255,0.25)" }}>
                  {cal.year}
                </div>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "clamp(2px, 0.4vw, 6px)",
                flex: 1,
                alignContent: "start",
              }}>
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map((h) => (
                  <div key={h} style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    height: "clamp(18px, 2vh, 26px)",
                    fontSize: "clamp(8px, 0.85vw, 12px)",
                    color: "rgba(255,255,255,0.22)",
                  }}>
                    {h}
                  </div>
                ))}
                {cal.days.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      height: "clamp(26px, 3vh, 42px)",
                      fontSize: "clamp(10px, 1.2vw, 17px)",
                      borderRadius: "clamp(6px, 0.7vw, 10px)",
                      color: d.num
                        ? d.isToday ? "#fff" : "rgba(255,255,255,0.58)"
                        : "transparent",
                      background: d.isToday ? "rgba(124,90,245,0.82)" : "transparent",
                      fontWeight: d.isToday ? 700 : 400,
                      boxShadow: d.isToday ? "0 0 18px rgba(124,90,245,0.6)" : "none",
                    }}
                  >
                    {d.num}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── App Dock ── */}
          <div
            style={{
              background: "rgba(10,6,28,0.90)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 22,
              height: "clamp(82px, 9vh, 118px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "clamp(2px, 1.2vw, 18px)",
              padding: "0 clamp(12px, 1.5vw, 24px)",
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
                  justifyContent: "center", gap: "clamp(4px, 0.5vh, 7px)",
                  textDecoration: "none", color: "#fff",
                  padding: "6px clamp(6px, 1vw, 14px)",
                  borderRadius: 14,
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.18) translateY(-5px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1) translateY(0)"; }}
              >
                <div style={{
                  width: "clamp(44px, 5vw, 66px)",
                  height: "clamp(44px, 5vw, 66px)",
                  borderRadius: "clamp(10px, 1.2vw, 16px)",
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "clamp(24px, 3vw, 40px)", lineHeight: 1,
                }}>
                  {s.emoji}
                </div>
                <div style={{
                  fontSize: "clamp(8px, 0.85vw, 11px)",
                  color: "rgba(255,255,255,0.42)",
                  whiteSpace: "nowrap",
                }}>
                  {s.label}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
