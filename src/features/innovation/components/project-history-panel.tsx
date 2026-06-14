import { formatEther } from "viem";
import { Card } from "@/components/ui/card";
import type { ContributionDto } from "@/services/contribution/contribution-repository";
import type { FundingEventDto } from "@/services/funding/funding-repository";
import type { MilestoneDto } from "@/services/milestone/milestone-repository";
import type { RewardDto } from "@/services/reward/reward-repository";

type ProjectHistoryPanelProps = {
  readonly contributions: readonly ContributionDto[];
  readonly fundingEvents: readonly FundingEventDto[];
  readonly milestones: readonly MilestoneDto[];
  readonly rewards: readonly RewardDto[];
};

type WalletRewardSummary = {
  readonly walletAddress: string;
  readonly totalWei: bigint;
  readonly totalEth: string;
  readonly rewardCount: number;
  readonly averageScore: number;
  readonly latestTxHash: string;
};

function shortHash(value?: string) {
  if (!value) {
    return "pending";
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function toBigInt(value: string) {
  try {
    return BigInt(value);
  } catch {
    return 0n;
  }
}

function formatWei(value: string | bigint) {
  const wei = typeof value === "bigint" ? value : toBigInt(value);
  const eth = formatEther(wei);
  const [whole, fraction = ""] = eth.split(".");
  const trimmedFraction = fraction.slice(0, 4).replace(/0+$/, "");

  return trimmedFraction ? `${whole}.${trimmedFraction} ETH` : `${whole} ETH`;
}

function rewardSummaries(rewards: readonly RewardDto[]): WalletRewardSummary[] {
  const buckets = new Map<
    string,
    {
      totalWei: bigint;
      rewardCount: number;
      scoreTotal: number;
      latestTxHash: string;
      latestCreatedAt: string;
    }
  >();

  for (const reward of rewards) {
    const existing = buckets.get(reward.walletAddress);
    const nextTotalWei = (existing?.totalWei ?? 0n) + toBigInt(reward.amountWei);
    const nextRewardCount = (existing?.rewardCount ?? 0) + 1;
    const nextScoreTotal = (existing?.scoreTotal ?? 0) + reward.score;
    const latest =
      !existing || new Date(reward.createdAt).getTime() > new Date(existing.latestCreatedAt).getTime()
        ? { txHash: reward.txHash, createdAt: reward.createdAt }
        : { txHash: existing.latestTxHash, createdAt: existing.latestCreatedAt };

    buckets.set(reward.walletAddress, {
      totalWei: nextTotalWei,
      rewardCount: nextRewardCount,
      scoreTotal: nextScoreTotal,
      latestTxHash: latest.txHash,
      latestCreatedAt: latest.createdAt,
    });
  }

  return Array.from(buckets.entries())
    .map(([walletAddress, summary]) => ({
      walletAddress,
      totalWei: summary.totalWei,
      totalEth: formatWei(summary.totalWei),
      rewardCount: summary.rewardCount,
      averageScore: Math.round(summary.scoreTotal / summary.rewardCount),
      latestTxHash: summary.latestTxHash,
    }))
    .sort((a, b) => (a.totalWei === b.totalWei ? 0 : a.totalWei > b.totalWei ? -1 : 1));
}

export function ProjectHistoryPanel({
  contributions,
  fundingEvents,
  milestones,
  rewards,
}: ProjectHistoryPanelProps) {
  const walletRewards = rewardSummaries(rewards);

  return (
    <section className="grid gap-4">
      <Card className="overflow-hidden border-innovation/20">
        <div className="border-b border-white/10 bg-white/[0.035] p-5">
          <p className="mono text-xs uppercase tracking-wider text-innovation">project memory</p>
          <h2 className="mt-1 text-xl font-semibold">Previous Contributions</h2>
          <p className="mt-2 text-sm text-text-secondary">
            A searchable trail of proof-backed work already attached to this innovation.
          </p>
        </div>
        <div className="divide-y divide-white/10">
          {contributions.length > 0 ? (
            contributions.map((contribution) => (
              <article key={contribution.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_180px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-card border border-contributor/25 bg-contributor/10 px-2 py-1 text-xs text-contributor">
                      {contribution.type}
                    </span>
                    <span className="text-xs text-text-muted">{formatDate(contribution.createdAt)}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{contribution.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{contribution.description}</p>
                  <div className="mt-4 grid gap-2 text-xs text-text-muted sm:grid-cols-2">
                    <span className="mono">wallet: {shortHash(contribution.contributorWalletAddress)}</span>
                    <span className="mono">proof: {shortHash(contribution.proofHash)}</span>
                    <span className="mono">tx: {shortHash(contribution.txHash)}</span>
                    <span className="mono">uri: {contribution.proofUri}</span>
                  </div>
                </div>
                <div className="grid gap-3 rounded-card border border-white/10 bg-white/[0.035] p-4">
                  <div>
                    <p className="text-xs text-text-muted">Impact Score</p>
                    <p className="mono mt-1 text-2xl text-innovation">
                      {contribution.impactScore ?? contribution.aiScore?.overallScore ?? "pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">AI Confidence</p>
                    <p className="mono mt-1 text-lg text-ai">{contribution.aiScore?.confidence ?? "pending"}</p>
                  </div>
                  <p className="text-xs leading-5 text-text-muted">
                    {contribution.aiScore?.reasoning ?? "Awaiting AI evaluation for this contribution."}
                  </p>
                </div>
              </article>
            ))
          ) : (
            <p className="p-5 text-sm text-text-secondary">
              No contributions have been recorded for this project yet. Submit a proof-backed contribution to start the
              history.
            </p>
          )}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-funding/20 p-5">
          <p className="mono text-xs uppercase tracking-wider text-funding">capital inflow</p>
          <h2 className="mt-1 text-xl font-semibold">Funding History</h2>
          <div className="mt-5 grid gap-3">
            {fundingEvents.length > 0 ? (
              fundingEvents.map((event) => (
                <div key={event.id} className="rounded-card border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="mono text-sm text-text-primary">{shortHash(event.sponsorAddress)}</p>
                      <p className="mt-1 text-xs text-text-muted">{formatDate(event.createdAt)}</p>
                    </div>
                    <p className="mono text-sm text-funding">{formatWei(event.amountWei)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-muted">
                    <span className="mono">chain:{event.chainId}</span>
                    <span className="mono">tx:{shortHash(event.txHash)}</span>
                    {event.blockNumber ? <span className="mono">block:{event.blockNumber}</span> : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-card border border-white/10 bg-white/[0.035] p-4 text-sm text-text-secondary">
                No funding events recorded yet.
              </p>
            )}
          </div>
        </Card>

        <Card className="border-ai/20 p-5">
          <p className="mono text-xs uppercase tracking-wider text-ai">wallet rewards</p>
          <h2 className="mt-1 text-xl font-semibold">Reward Distribution</h2>
          <div className="mt-5 grid gap-3">
            {walletRewards.length > 0 ? (
              walletRewards.map((summary) => (
                <div key={summary.walletAddress} className="rounded-card border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="mono text-sm text-text-primary">{shortHash(summary.walletAddress)}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {summary.rewardCount} reward{summary.rewardCount === 1 ? "" : "s"} · avg score{" "}
                        {summary.averageScore}
                      </p>
                    </div>
                    <p className="mono text-sm text-ai">{summary.totalEth}</p>
                  </div>
                  <p className="mono mt-3 text-xs text-text-muted">latest tx: {shortHash(summary.latestTxHash)}</p>
                </div>
              ))
            ) : (
              <p className="rounded-card border border-white/10 bg-white/[0.035] p-4 text-sm text-text-secondary">
                No reward distributions recorded yet.
              </p>
            )}
          </div>
        </Card>
      </div>

      <Card className="border-reputation/20 p-5">
        <p className="mono text-xs uppercase tracking-wider text-reputation">delivery checkpoints</p>
        <h2 className="mt-1 text-xl font-semibold">Milestones</h2>
        <div className="mt-5 grid gap-3">
          {milestones.length > 0 ? (
            milestones.map((milestone) => (
              <div key={milestone.id} className="rounded-card border border-white/10 bg-white/[0.035] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{milestone.title}</h3>
                    <p className="mt-1 text-sm text-text-secondary">{milestone.description}</p>
                  </div>
                  <span className="rounded-card border border-reputation/25 bg-reputation/10 px-2 py-1 text-xs text-reputation">
                    {milestone.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-muted">
                  <span>{formatDate(milestone.createdAt)}</span>
                  {milestone.txHash ? <span className="mono">tx:{shortHash(milestone.txHash)}</span> : null}
                  {milestone.approverAddress ? <span className="mono">approver:{shortHash(milestone.approverAddress)}</span> : null}
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-card border border-white/10 bg-white/[0.035] p-4 text-sm text-text-secondary">
              No milestones created yet.
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}
