export type Priority = "low" | "normal" | "high" | "urgent";
export type NoteType = "note" | "checklist";

export interface NoteSection {
  id: string;
  title: string;
  color: string;
  icon: string;
  pinned: boolean;
  archived: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  section_id: string;
  title: string;
  content: string;
  type: NoteType;
  pinned: boolean;
  archived: boolean;
  color: string | null;
  tags: string[];
  position: number;
  created_at: string;
  updated_at: string;
  checklist_items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  note_id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export const SECTION_COLORS = [
  "#f59e0b",
  "#60a5fa",
  "#a78bfa",
  "#34d399",
  "#f472b6",
  "#fb923c",
  "#ef4444",
  "#14b8a6",
  "#6366f1",
  "#84cc16",
];

export const SECTION_ICONS: Record<string, string> = {
  FileText: "📄",
  Star: "⭐",
  GraduationCap: "🎓",
  ShoppingCart: "🛒",
  Home: "🏠",
  Briefcase: "💼",
  Heart: "❤️",
  Music: "🎵",
  Book: "📚",
  Dumbbell: "💪",
  Coffee: "☕",
  Plane: "✈️",
  Code: "💻",
  Lightbulb: "💡",
  Target: "🎯",
  CheckSquare: "✅",
  Inbox: "📥",
  List: "📋",
  Building: "🏢",
  Rocket: "🚀",
};

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; emoji: string }
> = {
  urgent: { label: "Urgent", color: "#ef4444", emoji: "🔴" },
  high: { label: "High", color: "#f97316", emoji: "🟠" },
  normal: { label: "Normal", color: "#60a5fa", emoji: "🔵" },
  low: { label: "Low", color: "#6b7280", emoji: "⚪" },
};
