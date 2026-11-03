import type { Metadata } from "next";
import JsonViewer from "@/components/work/json-viewer/JsonViewer";

export const metadata: Metadata = {
  title: "JSON Viewer — Sri Raghavan · Work",
  description:
    "A fast, private JSON viewer: collapsible tree, node details panel, key/value search, JSONPath queries, table view and error repair. Runs entirely in your browser.",
};

export default function JsonViewerPage() {
  return <JsonViewer />;
}
