import { getInnovationById } from "@/services/innovation/innovation-repository";
import { listContributionsForInnovation } from "@/services/contribution/contribution-repository";
import { listFundingForInnovation } from "@/services/funding/funding-repository";
import { listMilestonesForInnovation } from "@/services/milestone/milestone-repository";
import { listRewardsForInnovation } from "@/services/reward/reward-repository";

export async function getHypercertificate(innovationId: string) {
  const innovation = await getInnovationById(innovationId);

  if (!innovation) {
    return null;
  }

  const [contributions, fundingEvents, milestones, rewards] = await Promise.all([
    listContributionsForInnovation(innovationId),
    listFundingForInnovation(innovationId),
    listMilestonesForInnovation(innovationId),
    listRewardsForInnovation(innovationId),
  ]);

  const averageImpact =
    contributions.length === 0
      ? 0
      : Math.round(
          contributions.reduce((total, contribution) => total + (contribution.impactScore ?? contribution.aiScore?.overallScore ?? 0), 0) /
            contributions.length,
        );

  return {
    innovation,
    contributions,
    fundingEvents,
    milestones,
    rewards,
    analytics: {
      contributionCount: contributions.length,
      averageImpact,
      anchoredProofCount: contributions.filter((contribution) => contribution.onChainContributionId).length,
    },
  };
}
