"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import {
  X,
  Plus,
  Archive,
  GripVertical,
  Check,
  ChevronDown,
  ChevronRight,
  Tag as TagIcon,
  AlignLeft,
  CheckSquare,
  Calendar,
} from "lucide-react";
import type { Note, ChecklistItem, Priority, NoteSection } from "@/lib/notes-types";
import { SECTION_COLORS, PRIORITY_CONFIG, SECTION_ICONS } from "@/lib/notes-types";

const T = {
  card: "rgba(10,6,28,0.97)",
  border: "rgba(255,255,255,0.08)",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.35)",
  sub: "rgba(255,255,255,0.60)",
  inputBg: "rgba(255,255,255,0.07)",
  divider: "rgba(255,255,255,0.07)",
};

// ── Checklist Item Row ─────────────────────────────────────────────────────
// Two-line layout: line 1 = checkbox + text + delete
//                  line 2 = date + priority (indented to align with text)
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

  const priorityColor = PRIORITY_CONFIG[item.priority].color;
  const isOverdue =
    item.due_date &&
    !item.completed &&
    new Date(item.due_date) < new Date(new Date().toDateString());

  const CHECKBOX_W = 26;
  const HANDLE_W = isMobile ? 0 : 22; // hide drag handle on mobile
  const INDENT = HANDLE_W + (isMobile ? 8 : 10) + CHECKBOX_W + 10; // align row-2 with text

  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls} style={{ listStyle: "none" }}>
      <div style={{ padding: "10px 0", borderBottom: `1px solid ${T.divider}` }}>

        {/* ── Row 1: drag | checkbox | text | delete ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Drag handle — desktop only */}
          {!isMobile && (
            <div
              onPointerDown={(e) => controls.start(e)}
              style={{ cursor: "grab", color: "rgba(255,255,255,0.12)", flexShrink: 0, touchAction: "none", lineHeight: 0, width: HANDLE_W }}
            >
              <GripVertical size={14} />
            </div>
          )}

          {/* Checkbox */}
          <button
            onClick={() => onUpdate(item.id, noteId, { completed: !item.completed })}
            style={{
              flexShrink: 0,
              width: CHECKBOX_W,
              height: CHECKBOX_W,
              borderRadius: 7,
              border: `2px solid ${item.completed ? priorityColor : "rgba(255,255,255,0.18)"}`,
              background: item.completed ? priorityColor : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              touchAction: "manipulation",
              transition: "all 0.15s",
            }}
          >
            {item.completed && <Check size={12} color="#fff" strokeWidth={3} />}
          </button>

          {/* Text */}
          {editing ? (
            <form
              style={{ flex: 1 }}
              onSubmit={(e) => { e.preventDefault(); save(); }}
            >
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
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  padding: "5px 10px",
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                }}
              />
            </form>
          ) : (
            <span
              onClick={() => !item.completed && setEditing(true)}
              style={{
                flex: 1,
                fontSize: 15,
                lineHeight: 1.45,
                color: item.completed ? "rgba(255,255,255,0.22)" : T.text,
                textDecoration: item.completed ? "line-through" : "none",
                cursor: item.completed ? "default" : "text",
                wordBreak: "break-word",
                minWidth: 0,
              }}
            >
              {item.text}
            </span>
          )}

          {/* Delete */}
          <button
            onClick={() => onDelete(item.id, noteId)}
            style={{
              flexShrink: 0,
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.18)",
              cursor: "pointer",
              padding: "4px 6px",
              touchAction: "manipulation",
              lineHeight: 0,
              borderRadius: 6,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.18)")}
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Row 2: date + priority (indented, only if not completed) ── */}
        {!item.completed && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 6,
              paddingLeft: INDENT,
            }}
          >
            {/* Due date */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar
                size={11}
                color={isOverdue ? "#ef4444" : item.due_date ? "#60a5fa" : "rgba(255,255,255,0.2)"}
              />
              <input
                type="date"
                value={item.due_date ?? ""}
                onChange={(e) =>
                  onUpdate(item.id, noteId, { due_date: e.target.value || null })
                }
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  fontSize: 12,
                  color: isOverdue
                    ? "#ef4444"
                    : item.due_date
                    ? "#60a5fa"
                    : "rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  outline: "none",
                  colorScheme: "dark",
                  maxWidth: 110,
                }}
              />
            </div>

            {/* Priority */}
            <select
              value={item.priority}
              onChange={(e) =>
                onUpdate(item.id, noteId, { priority: e.target.value as Priority })
              }
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "none",
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: 12,
                color: priorityColor,
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="normal">🔵 Normal</option>
              <option value="low">⚪ Low</option>
            </select>
          </div>
        )}
      </div>
    </Reorder.Item>
  );
}

// ── Add Item Input ─────────────────────────────────────────────────────────
// Wrapped in <form> so the mobile keyboard "Done"/"Go" key triggers submit.
// enterKeyHint="done" makes iOS/Android show "Done" instead of "Next".
function AddItemInput({
  noteId,
  onAdd,
  autoFocusOnMount,
}: {
  noteId: string;
  onAdd: (noteId: string, text: string, priority: Priority) => Promise<unknown>;
  autoFocusOnMount?: boolean;
}) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocusOnMount) inputRef.current?.focus();
  }, [autoFocusOnMount]);

  const submit = useCallback(async () => {
    if (!text.trim()) return;
    await onAdd(noteId, text.trim(), priority);
    setText("");
    // Small delay so state resets before refocus
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [text, priority, noteId, onAdd]);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      style={{ display: "flex", alignItems: "center", gap: 10 }}
    >
      {/* Ghost checkbox */}
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          border: "2px dashed rgba(255,255,255,0.15)",
          flexShrink: 0,
        }}
      />

      {/* Text input */}
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add item…"
        enterKeyHint="done"
        style={{
          flex: 1,
          minWidth: 0,
          background: "transparent",
          border: "none",
          color: T.text,
          fontSize: 15,
          outline: "none",
          caretColor: "#7c5af5",
        }}
      />

      {/* Priority */}
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        style={{
          flexShrink: 0,
          background: "rgba(255,255,255,0.05)",
          border: "none",
          borderRadius: 6,
          padding: "4px 8px",
          fontSize: 12,
          color: PRIORITY_CONFIG[priority].color,
          cursor: "pointer",
          outline: "none",
        }}
      >
        <option value="urgent">🔴 Urgent</option>
        <option value="high">🟠 High</option>
        <option value="normal">🔵 Normal</option>
        <option value="low">⚪ Low</option>
      </select>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!text.trim()}
        style={{
          flexShrink: 0,
          width: 34,
          height: 34,
          borderRadius: 9,
          background: text.trim() ? "#7c5af5" : "rgba(255,255,255,0.05)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: text.trim() ? "pointer" : "default",
          transition: "background 0.15s",
          touchAction: "manipulation",
        }}
      >
        <Plus size={16} color={text.trim() ? "#fff" : "rgba(255,255,255,0.3)"} />
      </button>
    </form>
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { setTitle(note.title); setContent(note.content); }, [note.id]);

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

  const removeTag = (tag: string) => {
    onUpdate(note.id, { tags: note.tags.filter((t) => t !== tag) });
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

  // Modal positioning: center on desktop, bottom sheet on mobile
  const backdropAlign = isMobile ? "flex-end" : "center";
  const modalRadius = isMobile ? "20px 20px 0 0" : "24px";
  const modalWidth = isMobile ? "100%" : "min(720px, 100%)";
  const modalMaxH = isMobile ? "92dvh" : "90vh";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 800,
          background: "rgba(0,0,0,0.72)",
          display: "flex",
          alignItems: backdropAlign,
          justifyContent: "center",
          padding: isMobile ? 0 : "clamp(8px,3vw,32px)",
        }}
      >
        <motion.div
          initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.96, y: 16 }}
          animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
          exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: "spring", stiffness: 340, damping: 32 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: modalRadius,
            width: modalWidth,
            maxHeight: modalMaxH,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 -20px 80px rgba(0,0,0,0.6)",
            backdropFilter: "blur(24px)",
            overflow: "hidden",
          }}
        >
          {/* ── Drag handle pill (mobile bottom sheet) ── */}
          {isMobile && (
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
            </div>
          )}

          {/* ── Header ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: isMobile ? "8px 16px 10px" : "16px 24px 12px",
              borderBottom: `1px solid ${T.divider}`,
              flexShrink: 0,
            }}
          >
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: section.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: T.muted, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {SECTION_ICONS[section.icon] ?? "📄"} {section.title}
            </span>

            {/* Type toggle */}
            <div style={{ display: "flex", gap: 4 }}>
              {(["checklist", "note"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onUpdate(note.id, { type: t })}
                  title={t === "checklist" ? "Checklist" : "Note"}
                  style={{
                    width: 32, height: 32, borderRadius: 9, border: "none",
                    background: note.type === t ? "rgba(124,90,245,0.25)" : "rgba(255,255,255,0.05)",
                    color: note.type === t ? "#a78bfa" : T.muted,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {t === "checklist" ? <CheckSquare size={14} /> : <AlignLeft size={14} />}
                </button>
              ))}
            </div>

            {/* Pin */}
            <button
              onClick={() => onUpdate(note.id, { pinned: !note.pinned })}
              title={note.pinned ? "Unpin" : "Pin"}
              style={{
                width: 32, height: 32, borderRadius: 9, border: "none",
                background: note.pinned ? "rgba(255,214,0,0.15)" : "rgba(255,255,255,0.05)",
                color: note.pinned ? "#fbbf24" : T.muted,
                fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              📌
            </button>

            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 9, border: "none",
                background: "rgba(255,255,255,0.05)", color: T.muted, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* ── Scrollable body (NO AddItemInput here) ── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: isMobile ? "16px 16px 10px" : "20px 24px 12px",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* Title */}
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => { setTitle(e.target.value); debounceSave("title", e.target.value); }}
              placeholder="Title…"
              enterKeyHint="done"
              style={{
                display: "block", width: "100%", background: "transparent",
                border: "none", outline: "none",
                fontSize: isMobile ? 20 : 22, fontWeight: 700,
                color: T.text, caretColor: "#7c5af5",
                marginBottom: 16, letterSpacing: "-0.3px",
              }}
            />

            {/* Checklist items (active only — no AddItemInput inside scroll) */}
            {note.type === "checklist" && (
              <div>
                {activeItems.length === 0 && completedItems.length === 0 && (
                  <p style={{ fontSize: 14, color: T.muted, marginBottom: 8 }}>
                    No items yet — use the field below to add one
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
                  <div style={{ marginTop: 16 }}>
                    <button
                      onClick={() => setShowCompleted((v) => !v)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "none", border: "none", color: T.muted,
                        fontSize: 12, cursor: "pointer", padding: "4px 0",
                        fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase",
                      }}
                    >
                      {showCompleted ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
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
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "9px 0", borderBottom: `1px solid ${T.divider}`,
                              }}
                            >
                              <button
                                onClick={() => onUpdateItem(item.id, note.id, { completed: false })}
                                style={{
                                  flexShrink: 0, width: 22, height: 22, borderRadius: 6,
                                  border: "none", background: PRIORITY_CONFIG[item.priority].color,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  cursor: "pointer", marginLeft: isMobile ? 0 : 22,
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
                                <X size={13} />
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
                  display: "block", width: "100%", minHeight: 160,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12, padding: "12px 14px", color: T.text,
                  fontSize: 15, lineHeight: 1.65, outline: "none", resize: "vertical",
                  caretColor: "#7c5af5", fontFamily: "inherit",
                }}
              />
            )}

            {/* Tags */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <TagIcon size={12} color={T.muted} />
                {note.tags.map((tag) => (
                  <div
                    key={tag}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      background: "rgba(124,90,245,0.18)", border: "1px solid rgba(124,90,245,0.3)",
                      borderRadius: 20, padding: "3px 10px", fontSize: 12, color: "#c4b5fd",
                    }}
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      style={{ background: "none", border: "none", color: "rgba(196,181,253,0.5)", cursor: "pointer", padding: 0, lineHeight: 0 }}
                    >
                      <X size={11} />
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

            {/* Color picker */}
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: T.muted }}>Color</span>
              {[null, ...SECTION_COLORS].map((c) => (
                <button
                  key={c ?? "none"}
                  onClick={() => onUpdate(note.id, { color: c })}
                  style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: c ?? "rgba(255,255,255,0.1)",
                    border: note.color === c ? "2.5px solid #fff" : `2px solid ${c ?? "rgba(255,255,255,0.15)"}`,
                    cursor: "pointer", flexShrink: 0, transition: "transform 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
              ))}
            </div>
          </div>

          {/* ── Sticky "Add item" bar — always visible, never scrolls away ── */}
          {note.type === "checklist" && (
            <div
              style={{
                padding: isMobile ? "10px 16px" : "10px 24px",
                borderTop: `1px solid ${T.divider}`,
                flexShrink: 0,
                background: T.card,
              }}
            >
              <AddItemInput noteId={note.id} onAdd={onAddItem} />
            </div>
          )}

          {/* ── Footer ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: isMobile ? "10px 16px 16px" : "12px 24px 16px",
              borderTop: `1px solid ${T.divider}`,
              flexShrink: 0,
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
                  borderRadius: 10, padding: "8px 14px", color: T.muted,
                  fontSize: 13, cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = T.muted; }}
              >
                <Archive size={13} />
                {!isMobile && "Archive"}
              </button>
              <button
                onClick={handleDelete}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: confirmDelete ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.08)",
                  border: `1px solid ${confirmDelete ? "rgba(239,68,68,0.5)" : "rgba(239,68,68,0.2)"}`,
                  borderRadius: 10, padding: "8px 14px",
                  color: confirmDelete ? "#f87171" : "rgba(239,68,68,0.6)",
                  fontSize: 13, cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {confirmDelete ? "Confirm?" : (!isMobile ? "Delete" : "🗑")}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
