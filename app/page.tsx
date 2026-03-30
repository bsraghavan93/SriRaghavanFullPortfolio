"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  Cloud,
  Code2,
  Database,
  ExternalLink,
  GraduationCap,
  Heart,
  Layers3,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Project = {
  client: string;
  role: string;
  period: string;
  summary: string;
  responsibilities: string[];
  stack: string[];
};

type TechLayer = {
  id: string;
  label: string;
  icon: React.ElementType;
  border: string;
  gradient: string;
  chip: string;
  items: string[];
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const SKILL_HIGHLIGHTS = [
  "Senior .NET Full-Stack Developer",
  "Cloud & Microservices Engineer",
  "Modern UI / API Architect",
  "Azure DevOps & Delivery Focused",
];

const TECH_LAYERS: TechLayer[] = [
  {
    id: "backend",
    label: "Backend",
    icon: Code2,
    border: "border-violet-500/30",
    gradient: "from-violet-500/15 via-violet-500/5 to-transparent",
    chip: "bg-violet-500/20 text-violet-200 border-violet-500/25",
    items: ["C#", "VB.NET", ".NET Core", ".NET Framework", "ASP.NET MVC", "REST APIs", "Entity Framework", "WCF"],
  },
  {
    id: "frontend",
    label: "Frontend",
    icon: Monitor,
    border: "border-cyan-500/30",
    gradient: "from-cyan-500/15 via-cyan-500/5 to-transparent",
    chip: "bg-cyan-500/20 text-cyan-200 border-cyan-500/25",
    items: ["Angular", "React", "Vue.js", "Blazor", "TypeScript", "JavaScript", "HTML5", "CSS3", "Bootstrap", "SASS"],
  },
  {
    id: "data",
    label: "Data",
    icon: Database,
    border: "border-emerald-500/30",
    gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
    chip: "bg-emerald-500/20 text-emerald-200 border-emerald-500/25",
    items: ["SQL Server", "MongoDB", "Cosmos DB", "PL/SQL", "T-SQL", "SSIS", "SSRS", "Azure Data Factory", "Azure Synapse"],
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    icon: Cloud,
    border: "border-orange-500/30",
    gradient: "from-orange-500/15 via-orange-500/5 to-transparent",
    chip: "bg-orange-500/20 text-orange-200 border-orange-500/25",
    items: ["Azure", "AWS", "Docker", "Kubernetes", "Azure DevOps", "CI/CD", "Git", "PowerShell"],
  },
];

const ACHIEVEMENTS = [
  {
    icon: Trophy,
    number: "01",
    title: "Modernized Enterprise Claim Processing",
    text: "Led .NET + Azure modernization for NJ Treasury — improving reliability, security, and operational efficiency at enterprise scale.",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "Accelerated Delivery Across Teams",
    text: "Drove CI/CD adoption, platform migrations, and reusable engineering patterns — cutting deployment friction across multiple squads.",
  },
  {
    icon: Layers3,
    number: "03",
    title: "Full-Stack Impact Across Major Brands",
    text: "Delivered high-value applications across government, airline, mortgage, and tech domains with cloud-first, scalable architecture.",
  },
];

const PROJECTS: Project[] = [
  {
    client: "New Jersey Treasury",
    role: "Full Stack .NET Developer / Application Developer",
    period: "Jan 2023 – Present",
    summary:
      "Leading modernization of claim processing applications with scalable .NET architecture, modern UI frameworks, and Azure-driven automation.",
    responsibilities: [
      "Led development and maintenance of secure, high-performance web applications using .NET Framework and .NET Core.",
      "Modernized legacy systems into maintainable MVC-based solutions and improved long-term scalability.",
      "Built responsive interfaces using Angular, React, Vue.js, and Blazor for better usability and cross-browser consistency.",
      "Strengthened data and reporting workflows with SQL Server, SSIS, SSRS, Azure Data Factory, and Azure Synapse.",
      "Automated workflows and admin processes using Python, PowerShell, Azure Functions, and scheduled jobs.",
    ],
    stack: [".NET Core", "ASP.NET MVC", "Angular", "React", "Vue.js", "Azure", "SQL Server", "Azure DevOps"],
  },
  {
    client: "United Airlines",
    role: "Full Stack .NET Developer",
    period: "Feb 2022 – Dec 2022",
    summary:
      "Delivered API and UI solutions for inflight records platforms with strong focus on performance, integration reliability, and cloud delivery.",
    responsibilities: [
      "Designed and developed Web APIs using C#, .NET 6, and Entity Framework for enterprise airline operations.",
      "Built responsive front-end experiences and reusable UI modules with Angular, React patterns, and TypeScript.",
      "Improved deployment quality with ReadyAPI-based validation, CI/CD automation, and AWS infrastructure practices.",
      "Handled mission-critical incident resolution, batch processing improvements, and performance tuning across services and databases.",
    ],
    stack: ["C#", ".NET 6", "Angular", "TypeScript", "AWS", "SQL Server", "ReadyAPI"],
  },
  {
    client: "Rocket Mortgage",
    role: "Full Stack .NET Developer",
    period: "May 2021 – Feb 2022",
    summary:
      "Built scalable APIs and responsive digital experiences for mortgage workflows with a strong cloud, analytics, and DevOps foundation.",
    responsibilities: [
      "Developed backend APIs and services using C#, .NET Core, Azure, and Entity Framework.",
      "Created responsive applications with Angular, React, Next.js, Bootstrap, and modern JavaScript patterns.",
      "Supported analytics and event-driven workflows using Azure Synapse, Event Hub, and Stream Analytics.",
      "Streamlined delivery through Docker, Kubernetes, Azure DevOps, GitHub Actions, and serverless automation.",
    ],
    stack: [".NET Core", "Angular", "React", "Next.js", "Azure", "Docker", "Kubernetes"],
  },
  {
    client: "LinkedIn",
    role: "Full Stack .NET Developer",
    period: "Mar 2018 – May 2021",
    summary:
      "Built modern web applications and payment-related solutions while strengthening cloud operations, microservices, and CI/CD maturity.",
    responsibilities: [
      "Integrated legacy and modern platforms using React, AngularJS, .NET Core, and Node.js-based services.",
      "Improved deployment maturity by automating CI/CD pipelines and tightening code review practices.",
      "Supported multi-cloud operations across Azure, AWS, and GCP with a focus on scalability and secure infrastructure.",
      "Used Python, R, and SQL to support analysis, reporting, and data-informed engineering decisions.",
    ],
    stack: ["React", "AngularJS", ".NET Core", "Node.js", "Azure DevOps", "AWS", "GCP"],
  },
  {
    client: "Wells Fargo",
    role: ".NET Developer",
    period: "Apr 2017 – Mar 2018",
    summary:
      "Worked on banking application integrations and API-driven modernization with strong DevOps and data processing support.",
    responsibilities: [
      "Developed RESTful services and web applications using .NET Core and Entity Framework.",
      "Improved UI experience using React and modern interactive form patterns.",
      "Supported Azure migrations, SSIS data solutions, Kafka-based workflows, and CI/CD automation.",
    ],
    stack: [".NET Core", "React", "Azure", "Kafka", "SSIS", "Azure DevOps"],
  },
];

const EDUCATION = [
  {
    degree: "Master's Degree – Information Technology Management",
    school: "Golden Gate University, California",
    year: "2017",
  },
  {
    degree: "Bachelor's Degree – Computer Science and Engineering",
    school: "Anna University, Tamil Nadu, India",
    year: "2015",
  },
];

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── BACKGROUND ───────────────────────────────────────────────────────────────
function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-60 left-1/4 h-[700px] w-[700px] rounded-full bg-violet-600/10 blur-[140px]" />
      <div className="absolute top-1/3 -right-20 h-[600px] w-[600px] rounded-full bg-cyan-600/10 blur-[140px]" />
      <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-fuchsia-600/8 blur-[120px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:80px_80px]" />
    </div>
  );
}

// ─── SECTION PILL ─────────────────────────────────────────────────────────────
function SectionPill({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-400">
      <Icon className="h-3 w-3" />
      {label}
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({ onInterests }: { onInterests: () => void }) {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 backdrop-blur-xl bg-black/25 border-b border-white/5"
    >
      <span className="font-semibold text-white tracking-tight">Sri Raghavan</span>

      <div className="hidden md:flex items-center gap-6 text-[13px] text-slate-400">
        {[
          { id: "stack", label: "Stack" },
          { id: "achievements", label: "Achievements" },
          { id: "experience", label: "Experience" },
          { id: "education", label: "Education" },
          { id: "contact", label: "Contact" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="hover:text-white transition-colors duration-200"
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={onInterests}
        className="flex items-center gap-1.5 rounded-full border border-pink-400/30 bg-pink-400/10 px-4 py-1.5 text-[13px] text-pink-300 hover:bg-pink-400/20 transition-all duration-200"
      >
        <Heart className="h-3.5 w-3.5" />
        Interests
      </button>
    </motion.nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const experienceYears = useMemo(() => new Date().getFullYear() - 2015, []);

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center px-6 md:px-12 py-24">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="max-w-5xl space-y-9"
      >
        {/* Eyebrow */}
        <motion.div variants={fadeUp}>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1.5 text-sm text-cyan-300">
            <User className="h-3.5 w-3.5" />
            Senior Professional Portfolio &nbsp;·&nbsp; {experienceYears}+ Years
          </div>
        </motion.div>

        {/* Name */}
        <motion.div variants={fadeUp} className="space-y-1">
          <h1 className="text-[clamp(3rem,9vw,7rem)] font-bold tracking-tight leading-none text-white">
            Sri Raghavan
          </h1>
          <h1 className="text-[clamp(3rem,9vw,7rem)] font-bold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400">
            Balasundaram
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          className="max-w-2xl text-lg leading-8 text-slate-400"
        >
          Full-stack .NET developer building enterprise-grade web applications, cloud platforms, and scalable API ecosystems across government, airline, mortgage, and technology sectors.
        </motion.p>

        {/* Skill badges */}
        <motion.div variants={fadeUp} className="flex flex-wrap gap-2.5">
          {SKILL_HIGHLIGHTS.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-sm"
            >
              {skill}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
          <button
            onClick={() => document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors duration-200"
          >
            View Experience
          </button>
          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors duration-200 backdrop-blur-sm"
          >
            Get In Touch
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
      >
        <div className="h-10 w-px bg-gradient-to-b from-transparent to-slate-600" />
        <span className="text-xs tracking-[0.2em] uppercase">Scroll</span>
      </motion.div>
    </section>
  );
}

// ─── TECH STACK ───────────────────────────────────────────────────────────────
function TechStack() {
  return (
    <section id="stack" className="px-6 md:px-12 py-24 space-y-14">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="space-y-4"
      >
        <motion.div variants={fadeUp}>
          <SectionPill icon={Layers3} label="Tech Stack" />
        </motion.div>
        <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white">
          Built layer by layer,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
            end to end
          </span>
        </motion.h2>
        <motion.p variants={fadeUp} className="text-slate-400 max-w-2xl text-base leading-7">
          Technologies grouped by engineering discipline — from the backend foundation all the way up to cloud delivery.
        </motion.p>
      </motion.div>

      <div className="space-y-3">
        {TECH_LAYERS.map((layer, index) => {
          const Icon = layer.icon;
          return (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: index * 0.13, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.008, transition: { duration: 0.2 } }}
              className={`rounded-2xl border ${layer.border} bg-gradient-to-r ${layer.gradient} p-5 md:p-6 backdrop-blur-sm cursor-default`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="flex items-center gap-3 md:min-w-[160px]">
                  <div className={`rounded-xl p-2.5 border ${layer.chip}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-white text-base">{layer.label}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {layer.items.map((item) => (
                    <span
                      key={item}
                      className={`rounded-full border px-3 py-1 text-sm ${layer.chip}`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────
function Achievements() {
  return (
    <section id="achievements" className="px-6 md:px-12 py-24 space-y-14">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="space-y-4"
      >
        <motion.div variants={fadeUp}>
          <SectionPill icon={Trophy} label="Achievements" />
        </motion.div>
        <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white">
          Impact, not just{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            output
          </span>
        </motion.h2>
        <motion.p variants={fadeUp} className="text-slate-400 max-w-2xl text-base leading-7">
          Outcomes that go beyond task completion — business value delivered across enterprise engagements.
        </motion.p>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-6 md:grid-cols-3"
      >
        {ACHIEVEMENTS.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              variants={fadeUp}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-sm space-y-6"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-300 group-hover:bg-emerald-400/20 transition-colors duration-200">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-4xl font-bold text-white/8 select-none">{item.number}</span>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-white leading-snug">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-7">{item.text}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

// ─── EXPERIENCE ───────────────────────────────────────────────────────────────
function Experience() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section id="experience" className="px-6 md:px-12 py-24 space-y-14">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="space-y-4"
      >
        <motion.div variants={fadeUp}>
          <SectionPill icon={Sparkles} label="Experience" />
        </motion.div>
        <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white">
          Project{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
            timeline
          </span>
        </motion.h2>
        <motion.p variants={fadeUp} className="text-slate-400 max-w-2xl text-base leading-7">
          {PROJECTS.length} enterprise engagements across government, airline, mortgage, and technology. First role expanded — click any to explore.
        </motion.p>
      </motion.div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-5 top-8 bottom-8 w-px bg-gradient-to-b from-cyan-400/60 via-violet-400/30 to-transparent hidden md:block" />

        <div className="space-y-4 md:pl-16">
          {PROJECTS.map((project, index) => {
            const isOpen = open === index;
            return (
              <motion.div
                key={project.client}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                {/* Timeline dot */}
                <motion.div
                  animate={isOpen ? { scale: 1.3, backgroundColor: "#22d3ee" } : { scale: 1, backgroundColor: "#1e293b" }}
                  transition={{ duration: 0.25 }}
                  className="absolute -left-[44px] top-7 hidden md:block h-4 w-4 rounded-full border-2 border-slate-600"
                  style={isOpen ? { borderColor: "#22d3ee" } : {}}
                />

                <div
                  className={`rounded-[28px] border overflow-hidden backdrop-blur-sm transition-all duration-300 ${
                    isOpen
                      ? "border-cyan-400/25 bg-gradient-to-b from-cyan-400/8 to-transparent"
                      : "border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/6"
                  }`}
                >
                  {/* Header — always visible */}
                  <button
                    onClick={() => setOpen(isOpen ? -1 : index)}
                    className="w-full text-left p-6 md:p-8"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                          {project.period}
                        </p>
                        <h3 className="text-xl md:text-2xl font-semibold text-white">
                          {project.client}
                        </h3>
                        <p className="text-cyan-400 text-sm">{project.role}</p>
                        <p className="text-slate-400 text-sm mt-3 max-w-2xl leading-6">
                          {project.summary}
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className={`flex-shrink-0 rounded-full border p-2 transition-colors duration-300 ${
                          isOpen
                            ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-300"
                            : "border-white/10 bg-white/5 text-slate-500"
                        }`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 md:px-8 pb-8 space-y-7">
                          <Separator className="bg-white/8" />
                          <div className="grid gap-8 lg:grid-cols-[1fr_220px]">
                            {/* Responsibilities */}
                            <div className="space-y-3">
                              <h4 className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                                Key Responsibilities
                              </h4>
                              {project.responsibilities.map((r) => (
                                <div
                                  key={r}
                                  className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-slate-300 leading-7"
                                >
                                  <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400" />
                                  {r}
                                </div>
                              ))}
                            </div>

                            {/* Stack */}
                            <div className="space-y-3">
                              <h4 className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                                Stack Used
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {project.stack.map((s) => (
                                  <span
                                    key={s}
                                    className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-200"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── EDUCATION ────────────────────────────────────────────────────────────────
function Education() {
  return (
    <section id="education" className="px-6 md:px-12 py-24 space-y-14">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="space-y-4"
      >
        <motion.div variants={fadeUp}>
          <SectionPill icon={GraduationCap} label="Education" />
        </motion.div>
        <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white">
          Academic foundation
        </motion.h2>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-6 md:grid-cols-2"
      >
        {EDUCATION.map((item) => (
          <motion.div
            key={item.degree}
            variants={fadeUp}
            whileHover={{ y: -5, transition: { duration: 0.25 } }}
            className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-sm space-y-4"
          >
            <div className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-500">
              {item.year}
            </div>
            <h3 className="text-xl font-semibold text-white leading-snug">{item.degree}</h3>
            <p className="text-slate-400">{item.school}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────
function Contact() {
  const items = [
    { icon: Phone, label: "Phone", value: "+1 (313) 327-2802", href: "tel:+13133272802" },
    { icon: Mail, label: "Email", value: "raghavbala35@gmail.com", href: "mailto:raghavbala35@gmail.com" },
    { icon: MapPin, label: "Location", value: "United States", href: null },
  ];

  return (
    <section id="contact" className="px-6 md:px-12 py-24 space-y-14">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="space-y-4"
      >
        <motion.div variants={fadeUp}>
          <SectionPill icon={Mail} label="Contact" />
        </motion.div>
        <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white">
          Let&apos;s connect
        </motion.h2>
        <motion.p variants={fadeUp} className="text-slate-400 max-w-xl text-base leading-7">
          Open to new opportunities, senior-level engagements, and thoughtful collaborations.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl overflow-hidden"
      >
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/8">
          {items.map(({ icon: Icon, label, value, href }) => {
            const inner = (
              <div className="group p-8 md:p-10 space-y-4 hover:bg-white/5 transition-colors duration-200">
                <div className="inline-flex rounded-2xl bg-cyan-400/10 p-3 text-cyan-300 group-hover:bg-cyan-400/20 transition-colors duration-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500">{label}</div>
                <div className="text-lg font-medium text-white break-all leading-snug">{value}</div>
              </div>
            );
            return href ? (
              <a key={label} href={href} className="block">
                {inner}
              </a>
            ) : (
              <div key={label}>{inner}</div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="px-6 md:px-12 py-10 border-t border-white/5 text-center text-sm text-slate-600">
      © {new Date().getFullYear()} Sri Raghavan Balasundaram
    </footer>
  );
}

// ─── INTERESTS PAGE ───────────────────────────────────────────────────────────
function InterestsPage({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#030711] text-white"
    >
      <Background />
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-12 space-y-16">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portfolio
        </button>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-400/10 px-4 py-2 text-sm text-pink-300">
              <Heart className="h-4 w-4" />
              Beyond the Code
            </div>
          </motion.div>
          <motion.div variants={fadeUp}>
            <h1 className="text-5xl md:text-7xl font-bold text-white">
              Hobbies &amp;
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
                Interests
              </span>
            </h1>
          </motion.div>
          <motion.p variants={fadeUp} className="text-slate-400 max-w-xl text-lg leading-8">
            A glimpse into what drives curiosity outside of work. This section is a placeholder — coming soon as a more personal visual story.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid gap-5 md:grid-cols-3"
        >
          {[
            { label: "Photography & Creative Work", symbol: "◈" },
            { label: "Technology Exploration", symbol: "◎" },
            { label: "Personal Interests & Lifestyle", symbol: "◇" },
          ].map((item) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              whileHover={{ y: -5, transition: { duration: 0.25 } }}
              className="rounded-[28px] border border-dashed border-white/15 bg-white/4 p-8 space-y-4 text-center"
            >
              <div className="text-3xl text-slate-500">{item.symbol}</div>
              <div className="text-slate-300 text-sm leading-6">{item.label}</div>
              <div className="text-xs text-slate-600 uppercase tracking-[0.2em]">Coming soon</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function PortfolioSite() {
  const [page, setPage] = useState<"main" | "interests">("main");

  return (
    <AnimatePresence mode="wait">
      {page === "interests" ? (
        <InterestsPage key="interests" onBack={() => setPage("main")} />
      ) : (
        <motion.div
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-[#030711] text-white min-h-screen"
        >
          <Background />
          <div className="relative z-10">
            <Nav onInterests={() => setPage("interests")} />
            <div className="max-w-7xl mx-auto">
              <Hero />
              <TechStack />
              <Achievements />
              <Experience />
              <Education />
              <Contact />
            </div>
            <Footer />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
