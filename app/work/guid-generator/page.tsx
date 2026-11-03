import type { Metadata } from "next";
import GuidGenerator from "@/components/work/guid-generator/GuidGenerator";

export const metadata: Metadata = {
  title: "GUID / UUID Generator — Sri Raghavan · Work",
  description:
    "Generate v4, v7 and v5 GUIDs in bulk with .NET, SQL and JSON formats, and inspect any GUID. Runs in your browser.",
};

export default function GuidGeneratorPage() {
  return <GuidGenerator />;
}
