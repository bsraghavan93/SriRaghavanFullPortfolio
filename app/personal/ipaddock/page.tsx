"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Volume2, VolumeX, WifiOff, X, Plus, Trash2 } from "lucide-react";

// ── Local mute-server helpers ──────────────────────────────────────────────
const MUTE_TOKEN = process.env.NEXT_PUBLIC_MUTE_API_TOKEN ?? "";
const MUTE_BASE  = "http://localhost:5051";

async function muteApiFetch(path: string, method = "GET"): Promise<boolean | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3000);
  try {
    const r = await fetch(`${MUTE_BASE}${path}`, {
      method,
      headers: { "X-API-Token": MUTE_TOKEN },
      signal: ctrl.signal,
    });
    if (!r.ok) return null;
    const d = await r.json() as Record<string, Record<string, boolean>>;
    return d.result?.muted ?? d.state?.muted ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ── Constants ──────────────────────────────────────────────────────────────
const AUTH_KEY      = "personal_authed";
const TODO_KEY_TS   = "td_trustage";
const TODO_KEY_UCLA = "td_ucla";

const DAYS       = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS     = ["January","February","March","April","May","June","July","August","September","October","November","December"];

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

// ── WMO weather codes ──────────────────────────────────────────────────────
function wmoIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2)  return "🌤";
  if (code === 3) return "☁️";
  if (code <= 49) return "🌫";
  if (code <= 55) return "🌦";
  if (code <= 65) return "🌧";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌦";
  if (code <= 86) return "❄️";
  return "⛈";
}
function wmoDesc(code: number): string {
  if (code === 0) return "Clear Sky";
  if (code === 1) return "Mainly Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code <= 49) return "Fog";
  if (code <= 55) return "Drizzle";
  if (code <= 65) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow Showers";
  return "Thunderstorm";
}
const cToF = (c: number) => Math.round(c * 9 / 5 + 32);

// ── XHR helper ─────────────────────────────────────────────────────────────
function xhrGet(url: string, onOk: (d: unknown) => void, onErr: () => void) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status === 200) { try { onOk(JSON.parse(xhr.responseText)); } catch { onErr(); } }
    else onErr();
  };
  xhr.onerror = onErr;
  try { xhr.send(); } catch { onErr(); }
}

function openMain(url: string) {
  window.open(url, "_blank", "left=100,top=100,width=1366,height=900,noopener,noreferrer");
}

// ── Types ──────────────────────────────────────────────────────────────────
type ZoneTime = { hhmm: string; ss: string; ampm: string };
type CalDay   = { num: number | null; isToday: boolean };
type HEntry   = { label: string; icon: string; tempC: number; precip: number };
type DEntry   = { day: string; icon: string; highC: number; lowC: number; precip: number };
type WData    = { icon: string; desc: string; tempC: number; feelsC: number; humidity: number; windMph: number; hourly: HEntry[]; daily: DEntry[] };
type Todo     = { id: string; text: string; done: boolean };

// ── Open-Meteo URL (Downingtown, PA) ──────────────────────────────────────
const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=40.0068&longitude=-75.7035" +
  "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
  "&hourly=temperature_2m,precipitation_probability,weather_code" +
  "&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max" +
  "&temperature_unit=celsius&wind_speed_unit=mph&timezone=America%2FNew_York&forecast_days=7";

function parseWeather(raw: unknown): WData {
  const d    = raw as Record<string, unknown>;
  const cur  = d.current as Record<string, number>;
  const hrly = d.hourly  as Record<string, unknown[]>;
  const dly  = d.daily   as Record<string, unknown[]>;

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const curKey = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:00`;
  const times  = hrly.time as string[];
  let idx = times.findIndex(t => t === curKey);
  if (idx < 0) idx = 0;

  const hourly: HEntry[] = [];
  for (let i = idx; i < idx + 12 && i < times.length; i++) {
    const h24  = parseInt(times[i].slice(11, 13));
    const ampm = h24 >= 12 ? "PM" : "AM";
    const h12  = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
    hourly.push({
      label:  `${h12}${ampm}`,
      icon:   wmoIcon((hrly.weather_code as number[])[i]),
      tempC:  Math.round((hrly.temperature_2m as number[])[i]),
      precip: (hrly.precipitation_probability as number[])[i] ?? 0,
    });
  }

  const daily: DEntry[] = (dly.time as string[]).map((t, i) => {
    const dt = new Date(t + "T12:00:00");
    return {
      day:    i === 0 ? "Today" : DAYS_SHORT[dt.getDay()],
      icon:   wmoIcon((dly.weather_code as number[])[i]),
      highC:  Math.round((dly.temperature_2m_max as number[])[i]),
      lowC:   Math.round((dly.temperature_2m_min as number[])[i]),
      precip: (dly.precipitation_probability_max as number[])[i] ?? 0,
    };
  });

  return {
    icon:     wmoIcon(cur.weather_code),
    desc:     wmoDesc(cur.weather_code),
    tempC:    Math.round(cur.temperature_2m),
    feelsC:   Math.round(cur.apparent_temperature),
    humidity: cur.relative_humidity_2m,
    windMph:  Math.round(cur.wind_speed_10m),
    hourly,
    daily,
  };
}

// ── Todo helpers ───────────────────────────────────────────────────────────
const loadTodos = (key: string): Todo[] => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};
const saveTodos = (key: string, items: Todo[]) => {
  try { localStorage.setItem(key, JSON.stringify(items)); } catch {}
};

// ── CSS animations ─────────────────────────────────────────────────────────
const ANIM = `
  @keyframes twinkle { 0%,100%{opacity:0.2;transform:scale(1)} 50%{opacity:0.9;transform:scale(1.6)} }
  @keyframes scan-line {
    0%{transform:translateY(-100%);opacity:0} 5%{opacity:0.25} 95%{opacity:0.25} 100%{transform:translateY(200%);opacity:0}
  }
  @keyframes orb-pulse { 0%,100%{transform:scale(1);opacity:0.55} 50%{transform:scale(1.15);opacity:0.75} }
  @keyframes mute-ring { 0%,100%{box-shadow:0 0 0 0 rgba(248,113,113,0)} 50%{box-shadow:0 0 0 10px rgba(248,113,113,0.22)} }
  @keyframes toast-slide { 0%{opacity:0;transform:translateY(12px)} 15%{opacity:1;transform:translateY(0)} 80%{opacity:1} 100%{opacity:0} }
`;

// ── Dark theme tokens (always dark) ───────────────────────────────────────
const T = {
  bg:          "linear-gradient(145deg, #04071a 0%, #0b0420 50%, #060e1c 100%)",
  card:        "rgba(10,6,28,0.92)",
  border:      "rgba(255,255,255,0.08)",
  text:        "#ffffff",
  muted:       "rgba(255,255,255,0.35)",
  sub:         "rgba(255,255,255,0.60)",
  inputBg:     "rgba(255,255,255,0.07)",
  divider:     "rgba(255,255,255,0.07)",
  iconBtn:     "rgba(255,255,255,0.06)",
  iconBtnBrd:  "rgba(255,255,255,0.10)",
  iconColor:   "rgba(255,255,255,0.5)",
  todoDoneTxt: "rgba(255,255,255,0.28)",
  popBg:       "rgba(14,8,36,0.97)",
};

const card: React.CSSProperties = {
  background: T.card, border: `1px solid ${T.border}`, borderRadius: 22,
};

const iconBtn = (extra?: React.CSSProperties): React.CSSProperties => ({
  display: "flex", alignItems: "center", justifyContent: "center",
  background: T.iconBtn, border: `1px solid ${T.iconBtnBrd}`,
  color: T.iconColor, borderRadius: 14, cursor: "pointer",
  touchAction: "manipulation",
  ...extra,
});

// ══════════════════════════════════════════════════════════════════════════════
export default function IpadDockPage() {
  const router = useRouter();
  const [authed,     setAuthed]     = useState(false);
  const [muted,       setMuted]       = useState(false);
  const [muteOffline, setMuteOffline] = useState(false);
  const [showToast,   setShowToast]   = useState(false);
  const [showWeekly, setShowWeekly] = useState(false);
  const [todoPopup,  setTodoPopup]  = useState<"trustage" | "ucla" | null>(null);

  const [zoneTimes, setZoneTimes] = useState<ZoneTime[]>(ZONES.map(() => ({ hhmm: "0:00", ss: "00", ampm: "AM" })));
  const [dateInfo,  setDateInfo]  = useState({ day: "", date: "" });
  const [cal,       setCal]       = useState<{ month: string; year: string; days: CalDay[] }>({ month: "", year: "", days: [] });
  const [weather,   setWeather]   = useState<WData | null>(null);
  const [todos,     setTodos]     = useState<{ trustage: Todo[]; ucla: Todo[] }>({ trustage: [], ucla: [] });
  const [inputTS,   setInputTS]   = useState("");
  const [inputUCLA, setInputUCLA] = useState("");

  // Auth
  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) !== "true") router.replace("/personal");
    else setAuthed(true);
  }, [router]);

  // Font
  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@300;400;600&display=swap";
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, []);

  // Mute server — sync initial state on load (one-shot, no retry)
  useEffect(() => {
    muteApiFetch("/status/mute").then(state => {
      if (state === null) setMuteOffline(true);
      else { setMuted(state); setMuteOffline(false); }
    });
  }, []);

  // Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setZoneTimes(ZONES.map((z, i) => {
        if (i === 2) {
          const f = new Intl.DateTimeFormat("en-US", { timeZone: z.tz, hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }).format(now);
          const [tp, period = ""] = f.split(" ");
          const s = tp.split(":");
          return { hhmm: `${s[0]}:${s[1]}`, ss: s[2] || "00", ampm: period };
        }
        const f = new Intl.DateTimeFormat("en-US", { timeZone: z.tz, hour: "numeric", minute: "2-digit", hour12: true }).format(now);
        const [tp, period = ""] = f.split(" ");
        return { hhmm: tp, ss: "", ampm: period };
      }));
      setDateInfo({ day: DAYS[now.getDay()], date: `${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}` });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Calendar
  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
    const firstDay = new Date(y, m, 1).getDay();
    const total    = new Date(y, m + 1, 0).getDate();
    const days: CalDay[] = [];
    for (let i = 0; i < firstDay; i++) days.push({ num: null, isToday: false });
    for (let d = 1; d <= total; d++) days.push({ num: d, isToday: d === today });
    setCal({ month: MONTHS[m], year: String(y), days });
  }, []);

  // Weather (Open-Meteo, XHR for old iOS compat)
  useEffect(() => {
    const go = () => xhrGet(WEATHER_URL, (d) => { try { setWeather(parseWeather(d)); } catch {} }, () => {});
    go();
    const id = setInterval(go, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Todos
  useEffect(() => {
    setTodos({ trustage: loadTodos(TODO_KEY_TS), ucla: loadTodos(TODO_KEY_UCLA) });
  }, []);

  // Handlers
  const handleMute = async () => {
    const newState = await muteApiFetch("/run/mute", "POST");
    if (newState === null) {
      setMuteOffline(true);
    } else {
      setMuteOffline(false);
      setMuted(newState);
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const addTodo = (sec: "trustage" | "ucla", text: string) => {
    if (!text.trim()) return;
    const item: Todo = { id: Date.now().toString(), text: text.trim(), done: false };
    setTodos(p => {
      const n = { ...p, [sec]: [...p[sec], item] };
      saveTodos(sec === "trustage" ? TODO_KEY_TS : TODO_KEY_UCLA, n[sec]);
      return n;
    });
    sec === "trustage" ? setInputTS("") : setInputUCLA("");
  };

  const toggleTodo = (sec: "trustage" | "ucla", id: string) => {
    setTodos(p => {
      const n = { ...p, [sec]: p[sec].map(t => t.id === id ? { ...t, done: !t.done } : t) };
      saveTodos(sec === "trustage" ? TODO_KEY_TS : TODO_KEY_UCLA, n[sec]);
      return n;
    });
  };

  const deleteTodo = (sec: "trustage" | "ucla", id: string) => {
    setTodos(p => {
      const n = { ...p, [sec]: p[sec].filter(t => t.id !== id) };
      saveTodos(sec === "trustage" ? TODO_KEY_TS : TODO_KEY_UCLA, n[sec]);
      return n;
    });
  };

  if (!authed) return null;

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      <style>{ANIM}</style>

      {/* ── Weekly forecast popup ─────────────────────────────────────────── */}
      {showWeekly && (
        <div
          style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.72)", display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={() => setShowWeekly(false)}
        >
          <div
            style={{ ...card, background:T.popBg, width:"min(78vw,720px)", padding:"28px 32px", boxShadow:"0 40px 100px rgba(0,0,0,0.5)", maxHeight:"80vh", overflowY:"auto" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
              <div>
                <div style={{ fontSize:20, fontWeight:700, color:T.text }}>7-Day Forecast</div>
                <div style={{ fontSize:13, color:T.muted, marginTop:2 }}>Downingtown, PA</div>
              </div>
              <button onClick={() => setShowWeekly(false)} style={{ ...iconBtn({ width:36, height:36, borderRadius:10 }) }}>
                <X size={16} color={T.iconColor} />
              </button>
            </div>
            {weather?.daily.map((day, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 0", borderBottom: i < 6 ? `1px solid ${T.divider}` : "none" }}>
                <div style={{ width:56, fontSize:15, fontWeight:600, color:T.sub }}>{day.day}</div>
                <div style={{ fontSize:30, width:40 }}>{day.icon}</div>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:19, fontWeight:700, color:T.text }}>{day.highC}°C</span>
                  <span style={{ fontSize:12, color:T.muted }}> / {cToF(day.highC)}°F</span>
                </div>
                <div style={{ fontSize:14, color:T.muted }}>{day.lowC}°C<span style={{ fontSize:11 }}> / {cToF(day.lowC)}°F</span></div>
                <div style={{ display:"flex", alignItems:"center", gap:5, width:80 }}>
                  <span style={{ fontSize:14 }}>💧</span>
                  <div style={{ flex:1, height:5, borderRadius:3, background:"rgba(96,165,250,0.18)", overflow:"hidden" }}>
                    <div style={{ width:`${day.precip}%`, height:"100%", background:"#60a5fa", borderRadius:3 }} />
                  </div>
                  <span style={{ fontSize:12, color:"#60a5fa", minWidth:28 }}>{day.precip}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Todo popup ────────────────────────────────────────────────────── */}
      {todoPopup && (() => {
        const sec   = todoPopup;
        const color = sec === "trustage" ? "#60a5fa" : "#a78bfa";
        const label = sec === "trustage" ? "TruStage" : "UCLA";
        const emoji = sec === "trustage" ? "🏢" : "🎓";
        const inputVal = sec === "trustage" ? inputTS : inputUCLA;
        const setInput = sec === "trustage" ? setInputTS : setInputUCLA;
        return (
          <div
            style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.78)", display:"flex", alignItems:"center", justifyContent:"center" }}
            onClick={() => setTodoPopup(null)}
          >
            <div
              style={{ ...card, background:T.popBg, width:"min(70vw,660px)", maxHeight:"82vh", display:"flex", flexDirection:"column", padding:"26px 30px", boxShadow:"0 40px 100px rgba(0,0,0,0.6)" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:26 }}>{emoji}</span>
                  <span style={{ fontSize:22, fontWeight:700, color }}>{label}</span>
                </div>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <span style={{ fontSize:14, color:T.muted }}>{todos[sec].filter(t=>!t.done).length} remaining</span>
                  <button onClick={() => setTodoPopup(null)} style={{ ...iconBtn({ width:38, height:38, borderRadius:11 }) }}>
                    <X size={17} color={T.iconColor} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:2 }}>
                {todos[sec].length === 0 && (
                  <div style={{ fontSize:16, color:T.muted, textAlign:"center", marginTop:36, opacity:0.6 }}>
                    No tasks yet — add one below
                  </div>
                )}
                {todos[sec].map(todo => (
                  <div key={todo.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 6px", borderBottom:`1px solid ${T.divider}` }}>
                    <button
                      onClick={() => toggleTodo(sec, todo.id)}
                      style={{ flexShrink:0, width:30, height:30, borderRadius:9, border:`2px solid ${todo.done ? color : T.border}`, background: todo.done ? color : "transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", touchAction:"manipulation" }}
                    >
                      {todo.done && <span style={{ color:"#fff", fontSize:16, fontWeight:800, lineHeight:1 }}>✓</span>}
                    </button>
                    <span style={{ flex:1, fontSize:20, fontWeight:500, color: todo.done ? T.todoDoneTxt : T.text, textDecoration: todo.done ? "line-through" : "none", lineHeight:1.4 }}>
                      {todo.text}
                    </span>
                    <button onClick={() => deleteTodo(sec, todo.id)} style={{ flexShrink:0, background:"none", border:"none", cursor:"pointer", color:T.muted, opacity:0.5, padding:"0 4px", touchAction:"manipulation" }}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add input */}
              <div style={{ display:"flex", gap:10, marginTop:18, paddingTop:16, borderTop:`1px solid ${T.divider}` }}>
                <input
                  value={inputVal}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addTodo(sec, inputVal); }}
                  placeholder="Add new task…"
                  style={{ flex:1, background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:12, padding:"13px 16px", color:T.text, fontSize:17, outline:"none", caretColor:color }}
                />
                <button
                  onClick={() => addTodo(sec, inputVal)}
                  style={{ flexShrink:0, width:48, height:48, borderRadius:13, background:color, border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", touchAction:"manipulation" }}
                >
                  <Plus size={22} color="#fff" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Mute toast ────────────────────────────────────────────────────── */}
      {showToast && (
        <div style={{ position:"fixed", bottom:30, left:"50%", transform:"translateX(-50%)", zIndex:600, background:"rgba(30,20,60,0.92)", color:"#fff", padding:"10px 20px", borderRadius:12, fontSize:13, border:"1px solid rgba(255,255,255,0.12)", animation:"toast-slide 2.5s ease forwards", whiteSpace:"nowrap" }}>
          {muteOffline ? "🔌 Mute server offline — is Flask running on :5051?" : muted ? "🔇 Muted" : "🔊 Unmuted"}
        </div>
      )}

      {/* ── Ambient orbs ──────────────────────────────────────────────────── */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle, rgba(124,90,245,0.35), transparent 70%)", top:-250, left:-200, animation:"orb-pulse 8s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(244,114,182,0.28), transparent 70%)", bottom:-150, right:100, animation:"orb-pulse 11s ease-in-out infinite 3s" }} />
        <div style={{ position:"absolute", width:380, height:380, borderRadius:"50%", background:"radial-gradient(circle, rgba(52,211,153,0.20), transparent 70%)", top:"40%", right:-100, animation:"orb-pulse 9s ease-in-out infinite 5s" }} />
      </div>

      {/* ── Star dots ─────────────────────────────────────────────────────── */}
      {[[8,12],[15,88],[22,35],[35,7],[42,65],[55,22],[62,80],[70,45],[78,15],[85,72],[92,38],[5,55],[48,92],[88,5]].map(([l,t],i) => (
        <div key={i} style={{ position:"fixed", left:`${l}%`, top:`${t}%`, width:i%3===0?3:2, height:i%3===0?3:2, borderRadius:"50%", background:"#fff", opacity:0.3, pointerEvents:"none", zIndex:0, animation:`twinkle ${2.5+i*0.4}s ease-in-out infinite ${i*0.3}s` }} />
      ))}

      {/* ══ PAGE SHELL — column: [content row] + [dock banner] ═══════════════ */}
      <div style={{ display:"flex", flexDirection:"column", width:"100vw", height:"100vh", overflow:"hidden", background:T.bg, color:T.text, fontFamily:"'Inter',-apple-system,sans-serif", userSelect:"none", WebkitUserSelect:"none", position:"relative", zIndex:1 }}>

        {/* ── TOP CONTENT (flex:1) ─────────────────────────────────────────── */}
        <div style={{ flex:1, display:"flex", gap:10, padding:"14px 14px 0 14px", minHeight:0, overflow:"hidden" }}>

          {/* LEFT MAIN ~68% */}
          <div style={{ flex:"0 0 68%", display:"flex", flexDirection:"column", gap:10, minWidth:0, minHeight:0, overflow:"hidden" }}>

            {/* Top bar: Hub | Date | Mute */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
              <button onClick={() => router.push("/personal")} style={{ ...iconBtn({ padding:"7px 14px", borderRadius:11, fontSize:12 }), display:"flex", alignItems:"center", gap:6 }}>
                <ArrowLeft size={12} color={T.iconColor} />
                <span style={{ color:T.iconColor }}>Hub</span>
              </button>

              <div style={{ fontSize:"clamp(11px,1.1vw,15px)", color:T.muted, letterSpacing:"1.5px", textTransform:"uppercase" }}>
                {dateInfo.day} · {dateInfo.date}
              </div>

              <button
                onClick={handleMute}
                title={muteOffline ? "Mute server offline" : muted ? "Unmute" : "Mute"}
                style={{
                  ...iconBtn({
                    width:58, height:58, borderRadius:16,
                    background: muteOffline ? "rgba(255,255,255,0.03)"
                              : muted       ? "rgba(248,113,113,0.18)"
                              :               T.iconBtn,
                    border:     muteOffline ? "1px solid rgba(255,255,255,0.06)"
                              : muted       ? "1px solid rgba(248,113,113,0.45)"
                              :               `1px solid ${T.iconBtnBrd}`,
                    opacity: muteOffline ? 0.45 : 1,
                  }),
                  animation: (!muteOffline && muted) ? "mute-ring 2s ease-in-out infinite" : "none",
                }}
              >
                {muteOffline
                  ? <WifiOff size={22} color="rgba(255,255,255,0.3)" />
                  : muted
                    ? <VolumeX size={24} color="#f87171" />
                    : <Volume2 size={24} color={T.iconColor} />
                }
              </button>
            </div>

            {/* CLOCKS: PST+CST stacked | EST big */}
            <div style={{ flex:"1.7", display:"grid", gridTemplateColumns:"0.6fr 1fr", gap:10, minHeight:0 }}>

              {/* PST + CST */}
              <div style={{ ...card, display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>
                {[0,1].map((i) => (
                  <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", padding:"14px 16px", borderBottom: i === 0 ? `1px solid ${T.border}` : "none", position:"relative", overflow:"hidden" }}>
                    <div style={{ position:"absolute", left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${ZONES[i].color}55,transparent)`, animation:`scan-line ${6+i}s linear infinite ${i*2}s`, pointerEvents:"none" }} />
                    <div style={{ position:"absolute", top:10, right:12, width:6, height:6, borderRadius:"50%", background:ZONES[i].color, boxShadow:`0 0 10px ${ZONES[i].color}`, animation:`twinkle 2s ease-in-out infinite ${i*0.7}s` }} />
                    <div style={{ fontSize:"clamp(10px,1.3vw,17px)", fontWeight:800, color:ZONES[i].color, letterSpacing:"0.32em", textTransform:"uppercase", marginBottom:6, textShadow:`0 0 18px ${ZONES[i].color}` }}>{ZONES[i].label}</div>
                    <div style={{ fontFamily:"'Orbitron','Courier New',monospace", fontSize:"clamp(30px,3.8vw,58px)", fontWeight:900, letterSpacing:2, lineHeight:1, color:T.text, filter:`drop-shadow(0 0 20px ${ZONES[i].glow})`, whiteSpace:"nowrap" }}>{zoneTimes[i].hhmm}</div>
                    <div style={{ fontSize:"clamp(10px,1.2vw,16px)", fontWeight:700, color:ZONES[i].color, letterSpacing:"0.2em", marginTop:5, opacity:0.85 }}>{zoneTimes[i].ampm}</div>
                    <div style={{ fontSize:"clamp(9px,0.9vw,13px)", color:T.muted, letterSpacing:"2px", textTransform:"uppercase", marginTop:6 }}>{ZONES[i].city}</div>
                  </div>
                ))}
              </div>

              {/* EST */}
              <div style={{ ...card, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", position:"relative", overflow:"hidden", boxShadow:`0 0 80px ${ZONES[2].glow}22, inset 0 1px 0 ${ZONES[2].color}15` }}>
                <div style={{ position:"absolute", left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${ZONES[2].color}55,transparent)`, animation:"scan-line 8s linear infinite 4s", pointerEvents:"none" }} />
                <div style={{ position:"absolute", top:14, right:18, width:9, height:9, borderRadius:"50%", background:ZONES[2].color, boxShadow:`0 0 16px ${ZONES[2].color}`, animation:"twinkle 2s ease-in-out infinite 1.4s" }} />
                <div style={{ fontSize:"clamp(15px,2vw,28px)", fontWeight:800, color:ZONES[2].color, letterSpacing:"0.35em", textTransform:"uppercase", marginBottom:"clamp(10px,2vh,22px)", textShadow:`0 0 28px ${ZONES[2].color}` }}>EST</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:"clamp(4px,0.5vw,8px)" }}>
                  <span style={{ fontFamily:"'Orbitron','Courier New',monospace", fontSize:"clamp(58px,7.5vw,110px)", fontWeight:900, letterSpacing:3, lineHeight:1, color:T.text, filter:`drop-shadow(0 0 36px ${ZONES[2].glow})`, whiteSpace:"nowrap" }}>{zoneTimes[2].hhmm}</span>
                  <span style={{ fontFamily:"'Orbitron','Courier New',monospace", fontSize:"clamp(22px,3vw,44px)", fontWeight:700, color:ZONES[2].color, opacity:0.75, whiteSpace:"nowrap", marginBottom:"clamp(4px,0.5vh,8px)" }}>:{zoneTimes[2].ss}</span>
                </div>
                <div style={{ fontSize:"clamp(14px,1.8vw,26px)", fontWeight:700, color:ZONES[2].color, letterSpacing:"0.2em", marginTop:"clamp(6px,1vh,14px)", opacity:0.85 }}>{zoneTimes[2].ampm}</div>
                <div style={{ fontSize:"clamp(10px,1.2vw,16px)", color:T.muted, letterSpacing:"3px", textTransform:"uppercase", marginTop:"clamp(10px,1.8vh,20px)" }}>New York</div>
              </div>
            </div>

            {/* MIDDLE: Weather | Calendar */}
            <div style={{ flex:"1", display:"grid", gridTemplateColumns:"0.85fr 1.15fr", gap:10, minHeight:0 }}>

              {/* Weather */}
              <div onClick={() => weather && setShowWeekly(true)} style={{ ...card, padding:"clamp(10px,1.4vh,16px) clamp(10px,1.4vw,16px)", display:"flex", flexDirection:"column", cursor: weather ? "pointer" : "default", overflow:"hidden" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
                  <div style={{ fontSize:"clamp(38px,5vw,62px)", lineHeight:1, flexShrink:0 }}>{weather?.icon ?? "🌤"}</div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"baseline", gap:8, flexWrap:"wrap" }}>
                      <span style={{ fontSize:"clamp(32px,4.2vw,58px)", fontWeight:700, lineHeight:1, color:T.text }}>{weather?.tempC ?? "--"}°C</span>
                      <span style={{ fontSize:"clamp(16px,2vw,24px)", color:T.muted, fontWeight:500 }}>{weather ? cToF(weather.tempC) : "--"}°F</span>
                    </div>
                    <div style={{ fontSize:"clamp(13px,1.5vw,18px)", fontWeight:600, color:T.sub, marginTop:3 }}>{weather?.desc ?? "Loading…"}</div>
                    <div style={{ fontSize:"clamp(10px,1.1vw,13px)", color:T.muted, marginTop:2 }}>Downingtown, PA</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:"clamp(12px,1.8vw,22px)", marginTop:"clamp(6px,1vh,10px)", flexShrink:0 }}>
                  {([["Feels like", `${weather?.feelsC ?? "--"}°C`], ["Wind", `${weather?.windMph ?? "--"} mph`], ["Humidity", `${weather?.humidity ?? "--"}%`]] as [string,string][]).map(([lbl, val]) => (
                    <div key={lbl}>
                      <div style={{ fontSize:"clamp(13px,1.5vw,18px)", fontWeight:700, color:T.text }}>{val}</div>
                      <div style={{ fontSize:"clamp(9px,1vw,12px)", color:T.muted, textTransform:"uppercase", letterSpacing:"0.5px", marginTop:1 }}>{lbl}</div>
                    </div>
                  ))}
                </div>
                {weather && <div style={{ fontSize:"clamp(9px,1vw,12px)", color:T.muted, opacity:0.5, marginTop:"clamp(3px,0.5vh,6px)" }}>TAP FOR WEEKLY FORECAST ▸</div>}
                <div style={{ flex:1, display:"flex", overflowX:"auto", gap:"clamp(6px,1vw,14px)", marginTop:"clamp(6px,1vh,10px)", paddingBottom:4, alignItems:"flex-start" }}>
                  {(weather?.hourly ?? []).map((h, i) => (
                    <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, flexShrink:0, minWidth:"clamp(40px,5vw,58px)" }}>
                      <div style={{ fontSize:"clamp(10px,1.2vw,14px)", color:T.muted, whiteSpace:"nowrap", fontWeight:500 }}>{h.label}</div>
                      <div style={{ fontSize:"clamp(22px,3vw,36px)", lineHeight:1 }}>{h.icon}</div>
                      <div style={{ fontSize:"clamp(12px,1.4vw,16px)", fontWeight:700, color:T.text }}>{h.tempC}°</div>
                      <div style={{ width:"clamp(26px,3vw,36px)", height:3, borderRadius:2, background:"rgba(96,165,250,0.15)", overflow:"hidden" }}>
                        <div style={{ width:`${h.precip}%`, height:"100%", background:"#60a5fa", borderRadius:2 }} />
                      </div>
                      {h.precip > 5 && <div style={{ fontSize:"clamp(9px,1vw,12px)", color:"#60a5fa", fontWeight:600 }}>{h.precip}%</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar */}
              <div style={{ ...card, padding:"clamp(12px,1.8vh,20px) clamp(12px,1.8vw,22px)", display:"flex", flexDirection:"column" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:"clamp(8px,1.2vh,14px)", flexShrink:0 }}>
                  <div style={{ fontSize:"clamp(14px,1.7vw,22px)", fontWeight:700, letterSpacing:"clamp(2px,0.3vw,4px)", textTransform:"uppercase", color:T.text }}>{cal.month}</div>
                  <div style={{ fontSize:"clamp(11px,1.3vw,17px)", color:T.muted }}>{cal.year}</div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:"clamp(2px,0.3vw,5px)", flex:1, alignContent:"start" }}>
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map(h => (
                    <div key={h} style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"clamp(20px,2.2vh,28px)", fontSize:"clamp(9px,1vw,13px)", color:T.muted, fontWeight:600 }}>{h}</div>
                  ))}
                  {cal.days.map((d, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"clamp(34px,4vh,52px)", fontSize:"clamp(14px,1.7vw,22px)", borderRadius:"clamp(7px,0.8vw,12px)", color: d.num ? (d.isToday ? "#fff" : T.sub) : "transparent", background: d.isToday ? "rgba(124,90,245,0.85)" : "transparent", fontWeight: d.isToday ? 700 : 400, boxShadow: d.isToday ? "0 0 18px rgba(124,90,245,0.6)" : "none" }}>{d.num}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT TODO SIDEBAR ~30% — tap card to open popup */}
          <div style={{ flex:"0 0 30%", display:"flex", flexDirection:"column", gap:10, minWidth:0, minHeight:0, overflow:"hidden" }}>
            {(["trustage","ucla"] as const).map(sec => {
              const color = sec === "trustage" ? "#60a5fa" : "#a78bfa";
              const label = sec === "trustage" ? "TruStage" : "UCLA";
              const emoji = sec === "trustage" ? "🏢" : "🎓";
              return (
                <div
                  key={sec}
                  onClick={() => setTodoPopup(sec)}
                  style={{ ...card, flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minHeight:0, cursor:"pointer" }}
                >
                  {/* Section header */}
                  <div style={{ padding:"14px 16px 10px", borderBottom:`1px solid ${T.divider}`, flexShrink:0, display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:18 }}>{emoji}</span>
                    <span style={{ fontSize:"clamp(13px,1.4vw,18px)", fontWeight:700, color, letterSpacing:"0.5px" }}>{label}</span>
                    <span style={{ marginLeft:"auto", fontSize:"clamp(10px,1vw,13px)", color:T.muted }}>{todos[sec].filter(t=>!t.done).length} left</span>
                    <span style={{ fontSize:12, color:T.muted, opacity:0.45 }}>▶</span>
                  </div>

                  {/* Preview list — not interactive, tap card to expand */}
                  <div style={{ flex:1, padding:"8px 14px 10px", display:"flex", flexDirection:"column", gap:6, overflow:"hidden" }}>
                    {todos[sec].length === 0 && (
                      <div style={{ fontSize:"clamp(11px,1.1vw,14px)", color:T.muted, textAlign:"center", marginTop:18, opacity:0.5 }}>Tap to add tasks</div>
                    )}
                    {todos[sec].slice(0, 7).map(todo => (
                      <div key={todo.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ flexShrink:0, width:14, height:14, borderRadius:4, border:`1.5px solid ${todo.done ? color : T.border}`, background: todo.done ? color : "transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {todo.done && <span style={{ color:"#fff", fontSize:9, lineHeight:1 }}>✓</span>}
                        </div>
                        <span style={{ fontSize:"clamp(13px,1.4vw,17px)", color: todo.done ? T.todoDoneTxt : T.text, textDecoration: todo.done ? "line-through" : "none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {todo.text}
                        </span>
                      </div>
                    ))}
                    {todos[sec].length > 7 && (
                      <div style={{ fontSize:"clamp(10px,1vw,12px)", color:T.muted, opacity:0.4, marginTop:2 }}>+{todos[sec].length - 7} more…</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── FULL-WIDTH DOCK BANNER ────────────────────────────────────────── */}
        <div style={{ ...card, margin:"10px 14px 14px", flexShrink:0, height:"clamp(78px,9vh,110px)", display:"flex", alignItems:"center", justifyContent:"center", gap:"clamp(4px,1.8vw,22px)", padding:"0 clamp(14px,2.5vw,32px)" }}>
          {SHORTCUTS.map(s => (
            <button
              key={s.label}
              onClick={() => openMain(s.url)}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"clamp(3px,0.5vh,6px)", background:"none", border:"none", color:T.text, padding:"6px clamp(6px,1.2vw,14px)", borderRadius:14, cursor:"pointer", WebkitTapHighlightColor:"transparent", transition:"transform 0.15s ease", touchAction:"manipulation" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.18) translateY(-5px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) translateY(0)"; }}
            >
              <div style={{ width:"clamp(40px,5.2vw,64px)", height:"clamp(40px,5.2vw,64px)", borderRadius:"clamp(10px,1.2vw,16px)", background:T.inputBg, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"clamp(20px,3vw,38px)", lineHeight:1 }}>
                {s.emoji}
              </div>
              <div style={{ fontSize:"clamp(8px,0.9vw,12px)", color:T.muted, whiteSpace:"nowrap" }}>{s.label}</div>
            </button>
          ))}
        </div>

      </div>
    </>
  );
}
