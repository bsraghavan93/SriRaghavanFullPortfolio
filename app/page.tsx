"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  Cloud,
  Code2,
  Database,
  Download,
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

// ─── TYPES ────────────────────────────────────────────────────────────────────
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
  "Lead Full-Stack .NET Developer",
  "Cloud & Microservices Architect",
  "Agile & DevOps Leader",
  "Azure · AWS · GCP Multi-Cloud",
];

const TECH_LAYERS: TechLayer[] = [
  {
    id: "backend",
    label: "Backend",
    icon: Code2,
    border: "border-violet-500/30",
    gradient: "from-violet-500/15 via-violet-500/5 to-transparent",
    chip: "bg-violet-500/20 text-violet-200 border-violet-500/25",
    items: ["C#", "VB.NET", ".NET Core", "ASP.NET MVC", "REST APIs", "Entity Framework", "Node.js", "WCF", "LINQ", "SOAP"],
  },
  {
    id: "frontend",
    label: "Frontend",
    icon: Monitor,
    border: "border-cyan-500/30",
    gradient: "from-cyan-500/15 via-cyan-500/5 to-transparent",
    chip: "bg-cyan-500/20 text-cyan-200 border-cyan-500/25",
    items: ["Angular 2–18", "React 18", "Vue.js", "Blazor", "TypeScript", "Next.js", "JavaScript", "HTML5", "CSS3", "Bootstrap", "SASS"],
  },
  {
    id: "data",
    label: "Data & Messaging",
    icon: Database,
    border: "border-emerald-500/30",
    gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
    chip: "bg-emerald-500/20 text-emerald-200 border-emerald-500/25",
    items: ["SQL Server", "MongoDB", "Cosmos DB", "Redis", "RabbitMQ", "Kafka", "T-SQL", "PL/SQL", "SSIS", "SSRS", "Azure Synapse"],
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    icon: Cloud,
    border: "border-orange-500/30",
    gradient: "from-orange-500/15 via-orange-500/5 to-transparent",
    chip: "bg-orange-500/20 text-orange-200 border-orange-500/25",
    items: ["Azure", "AWS", "GCP", "Docker", "Kubernetes", "Azure DevOps", "CI/CD", "GitHub Actions", "Jenkins", "PowerShell", "Terraform"],
  },
];

const ACHIEVEMENTS = [
  {
    icon: Trophy,
    number: "01",
    title: "Cut Deployment Time by 94%",
    text: "Built Azure DevOps CI/CD pipelines with blue-green deployments at United Airlines — reducing release time from 4 hours to just 15 minutes with zero-downtime production deployments.",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "Reduced MTTR by 60% & API Latency by 70%",
    text: "Configured Kibana and Dynatrace APM for proactive monitoring, and implemented Redis caching for loyalty data — driving a 70% improvement in API response times.",
  },
  {
    icon: Layers3,
    number: "03",
    title: "Scaled to 10,000+ Concurrent Requests",
    text: "Built microservices with .NET Core 6, Docker, and Kubernetes at United Airlines with horizontal pod autoscaling and load balancing to handle peak loyalty transaction traffic.",
  },
];

const PROJECTS: Project[] = [
  {
    client: "United Airlines – Loyalty & Accrual Redemptions",
    role: "Lead Full Stack .NET Developer",
    period: "Mar 2025 – Present",
    summary:
      "Leading development of MileagePlus loyalty platform — building RESTful APIs, automated booking workflows, and real-time agent dashboards for loyalty currency management.",
    responsibilities: [
      "Developed RESTful APIs using C# .NET 6, ASP.NET Core 6.0, and Entity Framework Core 6 to manage MileagePlus miles, Plus Points, and Chase Cash loyalty currencies.",
      "Engineered automated workflows integrated with the Navigator agent-facing application that converted multi-hour manual booking processes into instant one-click operations.",
      "Implemented loyalty point calculation algorithms based on MileagePlus tiers (Premier Silver, Gold, Platinum, 1K), flight classes, distance, and promotional multipliers.",
      "Built microservices using .NET Core 6.0 with Docker 20.10 and Kubernetes 1.24, configuring horizontal pod autoscaling to handle 10,000+ concurrent requests during peak periods.",
      "Implemented Redis 6.2 caching layer and RabbitMQ 3.11 message queues — improving API response times by 70% and handling millions of asynchronous loyalty accrual events.",
      "Built Azure DevOps CI/CD pipelines with automated testing and blue-green deployments, cutting release time from 4 hours to 15 minutes with zero-downtime deployments.",
      "Secured APIs with OAuth 2.0, JWT authentication, RBAC, and PCI DSS-compliant data encryption for Chase credit card payment system integration.",
      "Built React 18 UI with TypeScript 4.9 and Redux Toolkit for agent dashboards with real-time loyalty balances, transaction histories, and redemption options.",
    ],
    stack: ["C# .NET 6", "ASP.NET Core", "React 18", "TypeScript", "Redux Toolkit", "MongoDB", "SQL Server", "Redis", "RabbitMQ", "Docker", "Kubernetes", "Azure DevOps"],
  },
  {
    client: "New Jersey Treasury (State of New Jersey)",
    role: "Lead Full Stack .NET Developer / Application Developer",
    period: "May 2024 – Mar 2025",
    summary:
      "Led modernization of enterprise claim processing applications — migrating legacy systems to modern .NET standards with Azure cloud services, Power BI dashboards, and automated workflows.",
    responsibilities: [
      "Led development and maintenance of web applications using .NET Framework and .NET Core, focusing on high performance, scalability, and security for state government systems.",
      "Managed migration of legacy applications to modern .NET standards, employing MVC architectural patterns and integrating Blazor WebAssembly with .NET Core APIs.",
      "Designed Azure Synapse pipelines for data ingestion, transformation, and analysis using SQL Pool, Spark Pool, and Data Flow alongside SSIS and Azure Data Factory.",
      "Conducted comprehensive API development and security testing with Microsoft Graph API, GraphQL, and ReadyAPI to ensure secure data integration.",
      "Automated batch processing of claim information and document scanning using Python and PowerShell, with serverless Azure Function Apps for workflow automation.",
      "Designed and developed Power BI reports and dashboards for actionable insights, and implemented OnBase Workflow automation for document approval processes.",
    ],
    stack: [".NET Core", "ASP.NET MVC", "Angular", "React", "Vue.js", "Blazor", "Azure", "SQL Server", "SSIS", "SSRS", "Azure Data Factory", "Azure Synapse", "Power BI", "Azure DevOps"],
  },
  {
    client: "United Airlines – Inflight Records",
    role: "Lead Full Stack .NET Developer",
    period: "Feb 2022 – Apr 2024",
    summary:
      "Spearheaded design and development of the Inflight Records system — building high-performance Web APIs, optimizing SQL workflows, and leading CI/CD and cloud delivery on AWS.",
    responsibilities: [
      "Spearheaded design and development of Web API projects for the Inflight Records system using C#, .NET 6, and Entity Framework, optimizing performance and scalability.",
      "Engineered multi-tier architecture applications with VB.NET and .NET Framework/Core, integrating Redux and Context API for complex UI state management.",
      "Implemented React performance optimizations using lazy loading, memoization, and virtualized lists, and developed reusable Angular 14 standalone components.",
      "Optimized SQL queries, indexing strategies, and caching mechanisms (Redis, Azure Cache for Redis) to enhance application performance significantly.",
      "Built and managed AWS-based CI/CD pipelines with automated cloud infrastructure provisioning, achieving high availability and streamlined deployments.",
      "Managed mission-critical Windows Services for uninterrupted Inflight Records data processing, and conducted incident management and root cause analysis.",
    ],
    stack: ["C# .NET 6", "ASP.NET Core", "Angular 14", "React", "TypeScript", "SQL Server", "Redis", "AWS", "Docker", "Kubernetes", "ReadyAPI", "Azure DevOps"],
  },
  {
    client: "Quicken Loans / Rocket Mortgage",
    role: "Full Stack .NET Developer",
    period: "May 2021 – Feb 2022",
    summary:
      "Built scalable APIs and responsive digital experiences for mortgage workflows — including a Blazor-based loan tracking module, real-time analytics with Azure Synapse, and containerized CI/CD delivery.",
    responsibilities: [
      "Led backend development of web APIs and services using C#, .NET Core, Azure, and Entity Framework, ensuring scalable and robust mortgage processing solutions.",
      "Engineered responsive web applications using Next.js with server-side rendering, contributing to a 50% increase in page views through improved performance and SEO rankings.",
      "Designed and developed a Blazor-based loan application tracking module, and migrated legacy Razor components to Blazor to reduce front-end code redundancy.",
      "Designed and implemented real-time analytics with Azure Synapse, Event Hub, and Stream Analytics for data-driven mortgage insights.",
      "Leveraged Docker and Jenkins for container-based CI/CD pipeline deployments to Kubernetes, and set up GitHub Actions for Azure Function App automation.",
      "Standardized web templates in TeamSite, achieving consistent branding and a 25% increase in user engagement across digital platforms.",
    ],
    stack: [".NET Core", "Next.js", "Angular 7", "React JS", "Blazor", "Azure Synapse", "Docker", "Kubernetes", "Azure DevOps", "GitHub Actions", "SQL Server"],
  },
  {
    client: "LinkedIn",
    role: "Full Stack .NET Developer",
    period: "Mar 2018 – May 2021",
    summary:
      "Engineered user-centric payment gateways and modern web applications — integrating legacy platforms with React, Angular, and .NET Core while driving CI/CD maturity and multi-cloud operations.",
    responsibilities: [
      "Engineered user-centric payment gateways and web applications by integrating legacy data with modern technologies like ReactJS, AngularJS, and .NET Core.",
      "Utilized Node.js to build and deploy microservices, enhancing modularity, scalability, and maintenance of backend services.",
      "Developed dynamic Blazor UI elements with real-time data binding using SignalR, and automated CI/CD pipelines using Azure DevOps.",
      "Provisioned and managed AWS resources (EC2, Auto Scaling Groups, Elastic Load Balancers) and optimized GCP services for scalability and cost-efficiency.",
      "Leveraged R and Python for advanced data analysis to drive data-driven decision-making and optimize database interactions.",
      "Championed MVC architecture, dependency injection, and entity framework practices while leading version control and code reviews with Git and TFS.",
    ],
    stack: [".NET Core", "React JS", "AngularJS", "Node.js", "Blazor", "Azure DevOps", "AWS", "GCP", "Docker", "Kubernetes", "SQL Server", "Azure"],
  },
  {
    client: "Wells Fargo",
    role: ".NET Developer",
    period: "Apr 2017 – Mar 2018",
    summary:
      "Led design and deployment of web applications and RESTful services for banking — implementing Kafka event streaming, Azure migrations, and analytics-focused APIs.",
    responsibilities: [
      "Led design, development, and deployment of web applications and RESTful services using .NET Core and Entity Framework for banking operations.",
      "Developed advanced user interfaces with React JS, enhancing user experience with animations and complex form functionalities.",
      "Implemented Kafka for event streaming, enhancing workflow efficiency and real-time data processing capabilities.",
      "Executed Azure migrations, optimizing application performance with Cosmos DB and SQL services using ARM Azure templates for infrastructure as code.",
      "Built CI/CD pipelines using Azure DevOps and GCP Terraform for automated deployments, and monitored performance with GCP Cloud Monitoring and Cloud Logging.",
      "Conducted end-to-end API performance and load testing using ReadyAPI integrated into CI/CD workflows.",
    ],
    stack: [".NET Core", "React JS", "Angular 2/4", "Azure", "Kafka", "Cosmos DB", "SQL Server", "Docker", "Azure DevOps", "GCP Terraform", "ReadyAPI"],
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

const RESUME_PATH = "/assets/Sri-Raghavan-Balasundaram-Resume.pdf";

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
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
      <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[120px]" />
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

      <div className="flex items-center gap-3">
        <a
          href={RESUME_PATH}
          download
          className="hidden md:flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[13px] text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <Download className="h-3.5 w-3.5" />
          Resume
        </a>
        <button
          onClick={onInterests}
          className="flex items-center gap-1.5 rounded-full border border-pink-400/30 bg-pink-400/10 px-4 py-1.5 text-[13px] text-pink-300 hover:bg-pink-400/20 transition-all duration-200"
        >
          <Heart className="h-3.5 w-3.5" />
          Interests
        </button>
      </div>
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
            Senior Professional Portfolio &nbsp;·&nbsp; {experienceYears}+ Years in the IT Domain
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
        <motion.p variants={fadeUp} className="max-w-2xl text-lg leading-8 text-slate-400">
          With over {experienceYears} years of enriching experience in the IT domain, I have carved a niche in designing, developing, and maintaining enterprise web applications — leveraging .NET technologies, modern front-end frameworks, and cloud services to drive digital transformation.
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
          <a
            href={RESUME_PATH}
            download
            className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-6 py-3 text-sm font-medium text-cyan-300 hover:bg-cyan-400/20 transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            Download Resume
          </a>
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
          Technologies grouped by engineering discipline — from backend foundation to cloud delivery, as they appear in my real-world work.
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
              transition={{ delay: index * 0.13, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              whileHover={{ scale: 1.008, transition: { duration: 0.2 } }}
              className={`rounded-2xl border ${layer.border} bg-gradient-to-r ${layer.gradient} p-5 md:p-6 backdrop-blur-sm cursor-default`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="flex items-center gap-3 md:min-w-[180px]">
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
          Measurable outcomes delivered across enterprise engagements — business value backed by real metrics.
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
                <span className="text-4xl font-bold text-white/[0.07] select-none">{item.number}</span>
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
          {PROJECTS.length} enterprise engagements across loyalty, government, airline, mortgage, and technology. Most recent expanded — click any to explore.
        </motion.p>
      </motion.div>

      <div className="relative">
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
                transition={{ delay: index * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                className="relative"
              >
                <motion.div
                  animate={
                    isOpen
                      ? { scale: 1.3, backgroundColor: "#22d3ee", borderColor: "#22d3ee" }
                      : { scale: 1, backgroundColor: "#1e293b", borderColor: "#475569" }
                  }
                  transition={{ duration: 0.25 }}
                  className="absolute -left-[44px] top-7 hidden md:block h-4 w-4 rounded-full border-2"
                />

                <div
                  className={`rounded-[28px] border overflow-hidden backdrop-blur-sm transition-all duration-300 ${
                    isOpen
                      ? "border-cyan-400/25 bg-gradient-to-b from-cyan-400/8 to-transparent"
                      : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]"
                  }`}
                >
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

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 md:px-8 pb-8 space-y-7">
                          <Separator className="bg-white/8" />
                          <div className="grid gap-8 lg:grid-cols-[1fr_220px]">
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
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="space-y-4"
      >
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl overflow-hidden">
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
        </div>

        {/* Resume download CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <a
            href={RESUME_PATH}
            download
            className="group flex items-center justify-center gap-3 rounded-[24px] border border-white/10 bg-white/5 p-6 hover:bg-white/8 hover:border-white/20 transition-all duration-200 backdrop-blur-sm"
          >
            <div className="rounded-2xl bg-white/10 p-3 text-white group-hover:bg-white/15 transition-colors duration-200">
              <Download className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium">Download Full Resume</div>
              <div className="text-slate-500 text-sm">Sri Raghavan Balasundaram · PDF</div>
            </div>
          </a>
        </motion.div>
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
            A glimpse into what drives curiosity outside of work. This section is coming soon — a more personal visual story.
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
              className="rounded-[28px] border border-dashed border-white/15 bg-white/[0.03] p-8 space-y-4 text-center"
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
