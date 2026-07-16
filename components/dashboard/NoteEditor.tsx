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
  Trash2,
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
  bg: "rgba(4,7,26,0.98)",
  card: "rgba(10,6,28,0.95)",
  border: "rgba(255,255,255,0.08)",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.35)",
  sub: "rgba(255,255,255,0.60)",
  inputBg: "rgba(255,255,255,0.07)",
  divider: "rgba(255,255,255,0.07)",
};

// ── Checklist Item Row ─────────────────────────────────────────────────────
function ChecklistRow({
  item,
  noteId,
  onUpdate,
  onDelete,
}: {
  item: ChecklistItem;
  noteId: string;
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
    item.due_date && !item.completed && new Date(item.due_date) < new Date(new Date().toDateString());

  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls} style={{ listStyle: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 0",
          borderBottom: `1px solid ${T.divider}`,
        }}
      >
        {/* Drag handle */}
        <div
          onPointerDown={(e) => controls.start(e)}
          style={{
            cursor: "grab",
            color: "rgba(255,255,255,0.12)",
            flexShrink: 0,
            touchAction: "none",
            lineHeight: 0,
          }}
        >
          <GripVertical size={14} />
        </div>

        {/* Checkbox */}
        <button
          onClick={() => onUpdate(item.id, noteId, { completed: !item.completed })}
          style={{
            flexShrink: 0,
            width: 24,
            height: 24,
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
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") { setText(item.text); setEditing(false); }
            }}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              padding: "4px 10px",
              color: "#fff",
              fontSize: 15,
              outline: "none",
            }}
          />
        ) : (
          <span
            onClick={() => !item.completed && setEditing(true)}
            style={{
              flex: 1,
              fontSize: 15,
              lineHeight: 1.4,
              color: item.completed ? "rgba(255,255,255,0.22)" : T.text,
              textDecoration: item.completed ? "line-through" : "none",
              cursor: item.completed ? "default" : "text",
              wordBreak: "break-word",
            }}
          >
            {item.text}
          </span>
        )}

        {/* Due date */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
          <Calendar size={11} color={isOverdue ? "#ef4444" : "rgba(255,255,255,0.2)"} />
          <input
            type="date"
            value={item.due_date ?? ""}
            onChange={(e) => onUpdate(item.id, noteId, { due_date: e.target.value || null })}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              fontSize: 11,
              color: isOverdue ? "#ef4444" : item.due_date ? "#60a5fa" : "rgba(255,255,255,0.18)",
              cursor: "pointer",
              outline: "none",
              colorScheme: "dark",
              width: 90,
            }}
          />
        </div>

        {/* Priority */}
        <select
          value={item.priority}
          onChange={(e) => onUpdate(item.id, noteId, { priority: e.target.value as Priority })}
          style={{
            flexShrink: 0,
            background: "rgba(255,255,255,0.05)",
            border: "none",
            borderRadius: 6,
            padding: "3px 6px",
            fontSize: 11,
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

        {/* Delete */}
        <button
          onClick={() => onDelete(item.id, noteId)}
          style={{
            flexShrink: 0,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.18)",
            cursor: "pointer",
            padding: "2px 4px",
            touchAction: "manipulation",
            lineHeight: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.18)")}
        >
          <X size={14} />
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
  const [priority, setPriority] = useState<Priority>("normal");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (!text.trim()) return;
    await onAdd(noteId, text.trim(), priority);
    setText("");
    inputRef.current?.focus();
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 10 }}>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          border: "2px dashed rgba(255,255,255,0.15)",
          flexShrink: 0,
        }}
      />
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        placeholder="Add item…"
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          color: T.text,
          fontSize: 15,
          outline: "none",
          caretColor: "#7c5af5",
        }}
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "none",
          borderRadius: 6,
          padding: "3px 6px",
          fontSize: 11,
          color: PRIORITY_CONFIG[priority].color,
          cursor: "pointer",
          outline: "none",
          flexShrink: 0,
        }}
      >
        <option value="urgent">🔴 Urgent</option>
        <option value="high">🟠 High</option>
        <option value="normal">🔵 Normal</option>
        <option value="low">⚪ Low</option>
      </select>
      <button
        onClick={submit}
        disabled={!text.trim()}
        style={{
          flexShrink: 0,
          width: 32,
          height: 32,
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
        <Plus size={16} color="#fff" />
      </button>
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return; }
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 800,
          background: "rgba(0,0,0,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(0px,3vw,32px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 24,
            width: "min(720px, 100%)",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "18px 24px 14px",
              borderBottom: `1px solid ${T.divider}`,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: section.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>
              {SECTION_ICONS[section.icon] ?? "📄"} {section.title}
            </span>

            {/* Type toggle */}
            <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
              {(["checklist", "note"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onUpdate(note.id, { type: t })}
                  title={t === "checklist" ? "Checklist" : "Note"}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    border: "none",
                    background: note.type === t ? "rgba(124,90,245,0.25)" : "rgba(255,255,255,0.05)",
                    color: note.type === t ? "#a78bfa" : T.muted,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.15s",
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
                width: 32,
                height: 32,
                borderRadius: 9,
                border: "none",
                background: note.pinned ? "rgba(255,214,0,0.15)" : "rgba(255,255,255,0.05)",
                color: note.pinned ? "#fbbf24" : T.muted,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              📌
            </button>

            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                border: "none",
                background: "rgba(255,255,255,0.05)",
                color: T.muted,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* ── Body ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            {/* Title */}
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => { setTitle(e.target.value); debounceSave("title", e.target.value); }}
              placeholder="Title…"
              style={{
                display: "block",
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 22,
                fontWeight: 700,
                color: T.text,
                caretColor: "#7c5af5",
                marginBottom: 18,
                letterSpacing: "-0.3px",
              }}
            />

            {/* Checklist */}
            {note.type === "checklist" && (
              <div>
                {activeItems.length === 0 && completedItems.length === 0 && (
                  <p style={{ fontSize: 14, color: T.muted, marginBottom: 12 }}>
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
                      onUpdate={onUpdateItem}
                      onDelete={onDeleteItem}
                    />
                  ))}
                </Reorder.Group>

                <AddItemInput noteId={note.id} onAdd={onAddItem} />

                {/* Completed section */}
                {completedItems.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <button
                      onClick={() => setShowCompleted((v) => !v)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "none",
                        border: "none",
                        color: T.muted,
                        fontSize: 12,
                        cursor: "pointer",
                        padding: "4px 0",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
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
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "9px 0",
                                borderBottom: `1px solid ${T.divider}`,
                              }}
                            >
                              <button
                                onClick={() => onUpdateItem(item.id, note.id, { completed: false })}
                                style={{
                                  flexShrink: 0,
                                  width: 22,
                                  height: 22,
                                  borderRadius: 6,
                                  border: "none",
                                  background: PRIORITY_CONFIG[item.priority].color,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  marginLeft: 24,
                                }}
                              >
                                <Check size={11} color="#fff" strokeWidth={3} />
                              </button>
                              <span
                                style={{
                                  flex: 1,
                                  fontSize: 14,
                                  color: "rgba(255,255,255,0.22)",
                                  textDecoration: "line-through",
                                }}
                              >
                                {item.text}
                              </span>
                              <button
                                onClick={() => onDeleteItem(item.id, note.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "rgba(255,255,255,0.15)",
                                  cursor: "pointer",
                                  lineHeight: 0,
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
                  display: "block",
                  width: "100%",
                  minHeight: 180,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  color: T.text,
                  fontSize: 15,
                  lineHeight: 1.65,
                  outline: "none",
                  resize: "vertical",
                  caretColor: "#7c5af5",
                  fontFamily: "inherit",
                }}
              />
            )}

            {/* Tags */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <TagIcon size={13} color={T.muted} />
                {note.tags.map((tag) => (
                  <div
                    key={tag}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      background: "rgba(124,90,245,0.18)",
                      border: "1px solid rgba(124,90,245,0.3)",
                      borderRadius: 20,
                      padding: "3px 10px",
                      fontSize: 12,
                      color: "#c4b5fd",
                    }}
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(196,181,253,0.5)",
                        cursor: "pointer",
                        padding: 0,
                        lineHeight: 0,
                      }}
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
                  placeholder="Add tag…"
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: 12,
                    color: T.muted,
                    caretColor: "#7c5af5",
                    width: 80,
                  }}
                />
              </div>
            </div>

            {/* Note color */}
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: T.muted }}>Color</span>
              {[null, ...SECTION_COLORS].map((c) => (
                <button
                  key={c ?? "none"}
                  onClick={() => onUpdate(note.id, { color: c })}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: c ?? "rgba(255,255,255,0.1)",
                    border: note.color === c ? "2px solid #fff" : `2px solid ${c ?? "rgba(255,255,255,0.15)"}`,
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
              ))}
            </div>
          </div>

          {/* ── Footer ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 24px",
              borderTop: `1px solid ${T.divider}`,
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 11, color: T.muted }}>
              {new Date(note.updated_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleArchive}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "8px 14px",
                  color: T.muted,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = T.muted;
                }}
              >
                <Archive size={13} />
                Archive
              </button>
              <button
                onClick={handleDelete}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: confirmDelete ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.08)",
                  border: `1px solid ${confirmDelete ? "rgba(239,68,68,0.5)" : "rgba(239,68,68,0.2)"}`,
                  borderRadius: 10,
                  padding: "8px 14px",
                  color: confirmDelete ? "#f87171" : "rgba(239,68,68,0.6)",
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <Trash2 size={13} />
                {confirmDelete ? "Confirm?" : "Delete"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
