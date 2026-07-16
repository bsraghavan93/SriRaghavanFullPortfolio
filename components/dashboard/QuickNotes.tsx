"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  X,
  MoreHorizontal,
  Check,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useNotes } from "@/hooks/useNotes";
import { NoteEditor } from "./NoteEditor";
import {
  SECTION_COLORS,
  SECTION_ICONS,
  PRIORITY_CONFIG,
} from "@/lib/notes-types";
import type { Note, NoteSection, Priority } from "@/lib/notes-types";

const T = {
  bg: "linear-gradient(145deg, #04071a 0%, #0b0420 50%, #060e1c 100%)",
  card: "rgba(10,6,28,0.92)",
  cardHover: "rgba(20,12,44,0.95)",
  border: "rgba(255,255,255,0.08)",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.35)",
  sub: "rgba(255,255,255,0.60)",
  inputBg: "rgba(255,255,255,0.07)",
  divider: "rgba(255,255,255,0.07)",
  sidebar: "rgba(4,3,16,0.85)",
};

const card: React.CSSProperties = {
  background: T.card,
  border: `1px solid ${T.border}`,
  borderRadius: 20,
};

// ── Add/Edit Section Modal ──────────────────────────────────────────────────
function SectionModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Partial<NoteSection>;
  onSave: (data: { title: string; color: string; icon: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [color, setColor] = useState(initial?.color ?? SECTION_COLORS[2]);
  const [icon, setIcon] = useState(initial?.icon ?? "FileText");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try { await onSave({ title: title.trim(), color, icon }); onClose(); }
    finally { setSaving(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        style={{ ...card, width: "min(400px,100%)", padding: 28, backdropFilter: "blur(24px)" }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 22 }}>
          {initial?.id ? "Edit Section" : "New Section"}
        </h3>

        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") onClose(); }}
          placeholder="Section name…"
          style={{
            width: "100%", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 12,
            padding: "12px 16px", color: T.text, fontSize: 15, outline: "none", caretColor: "#7c5af5", marginBottom: 18,
          }}
        />

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: T.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Color</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SECTION_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 28, height: 28, borderRadius: "50%", background: c, border: color === c ? "3px solid #fff" : "3px solid transparent",
                  cursor: "pointer", transition: "transform 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <p style={{ fontSize: 12, color: T.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Icon</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxHeight: 100, overflowY: "auto" }}>
            {Object.entries(SECTION_ICONS).map(([key, emoji]) => (
              <button
                key={key}
                onClick={() => setIcon(key)}
                style={{
                  width: 36, height: 36, borderRadius: 10, background: icon === key ? "rgba(124,90,245,0.25)" : T.inputBg,
                  border: icon === key ? "1px solid rgba(124,90,245,0.5)" : `1px solid ${T.border}`,
                  fontSize: 18, cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px 0", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 12, color: T.muted, fontSize: 14, cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!title.trim() || saving}
            style={{
              flex: 1, padding: "12px 0", background: title.trim() ? "#7c5af5" : "rgba(124,90,245,0.3)",
              border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: title.trim() ? "pointer" : "default", transition: "opacity 0.15s",
            }}
          >
            {saving ? "Saving…" : (initial?.id ? "Save" : "Create")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Note Card ─────────────────────────────────────────────────────────────
function NoteCard({
  note,
  section,
  onEdit,
  onPin,
  onArchive,
  onDelete,
  onToggleItem,
}: {
  note: Note;
  section: NoteSection;
  onEdit: () => void;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onToggleItem: (itemId: string, completed: boolean) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const activeItems = (note.checklist_items ?? []).filter((i) => !i.completed);
  const completedItems = (note.checklist_items ?? []).filter((i) => i.completed);
  const previewItems = (note.checklist_items ?? []).slice(0, 5);
  const hasUrgent = activeItems.some((i) => i.priority === "urgent");
  const hasHigh = activeItems.some((i) => i.priority === "high");
  const topPriority = hasUrgent ? "urgent" : hasHigh ? "high" : null;
  const dueToday = (note.checklist_items ?? []).some(
    (i) => !i.completed && i.due_date === new Date().toISOString().slice(0, 10)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      style={{
        ...card,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.2s",
        borderLeft: `3px solid ${note.color ?? section.color}`,
        position: "relative",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = section.color;
        (e.currentTarget as HTMLElement).style.background = T.cardHover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = T.border;
        (e.currentTarget as HTMLElement).style.background = T.card;
      }}
      onClick={onEdit}
    >
      {/* Priority strip */}
      {topPriority && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            padding: "3px 10px",
            background: topPriority === "urgent" ? "rgba(239,68,68,0.15)" : "rgba(249,115,22,0.15)",
            borderBottom: `1px solid ${PRIORITY_CONFIG[topPriority].color}33`,
            borderLeft: `1px solid ${PRIORITY_CONFIG[topPriority].color}33`,
            borderBottomLeftRadius: 10,
            fontSize: 10,
            color: PRIORITY_CONFIG[topPriority].color,
            fontWeight: 600,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          {PRIORITY_CONFIG[topPriority].emoji} {PRIORITY_CONFIG[topPriority].label}
        </div>
      )}

      <div style={{ padding: "14px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
          <div style={{ minWidth: 0 }}>
            {note.pinned && <span style={{ fontSize: 12, marginRight: 5 }}>📌</span>}
            {dueToday && <span style={{ fontSize: 11, color: "#60a5fa", marginRight: 5 }}>📅 Due today</span>}
            <h3
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: T.text,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              }}
            >
              {note.title || (note.type === "checklist" ? "Checklist" : "Note")}
            </h3>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v); }}
            style={{ flexShrink: 0, background: "none", border: "none", color: T.muted, cursor: "pointer", padding: "2px 4px", lineHeight: 0, borderRadius: 6 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <MoreHorizontal size={15} />
          </button>

          {/* Context menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  top: 40,
                  right: 12,
                  zIndex: 100,
                  background: "rgba(14,8,36,0.98)",
                  border: `1px solid ${T.border}`,
                  borderRadius: 14,
                  padding: "6px",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                  minWidth: 150,
                  backdropFilter: "blur(16px)",
                }}
              >
                {[
                  { label: note.pinned ? "Unpin" : "Pin", icon: "📌", action: onPin },
                  { label: "Archive", icon: "🗄", action: onArchive },
                  { label: "Delete", icon: "🗑", action: onDelete, danger: true },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { item.action(); setShowMenu(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "9px 12px",
                      background: "none",
                      border: "none",
                      borderRadius: 9,
                      color: item.danger ? "#f87171" : T.sub,
                      fontSize: 13,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = item.danger ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <span>{item.icon}</span> {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content preview */}
        {note.type === "checklist" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {previewItems.map((item) => (
              <div
                key={item.id}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
                onClick={(e) => { e.stopPropagation(); onToggleItem(item.id, !item.completed); }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 16,
                    height: 16,
                    borderRadius: 5,
                    border: `1.5px solid ${item.completed ? PRIORITY_CONFIG[item.priority].color : "rgba(255,255,255,0.2)"}`,
                    background: item.completed ? PRIORITY_CONFIG[item.priority].color : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {item.completed && <Check size={9} color="#fff" strokeWidth={3} />}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    color: item.completed ? "rgba(255,255,255,0.22)" : T.sub,
                    textDecoration: item.completed ? "line-through" : "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.text}
                </span>
              </div>
            ))}
            {(note.checklist_items ?? []).length > 5 && (
              <p style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                +{(note.checklist_items ?? []).length - 5} more…
              </p>
            )}
          </div>
        ) : (
          note.content && (
            <p
              style={{
                fontSize: 13,
                color: T.muted,
                lineHeight: 1.55,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
              }}
            >
              {note.content}
            </p>
          )
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
            {note.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: "rgba(124,90,245,0.15)",
                  border: "1px solid rgba(124,90,245,0.25)",
                  borderRadius: 20,
                  padding: "2px 8px",
                  fontSize: 10,
                  color: "#c4b5fd",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
            paddingTop: 10,
            borderTop: `1px solid ${T.divider}`,
          }}
        >
          <div style={{ display: "flex", gap: 8, fontSize: 11, color: T.muted }}>
            {note.type === "checklist" && (
              <span>{completedItems.length}/{(note.checklist_items ?? []).length} done</span>
            )}
            <span>
              {new Date(note.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main QuickNotes ────────────────────────────────────────────────────────
type ViewFilter = "all" | "today" | "pinned" | "archive" | string;

export function QuickNotes() {
  const {
    sections, notes, loading, error,
    addSection, updateSection, deleteSection,
    addNote, updateNote, deleteNote,
    addItem, updateItem, deleteItem, reorderItems,
  } = useNotes();

  const [activeView, setActiveView] = useState<ViewFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "created" | "title">("updated");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [sectionModal, setSectionModal] = useState<{ open: boolean; section?: NoteSection }>({ open: false });
  const [sectionMenuId, setSectionMenuId] = useState<string | null>(null);

  // Detect mobile and auto-close sidebar on small screens
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const activeSections = sections.filter((s) => !s.archived);
  const archivedSections = sections.filter((s) => s.archived);

  const todayStr = new Date().toISOString().slice(0, 10);

  const todayCount = useMemo(() => {
    return notes
      .filter((n) => !n.archived)
      .flatMap((n) => n.checklist_items ?? [])
      .filter((i) => !i.completed && i.due_date === todayStr).length;
  }, [notes, todayStr]);

  const pinnedCount = useMemo(() => notes.filter((n) => n.pinned && !n.archived).length, [notes]);

  const filteredNotes = useMemo(() => {
    let result = [...notes];

    if (activeView === "all") result = result.filter((n) => !n.archived);
    else if (activeView === "today") {
      result = result.filter(
        (n) =>
          !n.archived &&
          (n.checklist_items ?? []).some((i) => !i.completed && i.due_date === todayStr)
      );
    } else if (activeView === "pinned") result = result.filter((n) => n.pinned && !n.archived);
    else if (activeView === "archive") result = result.filter((n) => n.archived);
    else result = result.filter((n) => n.section_id === activeView && !n.archived);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.includes(q)) ||
          (n.checklist_items ?? []).some((i) => i.text.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === "updated") return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      if (sortBy === "created") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return a.title.localeCompare(b.title);
    });

    // Pinned always first
    return [...result.filter((n) => n.pinned), ...result.filter((n) => !n.pinned)];
  }, [notes, activeView, searchQuery, sortBy, todayStr]);

  const activeSectionForView =
    activeView !== "all" && activeView !== "today" && activeView !== "pinned" && activeView !== "archive"
      ? sections.find((s) => s.id === activeView)
      : null;

  const handleAddNote = async () => {
    const sectionId = activeSectionForView?.id ?? activeSections[0]?.id;
    if (!sectionId) return;
    const note = await addNote(sectionId);
    setEditingNote({ ...note, checklist_items: [] });
  };

  const handleArchiveNote = async (id: string) => {
    await updateNote(id, { archived: true });
    if (editingNote?.id === id) setEditingNote(null);
  };

  const getNoteSection = (note: Note) =>
    sections.find((s) => s.id === note.section_id) ?? sections[0];

  const syncEditingNote = (updatedNote?: Partial<Note>) => {
    if (!editingNote) return;
    setEditingNote((prev) => prev ? { ...prev, ...updatedNote } : null);
  };

  const refreshedEditingNote = useMemo(
    () => editingNote ? notes.find((n) => n.id === editingNote.id) ?? editingNote : null,
    [notes, editingNote]
  );

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, textAlign: "center", padding: 24 }}>
        <span style={{ fontSize: 48 }}>🔌</span>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>Supabase Not Configured</h2>
        <p style={{ color: "rgba(255,255,255,0.45)", maxWidth: 380, lineHeight: 1.6 }}>
          Add <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>NEXT_PUBLIC_SUPABASE_URL</code> and <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment variables, then run the SQL setup query.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid rgba(124,90,245,0.3)", borderTop: "3px solid #7c5af5", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: T.muted, fontSize: 14 }}>Loading notes…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, textAlign: "center" }}>
        <span style={{ fontSize: 36 }}>⚠️</span>
        <p style={{ color: "#f87171", fontSize: 14 }}>{error}</p>
      </div>
    );
  }

  const SMART_VIEWS = [
    { id: "all", label: "All Notes", icon: "📋", count: notes.filter((n) => !n.archived).length },
    { id: "today", label: "Due Today", icon: "📅", count: todayCount },
    { id: "pinned", label: "Pinned", icon: "📌", count: pinnedCount },
    { id: "archive", label: "Archive", icon: "🗄", count: notes.filter((n) => n.archived).length },
  ];

  return (
    <div style={{ display: "flex", height: "100%", fontFamily: "var(--font-sans), -apple-system, sans-serif", color: T.text, position: "relative", overflow: "hidden" }}>

      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 40 }}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <motion.div
        initial={false}
        animate={
          isMobile
            ? { x: sidebarOpen ? 0 : -280 }
            : { width: sidebarOpen ? 220 : 0 }
        }
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        style={{
          ...(isMobile
            ? { position: "absolute", top: 0, left: 0, height: "100%", width: 260, zIndex: 50 }
            : { position: "relative", overflow: "hidden", flexShrink: 0 }),
          background: T.sidebar,
          borderRight: `1px solid ${T.divider}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "14px 14px 12px", borderBottom: `1px solid ${T.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexShrink: 0 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text, letterSpacing: "-0.3px", whiteSpace: "nowrap", overflow: "hidden" }}>📝 Quick Notes</h2>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "none", color: T.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
          {/* Smart views */}
          <div style={{ marginBottom: 8 }}>
            {SMART_VIEWS.map((view) => (
              <button
                key={view.id}
                onClick={() => { setActiveView(view.id); if (isMobile) setSidebarOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: activeView === view.id ? "rgba(124,90,245,0.2)" : "transparent",
                  border: "none",
                  color: activeView === view.id ? "#c4b5fd" : T.muted,
                  fontSize: 13,
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 8,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { if (activeView !== view.id) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { if (activeView !== view.id) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 14 }}>{view.icon}</span>
                <span style={{ flex: 1 }}>{view.label}</span>
                {view.count > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      background: activeView === view.id ? "rgba(124,90,245,0.35)" : "rgba(255,255,255,0.08)",
                      borderRadius: 20,
                      padding: "1px 6px",
                      color: activeView === view.id ? "#c4b5fd" : T.muted,
                    }}
                  >
                    {view.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ height: 1, background: T.divider, margin: "8px 4px" }} />

          {/* Sections */}
          <p style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.8px", padding: "4px 10px 6px", fontWeight: 600 }}>
            Sections
          </p>
          {activeSections.map((section) => (
            <div key={section.id} style={{ position: "relative" }}>
              <button
                onClick={() => { setActiveView(section.id); if (isMobile) setSidebarOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: activeView === section.id ? "rgba(255,255,255,0.07)" : "transparent",
                  border: "none",
                  color: activeView === section.id ? T.text : T.muted,
                  fontSize: 13,
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 8,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { if (activeView !== section.id) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { if (activeView !== section.id) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: section.color, flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {SECTION_ICONS[section.icon] ?? "📄"} {section.title}
                </span>
                <span style={{ fontSize: 10, color: T.muted }}>
                  {notes.filter((n) => n.section_id === section.id && !n.archived).length}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setSectionMenuId((p) => p === section.id ? null : section.id); }}
                  style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", padding: "1px", lineHeight: 0, opacity: 0.5 }}
                >
                  <MoreHorizontal size={13} />
                </button>
              </button>

              <AnimatePresence>
                {sectionMenuId === section.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    style={{
                      position: "absolute",
                      left: "100%",
                      top: 0,
                      zIndex: 200,
                      background: "rgba(14,8,36,0.98)",
                      border: `1px solid ${T.border}`,
                      borderRadius: 12,
                      padding: "6px",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                      minWidth: 160,
                      backdropFilter: "blur(16px)",
                    }}
                  >
                    {[
                      {
                        label: "Edit", icon: "✏️",
                        action: () => { setSectionModal({ open: true, section }); setSectionMenuId(null); },
                      },
                      {
                        label: section.pinned ? "Unpin" : "Pin", icon: "📌",
                        action: () => { updateSection(section.id, { pinned: !section.pinned }); setSectionMenuId(null); },
                      },
                      {
                        label: "Archive", icon: "🗄",
                        action: () => { updateSection(section.id, { archived: true }); if (activeView === section.id) setActiveView("all"); setSectionMenuId(null); },
                      },
                      {
                        label: "Delete", icon: "🗑", danger: true,
                        action: () => { if (window.confirm(`Delete "${section.title}" and all its notes?`)) { deleteSection(section.id); if (activeView === section.id) setActiveView("all"); } setSectionMenuId(null); },
                      },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, width: "100%",
                          padding: "8px 12px", background: "none", border: "none", borderRadius: 8,
                          color: "danger" in item && item.danger ? "#f87171" : T.sub, fontSize: 13, cursor: "pointer",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "danger" in item && item.danger ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.06)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                      >
                        {item.icon} {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Add section */}
          <button
            onClick={() => setSectionModal({ open: true })}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "8px 10px", borderRadius: 10, background: "transparent",
              border: "none", color: "rgba(124,90,245,0.7)", fontSize: 13, cursor: "pointer",
              marginTop: 4, transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,90,245,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Plus size={13} />
            Add Section
          </button>
        </div>
      </motion.div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderBottom: `1px solid ${T.divider}`,
            flexShrink: 0,
          }}
        >
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}
            style={{
              flexShrink: 0,
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${T.border}`,
              color: T.muted,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = T.muted; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          >
            {sidebarOpen && !isMobile ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
          </button>

          {/* Section title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {activeSectionForView
                ? `${SECTION_ICONS[activeSectionForView.icon] ?? "📄"} ${activeSectionForView.title}`
                : SMART_VIEWS.find((v) => v.id === activeView)?.label ?? "Notes"}
            </h3>
          </div>

          {/* Search */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              style={{
                background: T.inputBg,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: "7px 10px 7px 28px",
                color: T.text,
                fontSize: 13,
                outline: "none",
                caretColor: "#7c5af5",
                width: isMobile ? 110 : 160,
                transition: "width 0.2s",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.muted, cursor: "pointer", lineHeight: 0 }}
              >
                <X size={11} />
              </button>
            )}
          </div>

          {/* Sort — hide label on mobile */}
          {!isMobile && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              style={{
                background: T.inputBg,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: "7px 10px",
                color: T.muted,
                fontSize: 13,
                cursor: "pointer",
                outline: "none",
                flexShrink: 0,
              }}
            >
              <option value="updated">Recent</option>
              <option value="created">Created</option>
              <option value="title">A–Z</option>
            </select>
          )}

          {/* Add note */}
          <button
            onClick={handleAddNote}
            disabled={activeSections.length === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "#7c5af5",
              border: "none",
              borderRadius: 10,
              padding: isMobile ? "8px 10px" : "8px 14px",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              flexShrink: 0,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Plus size={14} />
            {!isMobile && "Add Note"}
          </button>
        </div>

        {/* Notes Grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {filteredNotes.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 14,
                textAlign: "center",
                padding: 32,
              }}
            >
              <span style={{ fontSize: 52 }}>
                {searchQuery ? "🔍" : activeView === "today" ? "📅" : activeView === "pinned" ? "📌" : activeView === "archive" ? "🗄" : "✏️"}
              </span>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, color: T.sub, marginBottom: 6 }}>
                  {searchQuery ? "No results found" : "Nothing here yet"}
                </p>
                <p style={{ fontSize: 13, color: T.muted }}>
                  {searchQuery
                    ? `No notes match "${searchQuery}"`
                    : activeView === "all"
                    ? "Click + Add Note to create your first note"
                    : activeView === "today"
                    ? "No items due today 🎉"
                    : activeView === "pinned"
                    ? "Pin notes to see them here"
                    : "No archived notes"}
                </p>
              </div>
              {!searchQuery && activeView !== "archive" && activeSections.length === 0 && (
                <button
                  onClick={() => setSectionModal({ open: true })}
                  style={{
                    background: "#7c5af5", border: "none", borderRadius: 12,
                    padding: "10px 20px", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Create a Section First
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 12,
              }}
            >
              <AnimatePresence>
                {filteredNotes.map((note) => {
                  const sec = getNoteSection(note);
                  return (
                    <NoteCard
                      key={note.id}
                      note={note}
                      section={sec}
                      onEdit={() => setEditingNote(note)}
                      onPin={() => updateNote(note.id, { pinned: !note.pinned })}
                      onArchive={() => updateNote(note.id, { archived: true })}
                      onDelete={() => { if (window.confirm("Delete this note?")) deleteNote(note.id); }}
                      onToggleItem={(itemId, completed) => {
                        const item = (note.checklist_items ?? []).find((i) => i.id === itemId);
                        if (item) updateItem(itemId, note.id, { completed });
                      }}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ── Note Editor ── */}
      <AnimatePresence>
        {refreshedEditingNote && getNoteSection(refreshedEditingNote) && (
          <NoteEditor
            key={refreshedEditingNote.id}
            note={refreshedEditingNote}
            section={getNoteSection(refreshedEditingNote)}
            onClose={() => setEditingNote(null)}
            onUpdate={updateNote}
            onDelete={async (id) => { await deleteNote(id); setEditingNote(null); }}
            onArchive={async (id) => { await updateNote(id, { archived: true }); setEditingNote(null); }}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onDeleteItem={deleteItem}
            onReorderItems={reorderItems}
          />
        )}
      </AnimatePresence>

      {/* ── Section Modal ── */}
      <AnimatePresence>
        {sectionModal.open && (
          <SectionModal
            initial={sectionModal.section}
            onSave={async (data) => {
              if (sectionModal.section?.id) {
                await updateSection(sectionModal.section.id, data);
              } else {
                const newSec = await addSection(data);
                setActiveView(newSec.id);
              }
            }}
            onClose={() => setSectionModal({ open: false })}
          />
        )}
      </AnimatePresence>

      {/* Close section menu on outside click */}
      {sectionMenuId && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100 }}
          onClick={() => setSectionMenuId(null)}
        />
      )}
    </div>
  );
}
