"use client";

/**
 * Crumble — Resume / CV Page Template
 * Two-column layout: sidebar with sketchy avatar + contact + skills progress bars,
 * main column with Timeline experience, education section, and rough-highlighted
 * section headers.
 *
 * Registry components: Avatar, Progress, Timeline, TimelineItem, Card, Badge,
 *                      RoughHighlight, RoughLine, Separator, Button
 */

import Link from "next/link";
import { Avatar } from "@/registry/new-york/ui/avatar";
import { Progress } from "@/registry/new-york/ui/progress";
import { Timeline, TimelineItem } from "@/registry/new-york/ui/timeline";
import { Card } from "@/registry/new-york/ui/card";
import { Badge } from "@/registry/new-york/ui/badge";
import { Button } from "@/registry/new-york/ui/button";
import { RoughHighlight } from "@/components/primitives/rough-highlight";
import { RoughLine } from "@/components/primitives/rough-line";
import { Separator } from "@/registry/new-york/ui/separator";

const SKILLS = [
  { name: "React / Next.js", value: 95 },
  { name: "TypeScript", value: 88 },
  { name: "Figma / Design", value: 85 },
  { name: "Node.js / APIs", value: 78 },
  { name: "CSS / Animation", value: 90 },
  { name: "Rough.js / SVG", value: 80 },
];

const EXPERIENCE = [
  {
    id: "exp-1",
    title: "Senior Product Designer",
    company: "Meridian SaaS · Full-time",
    period: "2022 – Present",
    status: "active" as const,
    desc: "Led design system overhaul used by 12-person product org. Shipped 40+ components and reduced design-to-dev handoff time by 60%.",
    tags: ["Figma", "React", "Design Systems"],
  },
  {
    id: "exp-2",
    title: "Frontend Engineer",
    company: "Nova Health · Full-time",
    period: "2020 – 2022",
    status: "complete" as const,
    desc: "Built patient-facing web app serving 50k MAU. Introduced component library and improved Lighthouse score from 54 to 94.",
    tags: ["Next.js", "TypeScript", "Tailwind"],
  },
  {
    id: "exp-3",
    title: "UI/UX Designer",
    company: "Freelance",
    period: "2018 – 2020",
    status: "complete" as const,
    desc: "Designed brand identities and digital products for 15+ clients across fintech, healthcare, and media.",
    tags: ["Branding", "Webflow", "Illustration"],
  },
];

const EDUCATION = [
  {
    id: "edu-1",
    title: "B.Design, Visual Communication",
    school: "NID Ahmedabad",
    period: "2014 – 2018",
    status: "complete" as const,
    desc: "Graduated with distinction. Thesis on 'Accessible Aesthetic' — designing for neurodivergent users.",
  },
];

const CONTACT = [
  { label: "Email", value: "arjun@arjun.dev", href: "mailto:arjun@arjun.dev" },
  { label: "Site", value: "arjun.dev", href: "https://arjun.dev" },
  { label: "GitHub", value: "/arjunkapoor", href: "https://github.com" },
  { label: "LinkedIn", value: "/in/arjunkapoor", href: "https://linkedin.com" },
];

const AWARDS = [
  "Awwwards SOTD — Bloom E-commerce 2024",
  "CSS Design Awards — Nova Health 2022",
  "India Design Award Finalist 2023",
];

export default function ResumePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Print / download bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 bg-background/90 backdrop-blur border-b border-border/20 print:hidden">
        <Link
          href="/"
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </Link>
        <Button size="sm" onClick={() => window.print()}>
          Download PDF ↓
        </Button>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12 grid md:grid-cols-[280px_1fr] gap-12">
        {/* ── Sidebar ── */}
        <aside className="flex flex-col gap-8">
          {/* Identity */}
          <div className="flex flex-col items-center text-center gap-4">
            <Avatar fallback="AK" size={88} id="resume-avatar" />
            <div>
              <h1 className="text-xl font-medium">Arjun Kapoor</h1>
              <p className="text-[13px] text-muted-foreground mt-1">
                Senior Product Designer
              </p>
              <p className="text-[12px] text-muted-foreground">
                Bangalore, India
              </p>
            </div>
            <Badge id="resume-status" variant="success">
              Open to work
            </Badge>
          </div>

          <RoughLine orientation="horizontal" id="resume-div-1" />

          {/* Contact */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-4">
              Contact
            </p>
            <ul className="flex flex-col gap-3">
              {CONTACT.map((c) => (
                <li key={c.label} className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {c.label}
                  </span>
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="text-[13px] hover:underline underline-offset-2"
                  >
                    {c.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <RoughLine orientation="horizontal" id="resume-div-2" />

          {/* Skills */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-5">
              Skills
            </p>
            <div className="flex flex-col gap-4">
              {SKILLS.map((s) => (
                <Progress
                  key={s.name}
                  id={`skill-${s.name}`}
                  label={s.name}
                  value={s.value}
                  showValue
                />
              ))}
            </div>
          </div>

          <RoughLine orientation="horizontal" id="resume-div-3" />

          {/* Awards */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-4">
              Recognition
            </p>
            <ul className="flex flex-col gap-2.5">
              {AWARDS.map((a) => (
                <li
                  key={a}
                  className="flex items-start gap-2 text-[12px] text-muted-foreground"
                >
                  <span className="text-[10px] mt-0.5 shrink-0">✦</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex flex-col gap-12">
          {/* Summary */}
          <section>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-4">
              About
            </p>
            <p className="text-[16px] leading-relaxed">
              I&apos;m a product designer with{" "}
              <RoughHighlight
                type="underline"
                color="currentColor"
                opacity={0.4}
                animate
                id="resume-hl1"
              >
                6 years of experience
              </RoughHighlight>{" "}
              bridging the gap between design and engineering. I care about
              craft, accessibility, and shipping things that genuinely work —
              not just things that look good in Figma.
            </p>
          </section>

          <Separator id="resume-sep-1" />

          {/* Experience */}
          <section>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-6">
              Experience
            </p>
            <Timeline>
              {EXPERIENCE.map((exp, i) => (
                <TimelineItem
                  key={exp.id}
                  id={exp.id}
                  title={exp.title}
                  time={exp.period}
                  status={exp.status}
                  isLast={i === EXPERIENCE.length - 1}
                  description={
                    <div className="flex flex-col gap-3 mt-1">
                      <p className="text-[12px] font-medium text-muted-foreground">
                        {exp.company}
                      </p>
                      <p className="text-[13px] leading-relaxed text-muted-foreground">
                        {exp.desc}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {exp.tags.map((tag) => (
                          <Badge
                            key={tag}
                            id={`${exp.id}-${tag}`}
                            variant="outline"
                            className="text-[10px]"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  }
                />
              ))}
            </Timeline>
          </section>

          <Separator id="resume-sep-2" />

          {/* Education */}
          <section>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-6">
              Education
            </p>
            <Timeline>
              {EDUCATION.map((edu, i) => (
                <TimelineItem
                  key={edu.id}
                  id={edu.id}
                  title={edu.title}
                  time={edu.period}
                  status={edu.status}
                  isLast={i === EDUCATION.length - 1}
                  description={
                    <div className="flex flex-col gap-1.5 mt-1">
                      <p className="text-[12px] font-medium text-muted-foreground">
                        {edu.school}
                      </p>
                      <p className="text-[13px] leading-relaxed text-muted-foreground">
                        {edu.desc}
                      </p>
                    </div>
                  }
                />
              ))}
            </Timeline>
          </section>

          <Separator id="resume-sep-3" />

          {/* Selected work */}
          <section>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-5">
              Selected Work
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Nova Rebrand",
                "Meridian Design System",
                "Fieldnotes App",
                "Atlas Typeface",
              ].map((project, i) => (
                <Card
                  key={project}
                  id={`work-card-${i}`}
                  padding={20}
                  className="flex items-center justify-between gap-3"
                >
                  <p className="text-[13px] font-medium">{project}</p>
                  <Link
                    href={`/work/${project.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <Button size="sm" variant="ghost" className="text-[11px]">
                      View →
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
