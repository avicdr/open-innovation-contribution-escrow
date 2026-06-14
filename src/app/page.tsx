import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  CircleDollarSign,
  Coins,
  Cpu,
  Database,
  FileBadge,
  Flag,
  Gauge,
  GitBranch,
  GitPullRequest,
  Globe,
  IdCard,
  Layers,
  Lock,
  Network,
  Play,
  Rocket,
  Sparkles,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InnovationSpiderGraph } from "@/features/dna-graph/components/innovation-spider-graph";

type IconItem = {
  readonly icon: LucideIcon;
  readonly label: string;
};

type Pillar = {
  readonly icon: LucideIcon;
  readonly num: string;
  readonly tag: string;
  readonly title: string;
  readonly body: string;
  readonly tone: string;
};

const navLinks = [
  ["About", "#problem"],
  ["How it works", "#how"],
  ["Features", "#features"],
  ["Tech", "#tech"],
  ["Demo", "#simulation"],
] as const;

const logos: readonly IconItem[] = [
  { icon: Workflow, label: "Next.js" },
  { icon: Cpu, label: "TypeScript" },
  { icon: Layers, label: "Tailwind" },
  { icon: Brain, label: "Gemini" },
  { icon: Lock, label: "Solidity" },
  { icon: Network, label: "Base Sepolia" },
  { icon: Database, label: "MongoDB" },
  { icon: GitBranch, label: "IPFS" },
  { icon: Globe, label: "Vercel" },
];

const silos: readonly Pillar[] = [
  {
    icon: GitBranch,
    num: "01",
    tag: "GitHub",
    title: "Tracks code",
    body: "but not the researcher who shaped the idea.",
    tone: "text-innovation",
  },
  {
    icon: FileBadge,
    num: "02",
    tag: "Docs",
    title: "Track decisions",
    body: "but not who validated the hypothesis.",
    tone: "text-reputation",
  },
  {
    icon: Coins,
    num: "03",
    tag: "DAOs",
    title: "Track funding",
    body: "but not where the money actually went.",
    tone: "text-funding",
  },
  {
    icon: Sparkles,
    num: "04",
    tag: "AI tools",
    title: "Suggest ideas",
    body: "but cannot tell you who deserves credit.",
    tone: "text-ai",
  },
];

const pillars: readonly Pillar[] = [
  {
    icon: Brain,
    num: "01",
    tag: "Intelligence",
    title: "Gemini AI",
    body: "Evaluates contributions across five dimensions, predicts timelines, and detects missing talent.",
    tone: "text-ai",
  },
  {
    icon: Lock,
    num: "02",
    tag: "Trust",
    title: "Ethereum Escrow",
    body: "Locks, releases, and distributes funds based on verified milestones, not promises.",
    tone: "text-funding",
  },
  {
    icon: IdCard,
    num: "03",
    tag: "Story",
    title: "Hypercertificates",
    body: "A living dashboard that tells the complete story of any project. Built in.",
    tone: "text-reputation",
  },
  {
    icon: GitBranch,
    num: "04",
    tag: "Visualization",
    title: "DNA Graphs",
    body: "Visual lifecycle maps that evolve as your innovation grows. Zoomable, connected, replayable.",
    tone: "text-innovation",
  },
];

const steps: readonly Pillar[] = [
  {
    icon: Rocket,
    num: "01",
    tag: "Create",
    title: "Create",
    body: "Launch an innovation with title, description, category, tags, IPFS metadata, and creator wallet.",
    tone: "text-innovation",
  },
  {
    icon: GitPullRequest,
    num: "02",
    tag: "Contribute",
    title: "Contribute",
    body: "Builders submit code, research, design, marketing, docs, testing, and community work.",
    tone: "text-contributor",
  },
  {
    icon: Brain,
    num: "03",
    tag: "AI",
    title: "AI evaluates",
    body: "Gemini scores originality, effort, complexity, usefulness, impact, confidence, and reasoning.",
    tone: "text-ai",
  },
  {
    icon: CheckCircle2,
    num: "04",
    tag: "Validate",
    title: "Validate",
    body: "Project owners approve checkpoints while proof trails stay auditable and immutable.",
    tone: "text-success",
  },
  {
    icon: Coins,
    num: "05",
    tag: "Fund",
    title: "Fund",
    body: "Sponsors deposit ETH into project escrow. Funds stay visible until milestones land.",
    tone: "text-funding",
  },
  {
    icon: Flag,
    num: "06",
    tag: "Milestone",
    title: "Hit milestones",
    body: "Delivery checkpoints create a review trail and unlock the next funding decision.",
    tone: "text-reputation",
  },
  {
    icon: Sparkles,
    num: "07",
    tag: "Rewards",
    title: "Distribute rewards",
    body: "AI-weighted scores preview each contributor share before the contract distributes rewards.",
    tone: "text-ai",
  },
  {
    icon: IdCard,
    num: "08",
    tag: "Certificate",
    title: "Generate hypercertificate",
    body: "A full lifecycle profile captures contributions, funding, AI insights, readiness, and graph position.",
    tone: "text-innovation",
  },
];

const featureCards = [
  {
    icon: Brain,
    eyebrow: "AI Contribution Evaluator",
    title: "Every contribution gets a score. Every score has a reason.",
    body: "Gemini evaluates work across originality, effort, complexity, usefulness, and impact, then records the reasoning beside the proof trail.",
    className: "lg:col-span-7",
  },
  {
    icon: CircleDollarSign,
    eyebrow: "Escrow & Rewards",
    title: "Fund innovation, not promises.",
    body: "Sponsors deposit ETH into per-project escrow. After checkpoint approval, owners choose a reward pool that is split by contribution scores.",
    className: "lg:col-span-5",
  },
  {
    icon: GitBranch,
    eyebrow: "Innovation DNA",
    title: "Watch your innovation evolve in real time.",
    body: "Nodes for projects, contributors, proofs, funding, milestones, outcomes, and rewards. Edges tell the story.",
    className: "md:col-span-6 lg:col-span-4",
  },
  {
    icon: IdCard,
    eyebrow: "Innovation Hypercertificate",
    title: "The GitHub profile for innovation.",
    body: "One link shows who contributed, how funding moved, what AI observed, and whether the project is ready.",
    className: "md:col-span-6 lg:col-span-4",
  },
  {
    icon: Bot,
    eyebrow: "AI Innovation Copilot",
    title: "Your AI co-founder without the equity split.",
    body: "Required roles, milestones, budget, timeline, risks, opportunities, and missing contributor recommendations.",
    className: "lg:col-span-4",
  },
  {
    icon: Gauge,
    eyebrow: "Readiness Score",
    title: "Are you actually ready to ship?",
    body: "A 0-100 view from team completeness, funding, contributions, checkpoints, documentation, and AI confidence.",
    className: "lg:col-span-8",
  },
] as const;

const stats = [
  ["AI evaluation dimensions", "5"],
  ["Core contract functions", "5"],
  ["Lifecycle steps tracked", "12"],
  ["Simulation runtime", "90s"],
  ["Contribution types", "8"],
  ["Readiness inputs", "5"],
] as const;

const simulationFlow = [
  "Innovation created",
  "AI analyzes",
  "Contributors join",
  "Proofs submitted",
  "Sponsors fund",
  "Checkpoint approved",
  "Rewards flow",
  "Hypercertificate generated",
] as const;

const convergenceForces: readonly {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly body: string;
}[] = [
  { icon: Cpu, label: "AI", body: "AI is structured enough to evaluate work, not just generate it." },
  { icon: Network, label: "Blockchain", body: "Base-style L2 costs make multi-party reward distribution practical." },
  { icon: Globe, label: "Innovation", body: "No single company or DAO owns the best ideas anymore." },
];

function Eyebrow({ children, tone = "text-accent-soft" }: { readonly children: string; readonly tone?: string }) {
  return (
    <p className={`mono inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] ${tone}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </p>
  );
}

function TechMarquee() {
  const items = [...logos, ...logos];

  return (
    <section id="tech" className="border-y border-border bg-background-secondary/50 py-14">
      <p className="mono mb-8 text-center text-xs uppercase tracking-[0.28em] text-ai/75">
        Built on rails the next billion users will run on
      </p>
      <div className="landing-fade-x overflow-hidden">
        <div className="landing-marquee flex w-max items-center gap-12">
          {items.map(({ icon: Icon, label }, index) => (
            <div key={`${label}-${index}`} className="flex items-center gap-3 text-text-muted transition hover:text-text-primary">
              <Icon className="size-5 text-innovation" aria-hidden />
              <span className="text-sm font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniEvaluator() {
  const dimensions = [
    ["Originality", 92, "bg-innovation"],
    ["Effort", 78, "bg-reputation"],
    ["Complexity", 86, "bg-ai"],
    ["Usefulness", 95, "bg-funding"],
    ["Impact", 89, "bg-accent-soft"],
  ] as const;

  return (
    <div className="glass-panel rounded-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-card border border-ai/30 bg-ai/10">
            <Brain className="size-4 text-ai" aria-hidden />
          </span>
          <span className="mono text-xs uppercase tracking-[0.2em] text-text-muted">contribution #c-094</span>
        </div>
        <div className="text-right">
          <p className="mono text-[10px] uppercase tracking-[0.18em] text-text-muted">overall</p>
          <p className="mono text-2xl text-innovation">88</p>
        </div>
      </div>
      <div className="grid gap-3">
        {dimensions.map(([label, value, color]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-text-secondary">{label}</span>
              <span className="mono text-text-primary">{value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EscrowPreview() {
  const splits = [
    ["Smart contract", 38, "bg-innovation"],
    ["Research", 27, "bg-ai"],
    ["Design", 21, "bg-funding"],
    ["Growth", 14, "bg-reputation"],
  ] as const;

  return (
    <div className="glass-panel rounded-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="mono text-xs uppercase tracking-[0.2em] text-text-muted">locked in escrow</p>
          <p className="mt-1 text-3xl font-semibold">12.4 <span className="text-lg text-text-muted">ETH</span></p>
        </div>
        <div className="text-right">
          <p className="mono text-xs uppercase tracking-[0.2em] text-text-muted">checkpoint</p>
          <p className="mono mt-1 text-sm text-funding">2 / 4 approved</p>
        </div>
      </div>
      <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-white/[0.06]">
        {splits.map(([label, share, color]) => (
          <div key={label} className={color} style={{ width: `${share}%` }} />
        ))}
      </div>
      <div className="mt-5 grid gap-3">
        {splits.map(([label, share]) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{label}</span>
            <span className="mono text-text-primary">{share}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DnaPreview() {
  return (
    <div className="glass-panel rounded-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="mono flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-text-muted">
          <GitBranch className="size-4 text-funding" aria-hidden />
          lifecycle.dna
        </span>
        <span className="mono text-xs text-text-muted">v0.4.1</span>
      </div>
      <svg viewBox="0 0 320 200" className="h-52 w-full" role="img" aria-label="DNA lifecycle preview">
        <path d="M 30 100 C 110 30, 180 30, 290 60" stroke="#ee692e" strokeWidth="1.6" fill="none" />
        <path d="M 30 100 C 110 100, 180 100, 290 100" stroke="#eb8299" strokeWidth="1.6" fill="none" />
        <path d="M 30 100 C 110 170, 180 170, 290 140" stroke="#85be9d" strokeWidth="1.6" fill="none" />
        {[
          [30, 100, "#f08a5d"],
          [290, 60, "#ee692e"],
          [290, 100, "#eb8299"],
          [290, 140, "#85be9d"],
        ].map(([cx, cy, fill]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="7" fill={String(fill)} />
        ))}
      </svg>
      <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
        <span className="mono text-text-muted">7 nodes / 9 edges</span>
        <span className="mono text-funding">+2 today</span>
      </div>
    </div>
  );
}

function HypercertificatePreview() {
  return (
    <div className="glass-panel rounded-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="mono text-xs uppercase tracking-[0.2em] text-text-muted">Innovation Hypercertificate</p>
          <p className="mt-1 text-xl font-semibold">OICE Protocol</p>
          <p className="mono mt-1 text-xs text-text-muted">#OICE-001 / created Jun 14</p>
        </div>
        <div className="grid size-14 place-items-center rounded-full border border-innovation/40 bg-innovation/10">
          <span className="mono text-sm text-innovation">82</span>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          ["Contribs", "14"],
          ["Funding", "12.4E"],
          ["Steps", "5/8"],
        ].map(([key, value]) => (
          <div key={key} className="rounded-card border border-border bg-white/[0.03] p-2.5">
            <p className="mono text-[10px] uppercase tracking-[0.18em] text-text-muted">{key}</p>
            <p className="mt-1 text-lg font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-text-secondary">
        <span className="text-funding">shippable</span> / 3 contributors verified
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-background-primary text-text-primary">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-transparent bg-background-primary/55 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:h-20 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative grid size-9 place-items-center rounded-card border border-accent/30 bg-accent-dim shadow-glow-accent">
              <span className="font-bold text-accent-soft">O</span>
              <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-funding ring-2 ring-background-primary" />
            </span>
            <span className="font-semibold">OICE</span>
            <span className="hidden rounded-full border border-funding/30 bg-funding/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-funding sm:inline-block">
              beta
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map(([label, href]) => (
              <a key={href} href={href} className="rounded-card px-4 py-2 text-sm text-text-secondary transition hover:bg-white/[0.04] hover:text-text-primary">
                {label}
              </a>
            ))}
          </nav>
          <Button asChild size="sm">
            <Link href="/innovation/create">
              Launch App
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 pb-20 pt-28 lg:px-8 lg:pb-18 lg:pt-28">
        <div className="absolute inset-x-0 top-0 -z-10 h-[820px] landing-grid-hero landing-mask-hero" />
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-5xl text-center">
            <div className="glass inline-flex items-center gap-2 rounded-full border-funding/30 px-3.5 py-1.5 text-xs uppercase tracking-[0.22em] text-funding">
              <span className="size-1.5 rounded-full bg-funding" />
              Innovation Coordination Protocol
            </div>
            <h1 className="mt-8 text-[52px] font-semibold leading-[0.96] sm:text-7xl lg:text-8xl xl:text-[112px]">
              Innovation is not broken.
              <br />
              <span className="text-accent-warm">
                Coordination is.
              </span>
            </h1>
            <p className="mx-auto mt-9 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg lg:text-xl">
              OICE scores every contribution with AI, holds funding in Ethereum escrow, and pays builders only when
              checkpoints land. The complete innovation lifecycle is verifiable, automated, and finally fair.
            </p>
            <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/innovation/create">
                  Launch App
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/simulation">
                  <span className="grid size-6 place-items-center rounded-full border border-funding/40 bg-funding/15">
                    <Play className="ml-px size-3 text-funding" fill="currentColor" aria-hidden />
                  </span>
                  Watch 90-second demo
                </Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-text-muted">
              <span>No signup required</span>
              <span className="size-1 rounded-full bg-text-muted" />
              <span>Live on Base Sepolia</span>
              <span className="size-1 rounded-full bg-text-muted" />
              <span>Gemini-powered</span>
            </div>
          </div>

          <div className="relative mt-20 lg:mt-28">
            <Card variant="glow" className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-background-secondary/60 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-reputation" />
                  <span className="size-2.5 rounded-full bg-funding" />
                  <span className="size-2.5 rounded-full bg-ai" />
                </div>
                <div className="hidden items-center gap-2 text-xs text-text-muted sm:flex">
                  <span className="size-1.5 rounded-full bg-funding" />
                  oice.app / hypercertificate / <span className="mono text-text-primary">0x9a2f...dna</span>
                </div>
                <span className="mono text-[10px] uppercase tracking-[0.22em] text-text-muted">live</span>
              </div>
              <div className="relative min-h-[360px] bg-gradient-to-b from-background-secondary to-background-primary p-4 sm:min-h-[420px] lg:min-h-[480px]">
                <InnovationSpiderGraph />
                <div className="absolute left-4 top-4 rounded-full border border-border bg-background-primary/70 px-3 py-1.5 text-xs backdrop-blur">
                  <span className="mono uppercase tracking-[0.2em] text-text-muted">Innovation DNA</span>
                  <span className="mono ml-2 text-innovation">#OICE-001</span>
                </div>
                <div className="absolute bottom-4 right-4 rounded-full border border-border bg-background-primary/70 px-3 py-1.5 text-xs text-text-secondary backdrop-blur">
                  Readiness <span className="mono text-funding">82</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <TechMarquee />

      <section id="problem" className="relative px-6 py-28 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-7xl">
          <Eyebrow tone="text-risk">The Innovation Black Hole / 01</Eyebrow>
          <h2 className="mt-8 max-w-5xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-7xl">
            $2.7 trillion is spent on global R&amp;D every year. Most of it vanishes into a{" "}
            <span className="text-risk">black hole.</span>
          </h2>
          <p className="mt-10 max-w-2xl text-lg leading-8 text-text-secondary">
            Today&apos;s innovation ecosystem is broken into silos. Each tool tracks one slice and misses the rest.
          </p>
          <div className="mt-16 grid gap-px overflow-hidden rounded-card border border-border bg-border md:grid-cols-2">
            {silos.map(({ icon: Icon, num, tag, title, body, tone }) => (
              <div key={tag} className="group bg-background-secondary/85 p-8 transition hover:bg-surface/70 lg:p-10">
                <div className="flex items-start gap-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-card border border-border bg-white/[0.03]">
                    <Icon className={`size-5 ${tone}`} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="mono text-xs uppercase tracking-[0.24em] text-text-muted">{tag}</p>
                    <h3 className="mt-2 text-2xl font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">{body}</p>
                  </div>
                  <span className="mono text-xs text-text-muted">{num}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-20 max-w-3xl">
            <p className="text-xl leading-9 text-text-secondary lg:text-2xl">
              Contributors go unrecognized. Funding has no accountability. Brilliant projects die in silence, not because
              they lacked talent, but because they lacked coordination.
            </p>
            <p className="mt-10 text-2xl font-semibold leading-tight lg:text-4xl">
              What if one platform could see the entire story of an innovation from the first spark to the final reward?
            </p>
          </div>
        </div>
      </section>

      <section id="solution" className="px-6 py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-7">
              <Eyebrow tone="text-ai">Meet OICE / 02</Eyebrow>
              <h2 className="mt-8 text-4xl font-semibold leading-tight sm:text-5xl lg:text-7xl">
                One platform.
                <br />
                <span className="text-text-muted">Full lifecycle.</span>
                <br />
                <span className="text-innovation">Zero trust assumptions.</span>
              </h2>
              <p className="mt-8 max-w-xl text-lg leading-8 text-text-secondary">
                OICE is a decentralized innovation coordination protocol. Every contribution is scored. Every checkpoint
                is verified. Every reward is earned.
              </p>
            </div>
            <div className="lg:col-span-5">
              <Card className="relative aspect-square overflow-hidden p-6">
                <div className="absolute inset-0 landing-grid-fine opacity-40" />
                <div className="relative grid h-full place-items-center">
                  <div className="grid w-full max-w-sm gap-4">
                    {[
                      ["Idea", "AI plan", "Proof"],
                      ["Escrow", "Checkpoint", "Reward"],
                      ["DNA graph", "Reputation", "Hypercertificate"],
                    ].map((row) => (
                      <div key={row.join("-")} className="grid grid-cols-3 gap-3">
                        {row.map((label) => (
                          <div key={label} className="glass-panel rounded-card p-3 text-center text-xs text-text-secondary">
                            {label}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
          <div className="mt-20 grid gap-px overflow-hidden rounded-card border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
            {pillars.map(({ icon: Icon, num, tag, title, body, tone }) => (
              <div key={title} className="bg-background-secondary/85 p-7 transition hover:bg-surface/70 lg:p-8">
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-card border border-border bg-white/[0.03]">
                    <Icon className={`size-5 ${tone}`} aria-hidden />
                  </span>
                  <span className="mono text-xs text-text-muted">{num}</span>
                </div>
                <div className="mt-12">
                  <p className="mono text-xs uppercase tracking-[0.22em] text-text-muted">{tag}</p>
                  <h3 className="mt-2 text-2xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-text-secondary">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-border px-6 py-28 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-7xl">
          <Eyebrow tone="text-funding">From idea to impact / 03</Eyebrow>
          <h2 className="mt-8 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            A living system that grows with your innovation.
          </h2>
          <p className="mt-7 max-w-xl text-lg text-text-secondary">
            Not a pitch deck. Not a spreadsheet. A verifiable innovation record.
          </p>
          <div className="relative mt-20 grid gap-5 md:grid-cols-2">
            {steps.map(({ icon: Icon, num, title, body, tone }) => (
              <Card key={num} className="grid grid-cols-[64px_1fr] gap-4 p-5">
                <span className={`mono text-xl ${tone}`}>{num}</span>
                <div>
                  <Icon className={`mb-5 size-7 ${tone}`} aria-hidden />
                  <h3 className="text-2xl font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{body}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-6 py-28 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-7xl">
          <Eyebrow tone="text-text-secondary">Feature deep-dives / 04</Eyebrow>
          <h2 className="mt-8 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Proof, not promises. <span className="text-innovation">Look closer.</span>
          </h2>
          <div className="mt-16 grid grid-cols-12 gap-5 lg:gap-6">
            {featureCards.map(({ icon: Icon, eyebrow, title, body, className }, index) => (
              <Card key={eyebrow} className={`col-span-12 overflow-hidden p-6 lg:p-8 ${className}`}>
                <div className="flex items-center justify-between">
                  <p className="mono flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-text-muted">
                    <Icon className="size-4 text-innovation" aria-hidden />
                    {eyebrow}
                  </p>
                  <span className="mono text-xs text-text-muted">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-2xl font-semibold leading-tight lg:text-3xl">{title}</h3>
                <p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary">{body}</p>
                <div className="mt-6">
                  {index === 0 ? <MiniEvaluator /> : index === 1 ? <EscrowPreview /> : index === 2 ? <DnaPreview /> : index === 3 ? <HypercertificatePreview /> : index === 4 ? (
                    <div className="glass-panel rounded-card p-4 font-mono text-xs leading-6 text-text-secondary">
                      <p className="text-text-muted">&gt; oice copilot analyze</p>
                      <p className="mt-1 text-text-primary">Detected gaps in your team.</p>
                      <p className="mt-2 text-reputation">! No UX designer assigned</p>
                      <p className="text-reputation">! No growth lead</p>
                      <p className="text-funding">+ 3 engineers active</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {[
                        ["Team", 86, "bg-innovation"],
                        ["Funding", 72, "bg-funding"],
                        ["Contributions", 91, "bg-ai"],
                        ["Checkpoints", 64, "bg-reputation"],
                      ].map(([label, value, color]) => (
                        <div key={label as string} className="grid grid-cols-[96px_1fr_36px] items-center gap-3 text-xs">
                          <span className="text-text-secondary">{label}</span>
                          <span className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                            <span className={`block h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
                          </span>
                          <span className="mono text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="border-t border-border px-6 py-28 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-7xl">
          <Eyebrow tone="text-funding">Why now / 05</Eyebrow>
          <h2 className="mt-8 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Three forces converging.
          </h2>
          <div className="mt-16 grid gap-px overflow-hidden rounded-card border border-border bg-border md:grid-cols-3">
            {convergenceForces.map(({ icon: TypedIcon, label, body }, index) => {
              return (
                <div key={label} className="bg-background-secondary/85 p-8">
                  <TypedIcon className="size-8 text-innovation" aria-hidden />
                  <p className="mono mt-8 text-xs uppercase tracking-[0.22em] text-text-muted">0{index + 1} / {label}</p>
                  <p className="mt-3 text-xl font-semibold leading-snug">{body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <Eyebrow tone="text-ai">Built for impact / 06</Eyebrow>
          <h2 className="mt-8 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Numbers that make the system legible.
          </h2>
          <div className="mt-14 grid gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {stats.map(([label, value]) => (
              <div key={label} className="flex min-h-40 flex-col justify-between bg-background-secondary/85 p-6">
                <p className="mono text-4xl text-innovation">{value}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="simulation" className="relative overflow-hidden px-6 py-28 lg:px-8 lg:py-36">
        <div className="absolute inset-0 -z-10 landing-grid-fine landing-mask-radial opacity-50" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-6">
            <Eyebrow tone="text-text-secondary">Simulation Engine / 07 / Judge-facing</Eyebrow>
            <h2 className="mt-8 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              See the entire platform in 90 seconds.
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-text-secondary">
              OICE compresses the full lifecycle into a guided, narrated demo. Play, pause, step through, and control the story.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/simulation">
                  <Play className="size-4" fill="currentColor" aria-hidden />
                  Run Simulation
                </Link>
              </Button>
              <span className="text-sm text-text-muted">1x / 2x / 5x / 12 lifecycle events</span>
            </div>
          </div>
          <Card className="lg:col-span-6 p-6 lg:p-7">
            <div className="mb-5 flex items-center justify-between">
              <span className="mono flex items-center gap-2 text-xs text-text-muted">
                <span className="size-1.5 rounded-full bg-funding" />
                oice.app/simulation
              </span>
              <span className="mono text-xs text-text-muted">90s</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-innovation via-ai to-funding" />
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {simulationFlow.map((flow, index) => (
                <div
                  key={flow}
                  className={`flex items-center gap-2 rounded-card border px-3 py-2 text-xs ${
                    index < 6 ? "border-innovation/25 bg-innovation/10 text-innovation" : "border-border bg-white/[0.03] text-text-muted"
                  }`}
                >
                  <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                  <span className="truncate">{flow}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section id="docs" className="px-6 pb-20 lg:px-8">
        <div className="mx-auto max-w-[1400px] overflow-hidden rounded-3xl bg-gradient-to-br from-innovation via-accent-soft to-ai p-8 text-background-primary md:p-12">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-6 grid size-10 place-items-center rounded-full bg-background-primary/15">
              <Zap className="size-4" fill="currentColor" aria-hidden />
            </div>
            <p className="mono mb-6 text-xs uppercase tracking-[0.28em] opacity-70">The coordination layer innovation has been waiting for</p>
            <h2 className="text-4xl font-semibold leading-tight sm:text-6xl lg:text-7xl">
              Innovation deserves better infrastructure.
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-base leading-7 opacity-80 lg:text-lg">
              Stop losing contributors to obscurity. Stop funding without accountability. Start building with a record.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="border-white/35 bg-white/20 text-white shadow-[0_10px_30px_rgba(17,24,39,0.18),inset_0_1px_0_rgba(255,255,255,0.22)] hover:border-white/45 hover:bg-white/28 hover:text-white"
              >
                <Link href="/innovation/create">
                  Launch OICE
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="border border-white/25 bg-background-primary/18 text-white shadow-[0_10px_24px_rgba(17,24,39,0.12)] hover:border-white/35 hover:bg-background-primary/25 hover:text-white"
              >
                <Link href="/simulation">
                  <Play className="size-4" fill="currentColor" aria-hidden />
                  Run the Simulation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-text-muted md:flex-row">
          <span>OICE - Where every contribution counts. Literally.</span>
          <span className="mono">AI-evaluated. Blockchain-verified. Fully transparent.</span>
        </div>
      </footer>
    </main>
  );
}
