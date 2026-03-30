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

const skillHighlights = [
  "Senior .NET Full-Stack Developer",
  "Cloud & Microservices Engineer",
  "Modern UI / API Architect",
  "Azure DevOps & Delivery Focused",
];

const techStacks = [
  {
    title: "Backend",
    items: ["C#", "VB.NET", ".NET Core", ".NET Framework", "ASP.NET MVC", "REST APIs", "Entity Framework", "WCF"],
  },
  {
    title: "Frontend",
    items: ["Angular", "React", "Vue.js", "Blazor", "TypeScript", "JavaScript", "HTML5", "CSS3", "Bootstrap", "SASS"],
  },
  {
    title: "Data",
    items: ["SQL Server", "MongoDB", "Cosmos DB", "PL/SQL", "T-SQL", "SSIS", "SSRS", "Azure Data Factory", "Azure Synapse"],
  },
  {
    title: "Cloud & DevOps",
    items: ["Azure", "AWS", "Docker", "Kubernetes", "Azure DevOps", "CI/CD", "Git", "PowerShell"],
  },
];

const achievements = [
  {
    title: "Modernized enterprise claim processing platform",
    text: "Led modernization work for New Jersey Treasury using .NET and Azure, improving reliability, security, and day-to-day operational efficiency.",
  },
  {
    title: "Improved delivery speed across enterprise teams",
    text: "Helped drive platform migrations, CI/CD adoption, and reusable engineering patterns that accelerated development and reduced deployment friction.",
  },
  {
    title: "Built scalable full-stack solutions across major enterprises",
    text: "Delivered high-impact applications across finance, airline, mortgage, and technology domains with strong backend, UI, and cloud ownership.",
  },
];

const projects = [
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

const education = [
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

function SectionHeading({ icon: Icon, eyebrow, title, subtitle }: { icon: React.ElementType; eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="space-y-3">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">
        <Icon className="h-3.5 w-3.5" />
        {eyebrow}
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
        <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-base">{subtitle}</p>
      </div>
    </div>
  );
}

function GridGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[-10%] top-0 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="absolute right-[-5%] top-20 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />
    </div>
  );
}

export default function PortfolioSite() {
  const [activePage, setActivePage] = useState("portfolio");
  const [openProject, setOpenProject] = useState(0);

  const experienceYears = useMemo(() => {
    const start = 2015;
    return new Date().getFullYear() - start;
  }, []);

  if (activePage === "interests") {
    return (
      <div className="min-h-screen bg-[#050816] text-white">
        <div className="relative mx-auto max-w-6xl px-6 py-10 md:px-10">
          <GridGlow />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <Button
              variant="outline"
              onClick={() => setActivePage("portfolio")}
              className="mb-8 border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
            </Button>

            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardContent className="p-8 md:p-12">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-pink-500/10 px-4 py-2 text-sm text-pink-200">
                  <Heart className="h-4 w-4" /> Side Page Placeholder
                </div>
                <h1 className="text-3xl font-semibold md:text-5xl">Hobbies & Interests</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                  This section is intentionally kept as a future expansion page. We can later design it as a more personal, visual story with cards, travel, photography, hobbies, interests, certifications, and behind-the-scenes details.
                </p>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                  {[
                    "Photography & creative work",
                    "Technology exploration",
                    "Personal interests & lifestyle",
                  ].map((item) => (
                    <div key={item} className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-6 text-slate-300">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-10">
        <GridGlow />

        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Modern portfolio concept / Vercel-ready single page
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => {
                  const section = document.getElementById("experience");
                  section?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                View Experience
              </Button>
              <Button
                className="rounded-full bg-white text-slate-900 hover:bg-slate-200"
                onClick={() => setActivePage("interests")}
              >
                Hobbies & Interests <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <Card className="overflow-hidden rounded-[32px] border-white/10 bg-white/5 backdrop-blur-xl">
              <CardContent className="p-8 md:p-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
                    <User className="h-4 w-4" /> Senior Professional Portfolio
                  </div>

                  <div className="space-y-4">
                    <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
                      Sri Raghavan <span className="text-slate-400">Balasundaram</span>
                    </h1>
                    <p className="max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
                      Full-stack .NET developer with {experienceYears}+ years of experience designing enterprise web applications, cloud-enabled platforms, modern user interfaces, and scalable API ecosystems across public sector, airline, mortgage, banking, and technology domains.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {skillHighlights.map((item) => (
                      <Badge
                        key={item}
                        className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-normal text-slate-100 hover:bg-white/10"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-slate-300">
                  <Layers3 className="h-4 w-4" /> Snapshot
                </div>
                <div className="space-y-5">
                  {[
                    ["Experience", `${experienceYears}+ years`],
                    ["Primary Focus", ".NET / Cloud / UI"],
                    ["Delivery Style", "Agile + DevOps"],
                    ["Domains", "Government, Airline, Finance"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="text-sm text-slate-400">{label}</div>
                      <div className="mt-1 text-lg font-medium text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.header>

        <main className="relative z-10 mt-20 space-y-20">
          <section id="stack" className="space-y-8">
            <SectionHeading
              icon={Layers3}
              eyebrow="Tech Stack"
              title="My stack, organized the way recruiters and teams actually read it"
              subtitle="Instead of a flat skill dump, the stack is grouped by engineering layer so the page feels more premium, easier to scan, and stronger in interviews or hiring screens."
            />

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {techStacks.map((group, index) => (
                <motion.div
                  key={group.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card className="h-full rounded-[28px] border-white/10 bg-white/5 backdrop-blur-xl">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white">{group.title}</h3>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          <section id="achievements" className="space-y-8">
            <SectionHeading
              icon={Trophy}
              eyebrow="Recent Wins"
              title="Achievements that add business value, not just task completion"
              subtitle="This section highlights the bigger outcomes behind the engineering work so the portfolio feels executive-ready instead of reading like a plain resume clone."
            />

            <div className="grid gap-5 lg:grid-cols-3">
              {achievements.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card className="h-full rounded-[28px] border-white/10 bg-white/5 backdrop-blur-xl">
                    <CardContent className="p-7">
                      <div className="mb-4 inline-flex rounded-full bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
                        Achievement {index + 1}
                      </div>
                      <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                      <p className="mt-4 text-sm leading-7 text-slate-300">{item.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          <section id="experience" className="space-y-8">
            <SectionHeading
              icon={Sparkles}
              eyebrow="Project Timeline"
              title="Detailed project responsibilities with a premium timeline accordion"
              subtitle="The most recent role opens by default, while earlier engagements stay collapsed for a cleaner first impression. This keeps the site informative without overwhelming the visitor."
            />

            <div className="relative pl-0 md:pl-8">
              <div className="absolute left-3 top-0 hidden h-full w-px bg-gradient-to-b from-cyan-400/40 via-white/10 to-transparent md:block" />
              <div className="space-y-5">
                {projects.map((project, index) => {
                  const isOpen = openProject === index;
                  return (
                    <motion.div
                      key={`${project.client}-${project.period}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      <div className="absolute -left-[21px] top-8 hidden h-3 w-3 rounded-full border border-cyan-300/40 bg-cyan-300 md:block" />
                      <Card className="overflow-hidden rounded-[30px] border-white/10 bg-white/5 backdrop-blur-xl">
                        <button
                          onClick={() => setOpenProject(isOpen ? -1 : index)}
                          className="w-full text-left"
                        >
                          <CardContent className="p-6 md:p-8">
                            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{project.period}</p>
                                <h3 className="mt-2 text-2xl font-semibold text-white">{project.client}</h3>
                                <p className="mt-2 text-base text-cyan-200">{project.role}</p>
                                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{project.summary}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="hidden max-w-xs flex-wrap justify-end gap-2 md:flex">
                                  {project.stack.slice(0, 4).map((item) => (
                                    <span
                                      key={item}
                                      className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-slate-200"
                                    >
                                      {item}
                                    </span>
                                  ))}
                                </div>
                                <div className="rounded-full border border-white/10 bg-white/10 p-2 text-white">
                                  {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                </div>
                              </div>
                            </div>

                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <Separator className="my-6 bg-white/10" />
                                  <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
                                    <div>
                                      <h4 className="mb-4 text-sm uppercase tracking-[0.2em] text-slate-400">Key Responsibilities</h4>
                                      <div className="space-y-3">
                                        {project.responsibilities.map((item) => (
                                          <div
                                            key={item}
                                            className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-slate-200"
                                          >
                                            {item}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="mb-4 text-sm uppercase tracking-[0.2em] text-slate-400">Stack Used</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {project.stack.map((item) => (
                                          <Badge
                                            key={item}
                                            className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 font-normal text-cyan-100 hover:bg-cyan-400/10"
                                          >
                                            {item}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </CardContent>
                        </button>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          <section id="education" className="space-y-8">
            <SectionHeading
              icon={GraduationCap}
              eyebrow="Education"
              title="Academic foundation"
              subtitle="Presented in a compact visual format so it supports the brand without taking too much attention away from your engineering impact."
            />

            <div className="grid gap-5 md:grid-cols-2">
              {education.map((item, index) => (
                <motion.div
                  key={item.degree}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card className="rounded-[28px] border-white/10 bg-white/5 backdrop-blur-xl">
                    <CardContent className="p-7">
                      <div className="text-sm uppercase tracking-[0.2em] text-slate-400">{item.year}</div>
                      <h3 className="mt-3 text-xl font-semibold text-white">{item.degree}</h3>
                      <p className="mt-3 text-slate-300">{item.school}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          <section id="contact" className="space-y-8">
            <SectionHeading
              icon={Mail}
              eyebrow="Contact"
              title="Let's connect"
              subtitle="Simple, premium contact layout with direct actions. Later, we can expand this with GitHub, LinkedIn, a contact form, resume download, and Vercel project links."
            />

            <Card className="rounded-[32px] border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardContent className="grid gap-6 p-8 md:grid-cols-3 md:p-10">
                <a href="tel:+13133272802" className="rounded-3xl border border-white/10 bg-black/20 p-6 transition hover:bg-black/30">
                  <Phone className="mb-4 h-5 w-5 text-cyan-300" />
                  <div className="text-sm text-slate-400">Phone</div>
                  <div className="mt-2 text-lg font-medium text-white">+1 (313) 327-2802</div>
                </a>
                <a href="mailto:raghavbala35@gmail.com" className="rounded-3xl border border-white/10 bg-black/20 p-6 transition hover:bg-black/30">
                  <Mail className="mb-4 h-5 w-5 text-cyan-300" />
                  <div className="text-sm text-slate-400">Email</div>
                  <div className="mt-2 text-lg font-medium text-white break-all">raghavbala35@gmail.com</div>
                </a>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
                  <MapPin className="mb-4 h-5 w-5 text-cyan-300" />
                  <div className="text-sm text-slate-400">Location</div>
                  <div className="mt-2 text-lg font-medium text-white">United States</div>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
