"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type {
  NoteSection,
  Note,
  ChecklistItem,
  Priority,
  NoteType,
} from "@/lib/notes-types";

export function useNotes() {
  const [sections, setSections] = useState<NoteSection[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [{ data: sData, error: sErr }, { data: nData, error: nErr }] =
        await Promise.all([
          supabase
            .from("note_sections")
            .select("*")
            .order("pinned", { ascending: false })
            .order("position"),
          supabase
            .from("notes")
            .select("*, checklist_items(*)")
            .order("pinned", { ascending: false })
            .order("position"),
        ]);
      if (sErr) throw sErr;
      if (nErr) throw nErr;
      setSections(sData ?? []);
      setNotes(
        (nData ?? []).map((n) => ({
          ...n,
          checklist_items: ((n.checklist_items as ChecklistItem[]) ?? []).sort(
            (a, b) => a.position - b.position
          ),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const channels = [
      supabase
        .channel("rt_sections")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "note_sections" },
          loadData
        )
        .subscribe(),
      supabase
        .channel("rt_notes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notes" },
          loadData
        )
        .subscribe(),
      supabase
        .channel("rt_items")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "checklist_items" },
          loadData
        )
        .subscribe(),
    ];
    return () => channels.forEach((c) => supabase.removeChannel(c));
  }, [loadData]);

  // ── Sections ──────────────────────────────────────────────────────────────
  const addSection = useCallback(
    async (data: Pick<NoteSection, "title" | "color" | "icon">) => {
      const pos = sections.filter((s) => !s.archived).length;
      const { data: row, error } = await supabase
        .from("note_sections")
        .insert({ ...data, position: pos })
        .select()
        .single();
      if (error) throw error;
      setSections((p) => [...p, row]);
      return row as NoteSection;
    },
    [sections]
  );

  const updateSection = useCallback(
    async (id: string, updates: Partial<NoteSection>) => {
      const { error } = await supabase
        .from("note_sections")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      setSections((p) =>
        p.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
    },
    []
  );

  const deleteSection = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("note_sections")
      .delete()
      .eq("id", id);
    if (error) throw error;
    setSections((p) => p.filter((s) => s.id !== id));
    setNotes((p) => p.filter((n) => n.section_id !== id));
  }, []);

  // ── Notes ─────────────────────────────────────────────────────────────────
  const addNote = useCallback(
    async (section_id: string, type: NoteType = "checklist", title = "") => {
      const pos = notes.filter((n) => n.section_id === section_id).length;
      const { data: row, error } = await supabase
        .from("notes")
        .insert({ section_id, title, content: "", type, position: pos })
        .select()
        .single();
      if (error) throw error;
      const note: Note = { ...row, checklist_items: [] };
      setNotes((p) => [...p, note]);
      return note;
    },
    [notes]
  );

  const updateNote = useCallback(
    async (id: string, updates: Partial<Omit<Note, "checklist_items">>) => {
      const { error } = await supabase
        .from("notes")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      setNotes((p) => p.map((n) => (n.id === id ? { ...n, ...updates } : n)));
    },
    []
  );

  const deleteNote = useCallback(async (id: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) throw error;
    setNotes((p) => p.filter((n) => n.id !== id));
  }, []);

  // ── Checklist Items ───────────────────────────────────────────────────────
  const addItem = useCallback(
    async (note_id: string, text: string, priority: Priority = "normal") => {
      const note = notes.find((n) => n.id === note_id);
      const pos = (note?.checklist_items ?? []).length;
      const { data: row, error } = await supabase
        .from("checklist_items")
        .insert({ note_id, text, priority, position: pos })
        .select()
        .single();
      if (error) throw error;
      setNotes((p) =>
        p.map((n) =>
          n.id === note_id
            ? {
                ...n,
                checklist_items: [...(n.checklist_items ?? []), row as ChecklistItem],
              }
            : n
        )
      );
      return row as ChecklistItem;
    },
    [notes]
  );

  const updateItem = useCallback(
    async (
      id: string,
      note_id: string,
      updates: Partial<ChecklistItem>
    ) => {
      const { error } = await supabase
        .from("checklist_items")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      setNotes((p) =>
        p.map((n) =>
          n.id === note_id
            ? {
                ...n,
                checklist_items: (n.checklist_items ?? []).map((i) =>
                  i.id === id ? { ...i, ...updates } : i
                ),
              }
            : n
        )
      );
    },
    []
  );

  const deleteItem = useCallback(async (id: string, note_id: string) => {
    const { error } = await supabase
      .from("checklist_items")
      .delete()
      .eq("id", id);
    if (error) throw error;
    setNotes((p) =>
      p.map((n) =>
        n.id === note_id
          ? {
              ...n,
              checklist_items: (n.checklist_items ?? []).filter(
                (i) => i.id !== id
              ),
            }
          : n
      )
    );
  }, []);

  const reorderItems = useCallback(
    async (note_id: string, items: ChecklistItem[]) => {
      setNotes((p) =>
        p.map((n) => (n.id === note_id ? { ...n, checklist_items: items } : n))
      );
      await Promise.all(
        items.map((item, i) =>
          supabase
            .from("checklist_items")
            .update({ position: i })
            .eq("id", item.id)
        )
      );
    },
    []
  );

  // ── Dock helper: get or create default note for a section ─────────────────
  const getOrCreateDefaultNote = useCallback(
    async (section_id: string): Promise<Note> => {
      const existing = notes
        .filter((n) => n.section_id === section_id && !n.archived)
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0];
      if (existing) return existing;
      return addNote(section_id, "checklist", "Tasks");
    },
    [notes, addNote]
  );

  return {
    sections,
    notes,
    loading,
    error,
    refresh: loadData,
    addSection,
    updateSection,
    deleteSection,
    addNote,
    updateNote,
    deleteNote,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    getOrCreateDefaultNote,
  };
}
