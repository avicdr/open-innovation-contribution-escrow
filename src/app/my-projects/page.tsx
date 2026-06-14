import { cookies } from "next/headers";
import Link from "next/link";
import { formatEther } from "viem";
import { LayoutGrid, Plus, Sparkles, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getSessionWallet } from "@/services/auth/auth-service";
import { listContributionsForInnovation } from "@/services/contribution/contribution-repository";
import { listFundingForInnovation } from "@/services/funding/funding-repository";
import { listInnovationsByCreator, type InnovationDto } from "@/services/innovation/innovation-repository";

export const dynamic = "force-dynamic";

type ProjectRow = {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly status: string;
  readonly score: number;
  readonly funding: string;
  readonly contributors: number;
  readonly registered: boolean;
  readonly tags: readonly string[];
};

function shortHash(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
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

  const [whole, fraction = ""] = formatEther(total).split(".");
  const trimmed = fraction.slice(0, 3).replace(/0+$/, "");

  return trimmed ? `${whole}.${trimmed} ETH` : `${whole} ETH`;
}

async function toProjectRow(innovation: InnovationDto): Promise<ProjectRow> {
  const [fundingEvents, contributions] = await Promise.all([
    safeList(() => listFundingForInnovation(innovation.id)),
    safeList(() => listContributionsForInnovation(innovation.id, 250)),
  ]);
  const score =
    innovation.aiCopilot?.successProbability ??
    (contributions.length
      ? Math.round(
          contributions.reduce(
            (total, contribution) => total + (contribution.impactScore ?? contribution.aiScore?.overallScore ?? 0),
            0,
          ) / contributions.length,
        )
      : 0);

  return {
    id: innovation.id,
    title: innovation.title,
    category: innovation.category,
    status: innovation.status,
    score,
    funding: formatFunding(fundingEvents.map((event) => event.amountWei)),
    contributors: new Set(contributions.map((contribution) => contribution.contributorWalletAddress)).size,
    registered: Boolean(innovation.onChainInnovationId),
    tags: innovation.tags,
  };
}

async function loadProjects(walletAddress: string): Promise<readonly ProjectRow[]> {
  try {
    const innovations = await listInnovationsByCreator(walletAddress);

    return Promise.all(innovations.map(toProjectRow));
  } catch {
    return [];
  }
}

export default async function MyProjectsPage() {
  const cookieStore = await cookies();
  const walletAddress = await getSessionWallet(cookieStore.get("oice_session")?.value);

  if (!walletAddress) {
    return (
      <AppShell title="My Projects" eyebrow="creator workspace">
        <EmptyState
          icon={<Wallet className="size-6" aria-hidden />}
          title="Connect your wallet"
          description="Sign in with the wallet button in the top bar to see the innovations you have created and listed on OICE."
          guidance="Your projects are scoped to the signed-in wallet — connect to manage roles, funding, milestones, and rewards in one place."
          action={
            <Button asChild variant="secondary">
              <Link href="/contributor/projects">Browse Other Innovations</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const projects = await loadProjects(walletAddress);

  return (
    <AppShell title="My Projects" eyebrow={`creator ${shortHash(walletAddress)}`}>
      <div className="grid gap-4">
        <Card className="flex flex-col justify-between gap-4 border-innovation/20 p-5 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-semibold">Innovations you created</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {projects.length === 0
                ? "Projects you create and list will appear here."
                : `${projects.length} project${projects.length === 1 ? "" : "s"} listed under this wallet.`}
            </p>
          </div>
          <Button asChild>
            <Link href="/innovation/create">
              <Plus className="size-4" aria-hidden />
              Create Innovation
            </Link>
          </Button>
        </Card>

        {projects.length === 0 ? (
          <EmptyState
            icon={<LayoutGrid className="size-6" aria-hidden />}
            title="No projects yet"
            description="You have not created any innovations with this wallet. Launch your first project to start coordinating contributors, funding, and rewards."
            guidance="Start with a clear problem statement — the AI copilot turns it into a role map, milestones, and a readiness forecast the moment you create it."
            action={
              <Button asChild>
                <Link href="/innovation/create">
                  Create your first innovation
                  <Sparkles className="size-4" aria-hidden />
                </Link>
              </Button>
            }
          />
        ) : (
          projects.map((project) => (
            <Card
              key={project.id}
              variant="interactive"
              className="grid gap-4 p-5 md:grid-cols-[1fr_110px_110px_110px] md:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">{project.title}</h2>
                  <span className="mono rounded-card border border-border bg-background-secondary px-2 py-0.5 text-xs capitalize text-text-secondary">
                    {project.status}
                  </span>
                  <span
                    className={`mono rounded-card border px-2 py-0.5 text-xs ${
                      project.registered
                        ? "border-innovation/30 bg-innovation/10 text-innovation"
                        : "border-border bg-background-secondary text-text-muted"
                    }`}
                  >
                    {project.registered ? "on-chain" : "off-chain"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-text-muted">{project.category}</p>
                {project.tags.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-card border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`/innovation/${project.id}`}>Open Mission Control</Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/hypercertificate/${project.id}`}>View hypercertificate</Link>
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-text-muted">Readiness</p>
                <p className="mono mt-1 text-lg text-innovation">{project.score}/100</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Escrowed</p>
                <p className="mono mt-1 text-lg text-funding">{project.funding}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Contributors</p>
                <p className="mono mt-1 text-lg text-contributor">{project.contributors}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
