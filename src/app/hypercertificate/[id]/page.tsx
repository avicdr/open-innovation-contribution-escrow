import { BadgeCheck } from "lucide-react";
import Link from "next/link";
import { formatEther } from "viem";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buildProjectGraph } from "@/features/dna-graph/build-project-graph";
import { DnaGraphView } from "@/features/dna-graph/components/dna-graph";
import { ContributionHeatmapGraph } from "@/features/innovation/components/contribution-heatmap-graph";
import { getHypercertificate } from "@/services/hypercertificate/hypercertificate-service";

type HypercertificatePageProps = {
  readonly params: Promise<{
    readonly id: string;
  }>;
};

function shortHash(value?: string) {
  if (!value) {
    return "—";
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function sumWei(values: readonly string[]) {
  return values.reduce((total, value) => {
    try {
      return total + BigInt(value);
    } catch {
      return total;
    }
  }, 0n);
}

function formatWei(value: bigint) {
  if (value === 0n) {
    return "0 ETH";
  }

  const [whole, fraction = ""] = formatEther(value).split(".");
  const trimmed = fraction.slice(0, 3).replace(/0+$/, "");

  return trimmed ? `${whole}.${trimmed} ETH` : `${whole} ETH`;
}

async function loadHypercertificate(id: string) {
  try {
    return await getHypercertificate(id);
  } catch {
    return null;
  }
}

export default async function HypercertificatePage({ params }: HypercertificatePageProps) {
  const { id } = await params;
  const hypercertificate = await loadHypercertificate(id);

  if (!hypercertificate) {
    return (
      <AppShell title="Innovation Hypercertificate" eyebrow={`hypercertificate ${id}`}>
        <EmptyState
          icon={<BadgeCheck className="size-6" aria-hidden />}
          title="No hypercertificate for this innovation yet"
          description="A hypercertificate is generated once an innovation records contributions, funding, or rewards. Open a live project and submit a proof-backed contribution to populate it."
          guidance="Anchor one proof-backed contribution and the hypercertificate impact score, proof coverage, and reward history populate automatically."
          action={
            <Button asChild>
              <Link href="/contributor/projects">Explore Innovations</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const { innovation, contributions, fundingEvents, milestones, rewards, analytics } = hypercertificate;
  const totalFunding = formatWei(sumWei(fundingEvents.map((event) => event.amountWei)));
  const totalRewards = formatWei(sumWei(rewards.map((reward) => reward.amountWei)));
  const proofCoverage =
    analytics.contributionCount > 0
      ? Math.round((analytics.anchoredProofCount / analytics.contributionCount) * 100)
      : 0;

  const stats: ReadonlyArray<readonly [string, string]> = [
    ["Impact Score", String(analytics.averageImpact)],
    ["Contributions", String(analytics.contributionCount)],
    ["Funding Earned", totalFunding],
    ["Rewards Distributed", totalRewards],
  ];
  const graph = buildProjectGraph({
    innovation,
    innovationId: innovation.id,
    contributions,
    fundingEvents,
    milestones,
    rewards,
  });

  return (
    <AppShell title="Innovation Hypercertificate" eyebrow={`hypercertificate ${shortHash(innovation.id)}`}>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          <Card className="p-6">
            <p className="mono text-xs uppercase tracking-wider text-innovation">{innovation.category}</p>
            <h2 className="mt-1 text-2xl font-semibold">{innovation.title}</h2>
            <p className="mt-3 max-w-2xl text-text-secondary">{innovation.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-text-muted">
              <span className="rounded-card border border-border bg-background-secondary px-2.5 py-1 capitalize">
                {innovation.status}
              </span>
              <span className="mono rounded-card border border-border bg-background-secondary px-2.5 py-1">
                creator {shortHash(innovation.creatorWalletAddress)}
              </span>
              {innovation.onChainInnovationId ? (
                <span className="mono rounded-card border border-innovation/30 bg-background-secondary px-2.5 py-1 text-innovation">
                  chain:{innovation.onChainInnovationId}
                </span>
              ) : null}
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {stats.map(([label, value]) => (
                <div key={label} className="rounded-card border border-border bg-background-secondary p-4">
                  <p className="text-sm text-text-muted">{label}</p>
                  <p className="mono mt-2 break-words text-lg text-innovation">{value}</p>
                </div>
              ))}
            </div>
          </Card>

          <ContributionHeatmapGraph contributions={contributions} />

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Contribution History</h3>
              <span className="mono text-xs text-text-muted">{analytics.anchoredProofCount} anchored on-chain</span>
            </div>
            {contributions.length === 0 ? (
              <p className="mt-4 text-sm text-text-muted">No contributions recorded yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {contributions.map((contribution) => {
                  const score = contribution.impactScore ?? contribution.aiScore?.overallScore ?? 0;

                  return (
                    <li key={contribution.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{contribution.title}</p>
                        <p className="mono mt-0.5 text-xs text-text-muted">
                          {shortHash(contribution.contributorWalletAddress)} · {contribution.type}
                          {contribution.onChainContributionId ? " · proof anchored" : " · pending proof"}
                        </p>
                      </div>
                      <span className="mono shrink-0 text-sm text-innovation">{score} impact</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold">Reward & Funding Flow</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-sm text-text-muted">Funding Events</p>
                {fundingEvents.length === 0 ? (
                  <p className="mt-2 text-sm text-text-muted">None yet.</p>
                ) : (
                  <ul className="mt-2 grid gap-2">
                    {fundingEvents.map((event) => (
                      <li
                        key={event.txHash}
                        className="flex items-center justify-between rounded-card border border-border bg-background-secondary px-3 py-2"
                      >
                        <span className="mono text-xs text-text-muted">{shortHash(event.sponsorAddress)}</span>
                        <span className="mono text-sm text-funding">{formatWei(sumWei([event.amountWei]))}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-sm text-text-muted">Reward Distributions</p>
                {rewards.length === 0 ? (
                  <p className="mt-2 text-sm text-text-muted">None yet.</p>
                ) : (
                  <ul className="mt-2 grid gap-2">
                    {rewards.map((reward) => (
                      <li
                        key={reward.txHash + reward.walletAddress}
                        className="flex items-center justify-between rounded-card border border-border bg-background-secondary px-3 py-2"
                      >
                        <span className="mono text-xs text-text-muted">{shortHash(reward.walletAddress)}</span>
                        <span className="mono text-sm text-ai">{formatWei(sumWei([reward.amountWei]))}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold">Proof Coverage</h3>
            <p className="mt-4 text-sm text-text-muted">On-chain anchored contributions</p>
            <div className="mt-2 flex items-end justify-between">
              <span className="mono text-3xl text-innovation">{proofCoverage}%</span>
              <span className="mono text-xs text-text-muted">
                {analytics.anchoredProofCount}/{analytics.contributionCount}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-background-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-innovation to-contributor"
                style={{ width: `${proofCoverage}%` }}
              />
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold">Network Position</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Live graph of this hypercertificate&apos;s innovation, contributors, proofs, funding, checkpoints, and rewards.
            </p>
            <div className="mt-5">
              <DnaGraphView graph={graph} compact />
            </div>
            <Button asChild variant="secondary" className="mt-5 w-full">
              <Link href={`/innovation/${innovation.id}`}>Open Innovation</Link>
            </Button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
