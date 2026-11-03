import type { Metadata } from "next";
import JsonDiff from "@/components/work/json-diff/JsonDiff";

export const metadata: Metadata = {
  title: "JSON Diff — Sri Raghavan · Work",
  description:
    "Compare two JSON documents structurally: see added, removed and changed values by path, a side-by-side view, and export a JSON Patch. Runs in your browser.",
};

export default function JsonDiffPage() {
  return <JsonDiff />;
}
