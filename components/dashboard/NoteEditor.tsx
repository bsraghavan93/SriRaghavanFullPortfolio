"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import {
  X,
  Plus,
  Archive,
  GripVertical,
  Check,
  ChevronDown,
  ChevronRight,
  AlignLeft,
  CheckSquare,
  Trash2,
} from "lucide-react";
import type { Note, ChecklistItem, Priority, NoteSection } from "@/lib/notes-types";
import { SECTION_COLORS, PRIORITY_CONFIG, SECTION_ICONS } from "@/lib/notes-types";

// Extended palette — all SECTION_COLORS + more curated options
const ALL_COLORS = [
  ...SECTION_COLORS,
  "#ec4899", "#8b5cf6", "#06b6d4", "#10b981",
  "#dc2626", "#7c3aed", "#0891b2", "#059669",
  "#d97706", "#475569",
];

const T = {
  card: "rgba(10,6,28,0.98)",
  border: "rgba(255,255,255,0.08)",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.38)",
  sub: "rgba(255,255,255,0.60)",
  inputBg: "rgba(255,255,255,0.07)",
  divider: "rgba(255,255,255,0.07)",
};

// ── Checklist Item Row ─────────────────────────────────────────────────────
// Clean single-row: drag | checkbox | text | priority emoji (tap to cycle) | delete
function ChecklistRow({
  item,
  noteId,
  isMobile,
  onUpdate,
  onDelete,
}: {
  item: ChecklistItem;
  noteId: string;
  isMobile: boolean;
  onUpdate: (id: string, noteId: string, updates: Partial<ChecklistItem>) => Promise<void>;
  onDelete: (id: string, noteId: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const controls = useDragControls();

  useEffect(() => { setText(item.text); }, [item.text]);

  const save = () => {
    if (text.trim() && text !== item.text)
      onUpdate(item.id, noteId, { text: text.trim() });
    setEditing(false);
  };

  const cyclePriority = () => {
    const order: Priority[] = ["low", "normal", "high", "urgent"];
    const next = order[(order.indexOf(item.priority) + 1) % order.length];
    onUpdate(item.id, noteId, { priority: next });
  };

  const pc = PRIORITY_CONFIG[item.priority];

  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls} style={{ listStyle: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 0", borderBottom: `1px solid ${T.divider}` }}>
        {/* Drag handle — desktop only */}
        {!isMobile && (
          <div
            onPointerDown={(e) => controls.start(e)}
            style={{ cursor: "grab", color: "rgba(255,255,255,0.12)", flexShrink: 0, touchAction: "none", lineHeight: 0 }}
          >
            <GripVertical size={14} />
          </div>
        )}

        {/* Checkbox */}
        <button
          onClick={() => onUpdate(item.id, noteId, { completed: !item.completed })}
          style={{
            flexShrink: 0, width: 24, height: 24, borderRadius: 7,
            border: `2px solid ${item.completed ? pc.color : "rgba(255,255,255,0.18)"}`,
            background: item.completed ? pc.color : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", touchAction: "manipulation", transition: "all 0.15s",
          }}
        >
          {item.completed && <Check size={11} color="#fff" strokeWidth={3} />}
        </button>

        {/* Text */}
        {editing ? (
          <form style={{ flex: 1 }} onSubmit={(e) => { e.preventDefault(); save(); }}>
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={save}
              enterKeyHint="done"
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); save(); }
                if (e.key === "Escape") { setText(item.text); setEditing(false); }
              }}
              style={{
                width: "100%", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
                padding: "4px 8px", color: "#fff", fontSize: 15, outline: "none",
              }}
            />
          </form>
        ) : (
          <span
            onClick={() => !item.completed && setEditing(true)}
            style={{
              flex: 1, fontSize: 15, lineHeight: 1.45,
              color: item.completed ? "rgba(255,255,255,0.22)" : T.text,
              textDecoration: item.completed ? "line-through" : "none",
              cursor: item.completed ? "default" : "text",
              wordBreak: "break-word", minWidth: 0,
            }}
          >
            {item.text}
          </span>
        )}

        {/* Priority emoji — tap to cycle through low → normal → high → urgent */}
        {!item.completed && (
          <button
            onClick={cyclePriority}
            title={`Priority: ${pc.label} — tap to change`}
            style={{
              flexShrink: 0, background: "none", border: "none",
              cursor: "pointer", fontSize: 14, padding: "2px",
              touchAction: "manipulation", lineHeight: 1,
              opacity: item.priority === "low" ? 0.4 : 1,
            }}
          >
            {pc.emoji}
          </button>
        )}

        {/* Delete */}
        <button
          onClick={() => onDelete(item.id, noteId)}
          style={{
            flexShrink: 0, background: "none", border: "none",
            color: "rgba(255,255,255,0.15)", cursor: "pointer",
            padding: "4px", touchAction: "manipulation", lineHeight: 0, borderRadius: 6,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.15)")}
        >
          <X size={13} />
        </button>
      </div>
    </Reorder.Item>
  );
}

// ── Add Item Input ─────────────────────────────────────────────────────────
function AddItemInput({
  noteId,
  onAdd,
}: {
  noteId: string;
  onAdd: (noteId: string, text: string, priority: Priority) => Promise<unknown>;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = useCallback(async () => {
    if (!text.trim()) return;
    await onAdd(noteId, text.trim(), "normal");
    setText("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [text, noteId, onAdd]);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      style={{ display: "flex", alignItems: "center", gap: 10 }}
    >
      <div
        style={{
          width: 24, height: 24, borderRadius: 7,
          border: "2px dashed rgba(255,255,255,0.13)", flexShrink: 0,
        }}
      />
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add item…"
        enterKeyHint="done"
        style={{
          flex: 1, minWidth: 0, background: "transparent",
          border: "none", color: T.text, fontSize: 15,
          outline: "none", caretColor: "#7c5af5",
        }}
      />
      <button
        type="submit"
        disabled={!text.trim()}
        style={{
          flexShrink: 0, width: 32, height: 32, borderRadius: 8,
          background: text.trim() ? "#7c5af5" : "rgba(255,255,255,0.05)",
          border: "none", display: "flex", alignItems: "center", justifyContent: "center",
          cursor: text.trim() ? "pointer" : "default",
          transition: "background 0.15s", touchAction: "manipulation",
        }}
      >
        <Plus size={15} color={text.trim() ? "#fff" : "rgba(255,255,255,0.3)"} />
      </button>
    </form>
  );
}

// ── Color Picker ────────────────────────────────────────────────────────────
function ColorPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (c: string | null) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
      {/* Clear / none */}
      <button
        onClick={() => onChange(null)}
        title="No color"
        style={{
          width: 24, height: 24, borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          border: value === null ? "2.5px solid #fff" : "2px solid rgba(255,255,255,0.15)",
          cursor: "pointer", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <X size={10} color="rgba(255,255,255,0.4)" />
      </button>

      {ALL_COLORS.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          title={c}
          style={{
            width: 24, height: 24, borderRadius: "50%", background: c, flexShrink: 0,
            border: value === c ? "2.5px solid #fff" : "2.5px solid transparent",
            cursor: "pointer", transition: "transform 0.12s",
            outline: value === c ? `2px solid ${c}` : "none",
            outlineOffset: 1,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.22)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      ))}

      {/* Custom color input */}
      <label
        title="Pick custom color"
        style={{
          width: 24, height: 24, borderRadius: "50%",
          background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
          border: "2px solid rgba(255,255,255,0.2)",
          cursor: "pointer", flexShrink: 0, overflow: "hidden", position: "relative",
        }}
      >
        <input
          type="color"
          value={value ?? "#7c5af5"}
          onChange={(e) => onChange(e.target.value)}
          style={{
            position: "absolute", inset: 0, opacity: 0,
            cursor: "pointer", width: "100%", height: "100%",
          }}
        />
      </label>
    </div>
  );
}

// ── Main NoteEditor ────────────────────────────────────────────────────────
interface NoteEditorProps {
  note: Note;
  section: NoteSection;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Omit<Note, "checklist_items">>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  onAddItem: (noteId: string, text: string, priority: Priority) => Promise<unknown>;
  onUpdateItem: (id: string, noteId: string, updates: Partial<ChecklistItem>) => Promise<void>;
  onDeleteItem: (id: string, noteId: string) => Promise<void>;
  onReorderItems: (noteId: string, items: ChecklistItem[]) => Promise<void>;
}

export function NoteEditor({
  note,
  section,
  onClose,
  onUpdate,
  onDelete,
  onArchive,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onReorderItems,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tagInput, setTagInput] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  // Mobile: toggles the options panel (tags, color, archive, delete)
  const [showOptions, setShowOptions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Single effect handles both mount flag and mobile detection, so they batch together
  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id]);

  const debounceSave = useCallback(
    (field: "title" | "content", val: string) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        onUpdate(note.id, { [field]: val });
      }, 600);
    },
    [note.id, onUpdate]
  );

  const activeItems = useMemo(
    () => (note.checklist_items ?? []).filter((i) => !i.completed),
    [note.checklist_items]
  );
  const completedItems = useMemo(
    () => (note.checklist_items ?? []).filter((i) => i.completed),
    [note.checklist_items]
  );

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!t || note.tags.includes(t)) { setTagInput(""); return; }
    onUpdate(note.id, { tags: [...note.tags, t] });
    setTagInput("");
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    await onDelete(note.id);
    onClose();
  };

  const handleArchive = async () => {
    await onArchive(note.id);
    onClose();
  };

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  // Don't render until mounted (avoids SSR mismatch and ensures isMobile is correct)
  if (!mounted) return null;

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        padding: isMobile ? 0 : "clamp(8px,3vw,32px)",
      }}
    >
      <motion.div
        initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.96, y: 12 }}
        animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
        exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 360, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: isMobile ? "20px 20px 0 0" : "24px",
          width: isMobile ? "100%" : "min(680px, 100%)",
          maxHeight: isMobile ? "88dvh" : "88vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 -20px 80px rgba(0,0,0,0.7)",
          backdropFilter: "blur(24px)",
          overflow: "hidden",
        }}
      >
        {/* ── Drag pill (mobile) ── */}
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />
          </div>
        )}

        {/* ── Header ── */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: isMobile ? "10px 16px" : "14px 22px 12px",
            borderBottom: `1px solid ${T.divider}`, flexShrink: 0,
          }}
        >
          {/* Section badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: section.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {SECTION_ICONS[section.icon] ?? "📄"} {section.title}
            </span>
          </div>

          {/* Type toggle */}
          <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
            {(["checklist", "note"] as const).map((t) => (
              <button
                key={t}
                onClick={() => onUpdate(note.id, { type: t })}
                title={t === "checklist" ? "Checklist" : "Note"}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: "none",
                  background: note.type === t ? "rgba(124,90,245,0.25)" : "rgba(255,255,255,0.05)",
                  color: note.type === t ? "#a78bfa" : T.muted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {t === "checklist" ? <CheckSquare size={13} /> : <AlignLeft size={13} />}
              </button>
            ))}
          </div>

          {/* Pin */}
          <button
            onClick={() => onUpdate(note.id, { pinned: !note.pinned })}
            title={note.pinned ? "Unpin" : "Pin"}
            style={{
              width: 30, height: 30, borderRadius: 8, border: "none",
              background: note.pinned ? "rgba(255,214,0,0.15)" : "rgba(255,255,255,0.05)",
              fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            📌
          </button>

          {/* Options toggle — mobile only */}
          {isMobile && (
            <button
              onClick={() => setShowOptions((v) => !v)}
              title="More options"
              style={{
                width: 30, height: 30, borderRadius: 8, border: "none",
                background: showOptions ? "rgba(124,90,245,0.2)" : "rgba(255,255,255,0.05)",
                color: showOptions ? "#a78bfa" : T.muted,
                fontSize: 16, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ⋯
            </button>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8, border: "none",
              background: "rgba(255,255,255,0.05)", color: T.muted, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div
          style={{
            flex: 1, overflowY: "auto",
            padding: isMobile ? "14px 16px 10px" : "18px 22px 10px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Title */}
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); debounceSave("title", e.target.value); }}
            placeholder="Title…"
            enterKeyHint="done"
            style={{
              display: "block", width: "100%", background: "transparent",
              border: "none", outline: "none",
              fontSize: isMobile ? 21 : 22, fontWeight: 700,
              color: T.text, caretColor: "#7c5af5",
              marginBottom: 14, letterSpacing: "-0.3px",
            }}
          />

          {/* Checklist */}
          {note.type === "checklist" && (
            <div>
              {activeItems.length === 0 && completedItems.length === 0 && (
                <p style={{ fontSize: 14, color: T.muted, marginBottom: 8 }}>
                  No items yet — add one below
                </p>
              )}

              <Reorder.Group
                axis="y"
                values={activeItems}
                onReorder={(items) => onReorderItems(note.id, [...items, ...completedItems])}
                style={{ margin: 0, padding: 0 }}
              >
                {activeItems.map((item) => (
                  <ChecklistRow
                    key={item.id}
                    item={item}
                    noteId={note.id}
                    isMobile={isMobile}
                    onUpdate={onUpdateItem}
                    onDelete={onDeleteItem}
                  />
                ))}
              </Reorder.Group>

              {/* Completed section */}
              {completedItems.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <button
                    onClick={() => setShowCompleted((v) => !v)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: "none", border: "none", color: T.muted,
                      fontSize: 12, cursor: "pointer", padding: "4px 0",
                      fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase",
                    }}
                  >
                    {showCompleted ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    {completedItems.length} Completed
                  </button>
                  <AnimatePresence>
                    {showCompleted && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: "hidden" }}
                      >
                        {completedItems.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              display: "flex", alignItems: "center", gap: 8,
                              padding: "8px 0", borderBottom: `1px solid ${T.divider}`,
                            }}
                          >
                            <button
                              onClick={() => onUpdateItem(item.id, note.id, { completed: false })}
                              style={{
                                flexShrink: 0, width: 22, height: 22, borderRadius: 6,
                                border: "none", background: PRIORITY_CONFIG[item.priority].color,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <Check size={11} color="#fff" strokeWidth={3} />
                            </button>
                            <span
                              style={{
                                flex: 1, fontSize: 14, color: "rgba(255,255,255,0.22)",
                                textDecoration: "line-through", wordBreak: "break-word",
                              }}
                            >
                              {item.text}
                            </span>
                            <button
                              onClick={() => onDeleteItem(item.id, note.id)}
                              style={{
                                background: "none", border: "none",
                                color: "rgba(255,255,255,0.15)", cursor: "pointer", lineHeight: 0,
                              }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* Text note */}
          {note.type === "note" && (
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); debounceSave("content", e.target.value); }}
              placeholder="Write something…"
              style={{
                display: "block", width: "100%",
                minHeight: isMobile ? 180 : 200,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, padding: "12px 14px", color: T.text,
                fontSize: 15, lineHeight: 1.65, outline: "none", resize: "vertical",
                caretColor: "#7c5af5", fontFamily: "inherit",
              }}
            />
          )}

          {/* ── Options panel ──
               Desktop: always visible
               Mobile: shown when "⋯" is tapped */}
          {(!isMobile || showOptions) && (
            <div style={{ marginTop: 18 }}>
              {/* Tags */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8, fontWeight: 600 }}>
                  Tags
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  {note.tags.map((tag) => (
                    <div
                      key={tag}
                      style={{
                        display: "flex", alignItems: "center", gap: 4,
                        background: "rgba(124,90,245,0.15)", border: "1px solid rgba(124,90,245,0.3)",
                        borderRadius: 20, padding: "3px 10px", fontSize: 12, color: "#c4b5fd",
                      }}
                    >
                      #{tag}
                      <button
                        onClick={() => onUpdate(note.id, { tags: note.tags.filter((t) => t !== tag) })}
                        style={{ background: "none", border: "none", color: "rgba(196,181,253,0.5)", cursor: "pointer", padding: 0, lineHeight: 0 }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <form onSubmit={(e) => { e.preventDefault(); addTag(); }} style={{ display: "flex" }}>
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      enterKeyHint="done"
                      placeholder="Add tag…"
                      style={{
                        background: "transparent", border: "none", outline: "none",
                        fontSize: 12, color: T.muted, caretColor: "#7c5af5", width: 80,
                      }}
                    />
                  </form>
                </div>
              </div>

              {/* Note color */}
              <div style={{ marginBottom: isMobile ? 18 : 12 }}>
                <p style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8, fontWeight: 600 }}>
                  Note Color
                </p>
                <ColorPicker value={note.color} onChange={(c) => onUpdate(note.id, { color: c })} />
              </div>

              {/* Archive / Delete — inside options panel on mobile */}
              {isMobile && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleArchive}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12, padding: "11px 0", color: T.muted, fontSize: 13, cursor: "pointer",
                    }}
                  >
                    <Archive size={13} /> Archive
                  </button>
                  <button
                    onClick={handleDelete}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      background: confirmDelete ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.08)",
                      border: `1px solid ${confirmDelete ? "rgba(239,68,68,0.5)" : "rgba(239,68,68,0.2)"}`,
                      borderRadius: 12, padding: "11px 0",
                      color: confirmDelete ? "#f87171" : "rgba(239,68,68,0.6)",
                      fontSize: 13, cursor: "pointer",
                    }}
                  >
                    <Trash2 size={13} /> {confirmDelete ? "Confirm?" : "Delete"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Sticky add-item bar — always visible, never scrolls away ── */}
        {note.type === "checklist" && (
          <div
            style={{
              padding: isMobile ? "10px 16px" : "10px 22px",
              borderTop: `1px solid ${T.divider}`,
              flexShrink: 0, background: T.card,
            }}
          >
            <AddItemInput noteId={note.id} onAdd={onAddItem} />
          </div>
        )}

        {/* ── Footer — desktop only (mobile uses options panel) ── */}
        {!isMobile && (
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 22px 14px", borderTop: `1px solid ${T.divider}`, flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 11, color: T.muted }}>
              {new Date(note.updated_at).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
                hour: "numeric", minute: "2-digit",
              })}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleArchive}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, padding: "7px 14px", color: T.muted, fontSize: 13, cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = T.muted; }}
              >
                <Archive size={13} /> Archive
              </button>
              <button
                onClick={handleDelete}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: confirmDelete ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.08)",
                  border: `1px solid ${confirmDelete ? "rgba(239,68,68,0.5)" : "rgba(239,68,68,0.2)"}`,
                  borderRadius: 10, padding: "7px 14px",
                  color: confirmDelete ? "#f87171" : "rgba(239,68,68,0.6)",
                  fontSize: 13, cursor: "pointer",
                }}
              >
                <Trash2 size={13} /> {confirmDelete ? "Confirm?" : "Delete"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  // createPortal renders at document.body, escaping any CSS stacking context
  // created by framer-motion transforms on parent elements (which trap position:fixed children).
  return createPortal(modal, document.body);
}
