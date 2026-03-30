"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Layers3,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Trophy,
  User,
  ArrowLeft,
  Heart,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* -------------------- TYPES -------------------- */
type SectionHeadingProps = {
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  subtitle: string;
};

/* -------------------- DATA -------------------- */
const skillHighlights = [
  "Senior .NET Full-Stack Developer",
  "Cloud & Microservices Engineer",
  "Modern UI / API Architect",
  "Azure DevOps & Delivery Focused",
];

const techStacks = [
  { title: "Backend", items: ["C#", "VB.NET", ".NET Core", "ASP.NET MVC"] },
  { title: "Frontend", items: ["Angular", "React", "Vue.js", "TypeScript"] },
  { title: "Data", items: ["SQL Server", "MongoDB", "Cosmos DB"] },
  { title: "Cloud", items: ["Azure", "AWS", "Docker", "Kubernetes"] },
];

const achievements = [
  { title: "Modernized enterprise systems", text: "Improved performance and scalability." },
  { title: "CI/CD & DevOps improvements", text: "Accelerated delivery pipelines." },
  { title: "Full-stack delivery", text: "Built scalable UI + backend systems." },
];

const projects = [
  {
    client: "New Jersey Treasury",
    role: "Full Stack Developer",
    period: "2023 - Present",
    summary: "Modernized enterprise application",
    responsibilities: ["Built APIs", "Improved UI", "Used Azure"],
    stack: [".NET", "Azure", "Angular"],
  },
];

const education = [
  {
    degree: "Master's Degree - Information Technology Management",
    school: "Golden Gate University",
    year: "2017",
  },
  {
    degree: "Bachelor's Degree - Computer Science",
    school: "Anna University",
    year: "2015",
  },
];

/* -------------------- COMPONENTS -------------------- */
function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
}: SectionHeadingProps) {
  return (
    <div className="space-y-3">
      <div className="inline-flex items-center gap-2 text-sm text-gray-400">
        <Icon className="h-4 w-4" />
        {eyebrow}
      </div>
      <h2 className="text-3xl font-semibold">{title}</h2>
      <p className="text-gray-400">{subtitle}</p>
    </div>
  );
}

/* -------------------- MAIN -------------------- */
export default function PortfolioSite() {
  const [openProject, setOpenProject] = useState(0);

  const experienceYears = useMemo(() => {
    return new Date().getFullYear() - 2015;
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-10 space-y-16">
      
      {/* HERO */}
      <section>
        <h1 className="text-5xl font-bold">
          Sri Raghavan Balasundaram
        </h1>
        <p className="mt-4 text-gray-400">
          {experienceYears}+ years .NET Full Stack Developer
        </p>
      </section>

      {/* TECH STACK */}
      <section>
        <SectionHeading
          icon={Layers3}
          eyebrow="STACK"
          title="Tech Stack"
          subtitle="Grouped by layers"
        />
        <div className="grid grid-cols-2 gap-4 mt-4">
          {techStacks.map((group) => (
            <Card key={group.title}>
              <CardContent className="p-4">
                <h3 className="font-semibold">{group.title}</h3>
                <p className="text-gray-400 text-sm">
                  {group.items.join(", ")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section>
        <SectionHeading
          icon={Sparkles}
          eyebrow="PROJECTS"
          title="Experience"
          subtitle="Timeline view"
        />

        {projects.map((proj, index) => (
          <div key={index} className="mt-4 border p-4 rounded">
            <div
              onClick={() => setOpenProject(index)}
              className="cursor-pointer flex justify-between"
            >
              <div>
                <h3>{proj.client}</h3>
                <p className="text-gray-400">{proj.role}</p>
              </div>
              <span>{openProject === index ? "-" : "+"}</span>
            </div>

            {openProject === index && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3"
              >
                <p>{proj.summary}</p>
              </motion.div>
            )}
          </div>
        ))}
      </section>

      {/* EDUCATION */}
      <section>
        <SectionHeading
          icon={GraduationCap}
          eyebrow="EDUCATION"
          title="Education"
          subtitle=""
        />
        {education.map((edu) => (
          <p key={edu.degree}>
            {edu.degree} - {edu.school}
          </p>
        ))}
      </section>

      {/* CONTACT */}
      <section>
        <SectionHeading
          icon={Mail}
          eyebrow="CONTACT"
          title="Get in touch"
          subtitle=""
        />
        <p>📧 raghavbala35@gmail.com</p>
        <p>📞 +1 (313) 327-2802</p>
      </section>

    </div>
  );
}