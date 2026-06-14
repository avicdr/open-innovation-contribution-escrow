import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InnovationTabs } from "@/features/bounty/components/innovation-tabs";
import { CopilotPanel } from "@/features/innovation/components/copilot-panel";
import { MissionControlOverview } from "@/features/innovation/components/mission-control-overview";
import { SubmitContributionForm } from "@/features/contribution/components/submit-contribution-form";
import { LifecycleActionPanel } from "@/features/innovation/components/lifecycle-action-panel";
import { listContributionsForInnovation } from "@/services/contribution/contribution-repository";
import { listFundingForInnovation } from "@/services/funding/funding-repository";
import { getInnovationById } from "@/services/innovation/innovation-repository";
import { listMilestoneProposalsForInnovation, listMilestonesForInnovation } from "@/services/milestone/milestone-repository";
import { listRewardsForInnovation } from "@/services/reward/reward-repository";

type InnovationPageProps = {
  readonly params: Promise<{
    readonly id: string;
  }>;
};

export default async function InnovationPage({ params }: InnovationPageProps) {
  const { id } = await params;
  const [innovation, contributions, fundingEvents, milestones, milestoneProposals, rewards] = await Promise.all([
    getInnovation(id),
    safeList(() => listContributionsForInnovation(id)),
    safeList(() => listFundingForInnovation(id)),
    safeList(() => listMilestonesForInnovation(id)),
    safeList(() => listMilestoneProposalsForInnovation(id)),
    safeList(() => listRewardsForInnovation(id)),
  ]);
  const title = innovation?.title ?? "AI Flood Prediction Network";
  const category = innovation?.category ?? "Climate Infrastructure";

  return (
    <AppShell title={title} eyebrow={category}>
      <div className="grid gap-4">
        <InnovationTabs innovationId={id} />
        <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-4">
          {/* Stage-reactive dashboard: selecting a roadmap stage rewinds every metric,
              the AI coordinator, the funder figures, the history, and the DNA map. */}
          <MissionControlOverview
            innovation={innovation}
            innovationId={id}
            title={title}
            category={category}
            contributions={contributions}
            fundingEvents={fundingEvents}
            milestones={milestones}
            milestoneProposals={milestoneProposals}
            rewards={rewards}
          />

          <CopilotPanel innovationId={id} initialPlan={innovation?.aiCopilot} />
          <div className="grid gap-3 md:grid-cols-3">
            <Button asChild variant="secondary">
              <a href="#previous-contributions">View Previous Contributions</a>
            </Button>
            <Button asChild variant="secondary">
              <a href="#submit-contribution">Submit Contribution</a>
            </Button>
            <Button asChild>
              <Link href="/contributor/projects">Find More Projects</Link>
            </Button>
          </div>
          <Card id="submit-contribution" className="scroll-mt-6 border-contributor/20 p-5">
            <div className="mb-5">
              <p className="mono text-xs uppercase tracking-wider text-contributor">contributor intake</p>
              <h2 className="text-xl font-semibold">Submit Proof-Backed Contribution</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Contributors submit work after anchoring proof on-chain. OICE stores the searchable read model
                and feeds AI evaluation, validation, hypercertificates, and rewards.
              </p>
            </div>
            <SubmitContributionForm innovationId={id} />
          </Card>
          <Card className="border-reputation/20 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="mono text-xs uppercase tracking-wider text-reputation">verifiable profile</p>
                <h2 className="text-xl font-semibold">Hypercertificate</h2>
                <p className="mt-2 text-sm text-text-secondary">
                  Aggregated lifecycle evidence from proofs, funding, rewards, AI, and graph position.
                </p>
              </div>
              <Button asChild variant="secondary">
                <Link href={`/hypercertificate/${id}`}>Open Hypercertificate</Link>
              </Button>
            </div>
          </Card>
        </div>
        <LifecycleActionPanel
          innovationId={id}
          creatorWalletAddress={innovation?.creatorWalletAddress}
          projectStatus={innovation?.status}
          onChainInnovationId={innovation?.onChainInnovationId}
          contributions={contributions}
          fundingEvents={fundingEvents}
          milestones={milestones}
          milestoneProposals={milestoneProposals}
          rewards={rewards}
        />
        </div>
      </div>
    </AppShell>
  );
}

async function getInnovation(id: string) {
  try {
    return await getInnovationById(id);
  } catch {
    return null;
  }
}

async function safeList<T>(loader: () => Promise<T[]>): Promise<T[]> {
  try {
    return await loader();
  } catch {
    return [];
  }
}
