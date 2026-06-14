"use client";

import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { formatEther } from "viem";
import { Card } from "@/components/ui/card";
import { buildProjectGraph } from "@/features/dna-graph/build-project-graph";
import { DnaGraphView } from "@/features/dna-graph/components/dna-graph";
import { FundProjectPanel } from "@/features/funding/components/fund-project-panel";
import { AiCoordinator } from "@/features/innovation/components/ai-coordinator";
import { ContributionHeatmapGraph } from "@/features/innovation/components/contribution-heatmap-graph";
import { MetricRing, MetricStat } from "@/features/innovation/components/metric-widgets";
import { ProjectHistoryPanel } from "@/features/innovation/components/project-history-panel";
import { RoadmapTimeline, type RoadmapStage } from "@/features/innovation/components/roadmap-timeline";
import type { ContributionDto } from "@/services/contribution/contribution-repository";
import type { FundingEventDto } from "@/services/funding/funding-repository";
import type { InnovationDto } from "@/services/innovation/innovation-repository";
import type { MilestoneDto, MilestoneProposalDto } from "@/services/milestone/milestone-repository";
import type { RewardDto } from "@/services/reward/reward-repository";

type MissionControlOverviewProps = {
  readonly innovation: InnovationDto | null;
  readonly innovationId: string;
  readonly title: string;
  readonly category: string;
  readonly contributions: readonly ContributionDto[];
  readonly fundingEvents: readonly FundingEventDto[];
  readonly milestones: readonly MilestoneDto[];
  readonly milestoneProposals: readonly MilestoneProposalDto[];
  readonly rewards: readonly RewardDto[];
};

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

function maxBigInt(a: bigint, b: bigint) {
  return a > b ? a : b;
}

export function MissionControlOverview({
  innovation,
  innovationId,
  title,
  category,
  contributions,
  fundingEvents,
  milestones,
  milestoneProposals,
  rewards,
}: MissionControlOverviewProps) {
  // Furthest contiguous lifecycle stage actually reached by the project.
  const currentStageIndex = useMemo(() => {
    const approved = milestones.filter((milestone) => milestone.status === "approved").length;
    const signals = [
      true,
      Boolean(innovation?.aiCopilot) || contributions.length > 0,
      contributions.length > 0,
      fundingEvents.length > 0,
      approved > 0,
      rewards.length > 0,
    ];

    let index = 0;
    for (let i = 0; i < signals.length; i += 1) {
      if (signals[i]) {
        index = i;
      } else {
        break;
      }
    }

    return index;
  }, [contributions.length, fundingEvents.length, innovation?.aiCopilot, milestones, rewards.length]);

  const [selected, setSelected] = useState(currentStageIndex);

  // Data revealed up to and including a given stage (the "rewind" gate).
  function gate(stage: number) {
    return {
      contribs: stage >= 2 ? contributions : [],
      funding: stage >= 3 ? fundingEvents : [],
      miles: stage >= 4 ? milestones : [],
      proposals: stage >= 4 ? milestoneProposals : [],
      rews: stage >= 5 ? rewards : [],
      plan: stage >= 1 ? innovation?.aiCopilot : undefined,
    };
  }

  function viewFor(stage: number) {
    const g = gate(stage);
    const averageImpact = g.contribs.length
      ? Math.round(
          g.contribs.reduce(
            (total, contribution) => total + (contribution.impactScore ?? contribution.aiScore?.overallScore ?? 0),
            0,
          ) / g.contribs.length,
        )
      : 0;
    const executionProbability = Math.min(
      96,
      42 + g.contribs.length * 7 + g.funding.length * 9 + g.rews.length * 4 + g.miles.length * 6,
    );
    const copilotSuccess = g.plan?.successProbability;
    const health = Math.round(
      copilotSuccess != null ? (executionProbability + averageImpact + copilotSuccess) / 3 : (executionProbability + averageImpact) / 2,
    );
    const approvedMilestones = g.miles.filter((milestone) => milestone.status === "approved").length;
    const checkpointCompletion = g.miles.length ? Math.round((approvedMilestones / g.miles.length) * 100) : 0;
    const riskCount = g.plan?.risks.length ?? 0;
    const riskIndex = Math.max(0, Math.min(100, 100 - executionProbability + riskCount * 4));
    const riskLabel = riskIndex >= 66 ? "High" : riskIndex >= 33 ? "Medium" : "Low";
    const availableWei = maxBigInt(0n, sumWei(g.funding.map((e) => e.amountWei)) - sumWei(g.rews.map((r) => r.amountWei)));

    return {
      ...g,
      averageImpact,
      executionProbability,
      copilotSuccess,
      health,
      approvedMilestones,
      checkpointCompletion,
      riskCount,
      riskIndex,
      riskLabel,
      availableWei,
      availableFunding: formatWei(availableWei),
      totalRewards: formatWei(sumWei(g.rews.map((r) => r.amountWei))),
      totalRaised: formatWei(sumWei(g.funding.map((e) => e.amountWei))),
      contributorCount: new Set(g.contribs.map((c) => c.contributorWalletAddress.toLowerCase())).size,
      sponsorCount: new Set(g.funding.map((e) => e.sponsorAddress.toLowerCase())).size,
      anchoredProofs: g.contribs.filter((c) => c.onChainContributionId).length,
      roleCount: g.plan?.requiredRoles.length ?? 0,
    };
  }

  function stageView(index: number): RoadmapStage {
    const v = viewFor(index);

    switch (index) {
      case 0:
        return {
          label: "Idea",
          note: "Concept registered",
          summary: `${title} is registered as a ${category} innovation${
            innovation?.onChainInnovationId ? ` (on-chain #${innovation.onChainInnovationId})` : " (not yet on-chain)"
          }.`,
          stats: [
            { label: "On-chain", value: innovation?.onChainInnovationId ? `#${innovation.onChainInnovationId}` : "pending" },
            { label: "Tags", value: String(innovation?.tags.length ?? 0) },
            { label: "Status", value: innovation?.status ?? "draft" },
          ],
        };
      case 1:
        return {
          label: "Research",
          note: "AI plan generated",
          summary: v.plan
            ? `AI plan ready — ${v.copilotSuccess}% forecast across ${v.roleCount} role${v.roleCount === 1 ? "" : "s"}.`
            : "Awaiting the AI copilot plan.",
          stats: [
            { label: "Forecast", value: v.copilotSuccess != null ? `${v.copilotSuccess}%` : "—" },
            { label: "Roles", value: String(v.roleCount) },
            { label: "Risks", value: String(v.riskCount) },
          ],
        };
      case 2:
        return {
          label: "Planning",
          note: "Contributors + proofs",
          summary: v.contribs.length
            ? `${v.contribs.length} contribution${v.contribs.length === 1 ? "" : "s"} from ${v.contributorCount} contributor${
                v.contributorCount === 1 ? "" : "s"
              }, ${v.anchoredProofs} anchored on-chain.`
            : "No contributions submitted yet.",
          stats: [
            { label: "Contributions", value: String(v.contribs.length) },
            { label: "Contributors", value: String(v.contributorCount) },
            { label: "Proofs", value: String(v.anchoredProofs) },
          ],
        };
      case 3:
        return {
          label: "Development",
          note: "Escrow funded",
          summary: v.funding.length
            ? `${v.totalRaised} escrowed from ${v.sponsorCount} sponsor${v.sponsorCount === 1 ? "" : "s"}.`
            : "No escrow funding yet.",
          stats: [
            { label: "Raised", value: v.totalRaised },
            { label: "Sponsors", value: String(v.sponsorCount) },
            { label: "Available", value: v.availableFunding },
          ],
        };
      case 4:
        return {
          label: "Review",
          note: "Milestone approved",
          summary: v.approvedMilestones
            ? `${v.approvedMilestones}/${v.miles.length} milestone${v.miles.length === 1 ? "" : "s"} approved.`
            : v.miles.length
              ? "Milestones created, awaiting approval."
              : "No milestones yet.",
          stats: [
            { label: "Approved", value: `${v.approvedMilestones}/${v.miles.length}` },
            { label: "Checkpoints", value: `${v.checkpointCompletion}%` },
            { label: "Proposals", value: String(v.proposals.length) },
          ],
        };
      default:
        return {
          label: "Launch",
          note: "Rewards distributed",
          summary: v.rews.length
            ? `${v.totalRewards} distributed across ${v.rews.length} payout${v.rews.length === 1 ? "" : "s"}.`
            : "No rewards distributed yet.",
          stats: [
            { label: "Distributed", value: v.totalRewards },
            { label: "Payouts", value: String(v.rews.length) },
            { label: "Available", value: v.availableFunding },
          ],
        };
    }
  }

  const stages = [0, 1, 2, 3, 4, 5].map(stageView);
  const view = viewFor(selected);
  const planVisible = selected >= 1 && Boolean(innovation?.aiCopilot);
  const innovationForStage = planVisible ? innovation : innovation ? { ...innovation, aiCopilot: undefined } : null;

  const graph = useMemo(
    () =>
      buildProjectGraph({
        innovation,
        innovationId,
        contributions: selected >= 2 ? contributions : [],
        fundingEvents: selected >= 3 ? fundingEvents : [],
        milestones: selected >= 4 ? milestones : [],
        rewards: selected >= 5 ? rewards : [],
      }),
    [selected, innovation, innovationId, contributions, fundingEvents, milestones, rewards],
  );

  return (
    <>
      <Card variant="glow" className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="mono text-xs uppercase tracking-wider text-accent-soft">
              {category} · stage {stages[selected].label}
            </p>
            <h2 className="mt-1 text-h2">{title}</h2>
            <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-text-secondary">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-ai" aria-hidden />
              <span>{stages[selected].summary}</span>
            </p>
          </div>
          <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[440px]">
            <MetricRing label="Project Health" value={view.health} display={String(view.health)} sub="blended readiness" tone="accent" />
            <MetricRing
              label="Innovation Score"
              value={view.averageImpact}
              display={String(view.averageImpact)}
              sub="avg contribution impact"
              tone="innovation"
            />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <RoadmapTimeline stages={stages} currentIndex={currentStageIndex} selected={selected} onSelect={setSelected} />
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricStat label="Execution Readiness" display={`${view.executionProbability}%`} sub="probability to ship" tone="accent" />
        <MetricStat
          label="Risk Index"
          display={`${view.riskIndex} · ${view.riskLabel}`}
          sub={`${view.riskCount} flagged risk${view.riskCount === 1 ? "" : "s"}`}
          tone="risk"
        />
        <MetricStat
          label="Checkpoints"
          display={`${view.checkpointCompletion}%`}
          sub={`${view.approvedMilestones}/${view.miles.length} approved`}
          tone="reputation"
        />
        <MetricStat label="Available Funding" display={view.availableFunding} sub={`${view.totalRewards} rewarded`} tone="funding" />
      </div>

      <ContributionHeatmapGraph contributions={view.contribs} />

      <Card className="p-4">
        <DnaGraphView key={selected} graph={graph} />
      </Card>

      <AiCoordinator
        innovation={innovationForStage}
        contributions={view.contribs}
        fundingEvents={view.funding}
        milestones={view.miles}
        rewards={view.rews}
      />

      <FundProjectPanel
        onChainInnovationId={innovation?.onChainInnovationId}
        availableFundingWei={view.availableWei.toString()}
        fundingEvents={view.funding}
      />

      <div id="previous-contributions" className="scroll-mt-6">
        <ProjectHistoryPanel
          contributions={view.contribs}
          fundingEvents={view.funding}
          milestones={view.miles}
          rewards={view.rews}
        />
      </div>
    </>
  );
}
