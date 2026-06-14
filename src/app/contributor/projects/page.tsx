import Link from "next/link";
import { formatEther } from "viem";
import { ArrowRight, Search, Sparkles, Target } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listFundingForInnovation } from "@/services/funding/funding-repository";
import { listInnovations } from "@/services/innovation/innovation-repository";

type ContributorProject = {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly summary: string;
  readonly readiness: number;
  readonly funding: string;
  readonly neededRoles: readonly string[];
  readonly contributionTypes: readonly string[];
};

const fallbackProjects: readonly ContributorProject[] = [
  {
    id: "665000000000000000000001",
    title: "AI Flood Prediction Network",
    category: "Climate Infrastructure",
    summary: "Open flood-risk forecasting with verified data, field validation, and accountable ETH rewards.",
    readiness: 82,
    funding: "1.0 ETH",
    neededRoles: ["Frontend Engineer", "Hydrology Researcher", "Growth Lead"],
    contributionTypes: ["engineering", "research", "community"],
  },
  {
    id: "665000000000000000000011",
    title: "Open Battery Materials Lab",
    category: "Energy",
    summary: "A public contribution network for battery material experiments, literature review, and reproducible lab notes.",
    readiness: 76,
    funding: "0.6 ETH",
    neededRoles: ["Materials Scientist", "Data Engineer", "Documentation Lead"],
    contributionTypes: ["research", "documentation", "engineering"],
  },
  {
    id: "665000000000000000000012",
    title: "Community Mesh Response Kit",
    category: "Resilience",
    summary: "Offline-first mesh communications for disaster response teams and local coordinators.",
    readiness: 71,
    funding: "0.4 ETH",
    neededRoles: ["Protocol Engineer", "UX Designer", "Field Tester"],
    contributionTypes: ["engineering", "design", "testing"],
  },
];

async function getContributorProjects(): Promise<readonly ContributorProject[]> {
  try {
    const innovations = await listInnovations(24);

    if (innovations.length === 0) {
      return fallbackProjects;
    }

    return Promise.all(
      innovations.map(async (innovation) => ({
        id: innovation.id,
        title: innovation.title,
        category: innovation.category,
        summary: innovation.summary,
        readiness: innovation.aiCopilot?.successProbability ?? 0,
        funding: formatFunding((await safeList(() => listFundingForInnovation(innovation.id))).map((event) => event.amountWei)),
        neededRoles: innovation.aiCopilot?.requiredRoles.length ? innovation.aiCopilot.requiredRoles : ["Awaiting Gemini role map"],
        contributionTypes: innovation.tags.length ? innovation.tags : ["open contribution"],
      })),
    );
  } catch {
    return fallbackProjects;
  }
}

async function safeList<T>(loader: () => Promise<T[]>): Promise<T[]> {
  try {
    return await loader();
  } catch {
    return [];
  }
}

function formatFunding(values: readonly string[]) {
  const total = values.reduce((sum, value) => {
    try {
      return sum + BigInt(value);
    } catch {
      return sum;
    }
  }, 0n);

  if (total === 0n) {
    return "0 ETH";
  }

  const eth = formatEther(total);
  const [whole, fraction = ""] = eth.split(".");
  const trimmedFraction = fraction.slice(0, 3).replace(/0+$/, "");

  return trimmedFraction ? `${whole}.${trimmedFraction} ETH` : `${whole} ETH`;
}

export default async function ContributorProjectsPage() {
  const projects = await getContributorProjects();

  return (
    <AppShell title="Find Projects To Contribute" eyebrow="contributor marketplace">
      <div className="grid gap-5">
        <Card className="grid gap-5 border-innovation/20 bg-surface-elevated/70 p-5 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-card border border-border bg-background-secondary px-3 py-2 text-sm text-text-secondary">
              <Search className="size-4 text-innovation" aria-hidden />
              Match your skills to funded, AI-scored innovation work
            </div>
            <h2 className="mt-5 text-3xl font-bold">Contribute where your work becomes visible, scored, and rewarded.</h2>
            <p className="mt-3 max-w-3xl text-text-secondary">
              Browse active innovations, inspect missing roles, submit proof-backed contributions, and build a
              portable innovation reputation.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ["Open roles", "9"],
              ["Funded pools", "2.0 ETH"],
              ["Proofs anchored", "3"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-card border border-border bg-background-secondary p-4">
                <p className="text-sm text-text-muted">{label}</p>
                <p className="mono mt-2 text-xl text-innovation">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id} variant="interactive" className="p-5">
              <div className="grid gap-5 xl:grid-cols-[1fr_260px] xl:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mono rounded-card border border-border bg-background-secondary px-2 py-1 text-xs text-text-muted">
                      {project.category}
                    </span>
                    <span className="mono rounded-card border border-funding/30 bg-funding/10 px-2 py-1 text-xs text-funding">
                      {project.funding}
                    </span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold">{project.title}</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">{project.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.contributionTypes.map((type) => (
                      <span key={type} className="rounded-card border border-border bg-background-secondary px-3 py-1 text-xs text-text-secondary">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-card border border-border bg-background-secondary p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Readiness</span>
                    <span className="mono text-lg text-innovation">{project.readiness}/100</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-surface-hover">
                    <div className="h-2 rounded-full bg-gradient-to-r from-innovation to-funding" style={{ width: `${project.readiness}%` }} />
                  </div>
                  <div className="mt-5">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <Target className="size-4 text-ai" aria-hidden />
                      Missing roles
                    </p>
                    <div className="mt-3 grid gap-2">
                      {project.neededRoles.map((role) => (
                        <span key={role} className="text-sm text-text-secondary">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button asChild className="mt-5 w-full">
                    <Link href={`/innovation/${project.id}`}>
                      Inspect and Contribute
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold">Not seeing the right project?</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Create a new innovation and define the contributor graph from day one.
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link href="/innovation/create">
                Create Innovation
                <Sparkles className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
