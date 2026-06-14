import { formatEther } from "viem";
import type { DnaEdge, DnaGraph } from "@/features/dna-graph/types";
import { layerForKind, layoutLayered, type LayoutNode } from "@/features/dna-graph/layout";
import type { ContributionDto } from "@/services/contribution/contribution-repository";
import type { FundingEventDto } from "@/services/funding/funding-repository";
import type { InnovationDto } from "@/services/innovation/innovation-repository";
import type { MilestoneDto } from "@/services/milestone/milestone-repository";
import type { RewardDto } from "@/services/reward/reward-repository";

type BuildProjectGraphInput = {
  readonly innovation: InnovationDto | null;
  readonly innovationId: string;
  readonly contributions: readonly ContributionDto[];
  readonly fundingEvents: readonly FundingEventDto[];
  readonly milestones: readonly MilestoneDto[];
  readonly rewards: readonly RewardDto[];
};

function shortHash(value?: string) {
  if (!value) {
    return "pending";
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function buildProjectGraph({
  innovation,
  innovationId,
  contributions,
  fundingEvents,
  milestones,
  rewards,
}: BuildProjectGraphInput): DnaGraph {
  const title = innovation?.title ?? "Unknown Innovation";
  const tags = innovation?.tags ?? [];
  const nodes: LayoutNode[] = [
    {
      id: "innovation",
      kind: "innovation",
      label: title,
      metric: innovation?.onChainInnovationId ? `chain:${innovation.onChainInnovationId}` : "not registered",
      layer: layerForKind("innovation"),
    },
  ];
  const edges: DnaEdge[] = [];

  for (const [index, tag] of tags.slice(0, 6).entries()) {
    const tagId = `tag-${index}`;
    nodes.push({ id: tagId, kind: "outcome", label: tag, metric: "project tag", layer: layerForKind("outcome") });
    edges.push({ id: `innovation-${tagId}`, source: "innovation", target: tagId, kind: "knowledge" });
  }

  for (const [index, contribution] of contributions.slice(0, 8).entries()) {
    const contributorId = `contributor-${index}`;
    const contributionId = `contribution-${index}`;
    nodes.push({
      id: contributorId,
      kind: "contributor",
      label: shortHash(contribution.contributorWalletAddress),
      metric: contribution.type,
      layer: layerForKind("contributor"),
    });
    nodes.push({
      id: contributionId,
      kind: "contribution",
      label: contribution.title,
      metric: `${contribution.impactScore ?? contribution.aiScore?.overallScore ?? 0} impact`,
      layer: layerForKind("contribution"),
    });
    edges.push({ id: `${contributorId}-${contributionId}`, source: contributorId, target: contributionId, kind: "contribution" });
    edges.push({ id: `${contributionId}-innovation`, source: contributionId, target: "innovation", kind: "contribution" });
  }

  if (fundingEvents.length > 0) {
    const totalFunding = fundingEvents.reduce((total, event) => {
      try {
        return total + BigInt(event.amountWei);
      } catch {
        return total;
      }
    }, 0n);
    nodes.push({
      id: "funding",
      kind: "funding",
      label: "Escrow Funding",
      metric: `${formatEther(totalFunding).slice(0, 6)} ETH`,
      layer: layerForKind("funding"),
    });
    edges.push({ id: "innovation-funding", source: "innovation", target: "funding", kind: "funding" });
  }

  for (const [index, milestone] of milestones.slice(0, 4).entries()) {
    const milestoneId = `milestone-${index}`;
    nodes.push({
      id: milestoneId,
      kind: "milestone",
      label: milestone.title,
      metric: milestone.status,
      layer: layerForKind("milestone"),
    });
    edges.push({ id: `innovation-${milestoneId}`, source: "innovation", target: milestoneId, kind: "execution" });
  }

  if (rewards.length > 0) {
    nodes.push({
      id: "rewards",
      kind: "reward",
      label: "Reward Distribution",
      metric: `${rewards.length} wallet rows`,
      layer: layerForKind("reward"),
    });
    edges.push({
      id: fundingEvents.length > 0 ? "funding-rewards" : "innovation-rewards",
      source: fundingEvents.length > 0 ? "funding" : "innovation",
      target: "rewards",
      kind: "reward",
    });
  }

  if (nodes.length === 1) {
    nodes.push({
      id: "empty-state",
      kind: "outcome",
      label: "Awaiting contributions",
      metric: innovationId.slice(-6),
      layer: layerForKind("outcome"),
    });
    edges.push({ id: "innovation-empty", source: "innovation", target: "empty-state", kind: "knowledge" });
  }

  return { nodes: layoutLayered(nodes), edges };
}
