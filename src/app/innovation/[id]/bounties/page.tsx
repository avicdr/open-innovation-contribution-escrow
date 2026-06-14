import { Trophy } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getBountyAnalytics,
  getEscrowAvailability,
  listBountiesForInnovation,
} from "@/services/bounty/bounty-repository";
import { getInnovationById } from "@/services/innovation/innovation-repository";
import { listMilestonesForInnovation } from "@/services/milestone/milestone-repository";
import { BountyAnalyticsStrip } from "@/features/bounty/components/bounty-analytics-strip";
import { BountyCard } from "@/features/bounty/components/bounty-card";
import { BountyOwnerActions } from "@/features/bounty/components/bounty-owner-actions";
import { InnovationTabs } from "@/features/bounty/components/innovation-tabs";

type PageProps = {
  readonly params: Promise<{ readonly id: string }>;
};

async function safe<T>(loader: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await loader();
  } catch {
    return fallback;
  }
}

export default async function InnovationBountiesPage({ params }: PageProps) {
  const { id } = await params;
  const [innovation, bounties, analytics, escrow, milestones] = await Promise.all([
    safe(() => getInnovationById(id), null),
    safe(() => listBountiesForInnovation(id), []),
    safe(
      () => getBountyAnalytics(id),
      {
        totalBounties: 0,
        completedBounties: 0,
        openBounties: 0,
        rewardsDistributedWei: "0",
        averageCompletionHours: null,
        activeContributors: 0,
        submissionCount: 0,
        participationRate: 0,
      },
    ),
    safe(() => getEscrowAvailability(id), {
      totalFundingWei: "0",
      distributedWei: "0",
      committedWei: "0",
      availableWei: "0",
      freeWei: "0",
    }),
    safe(() => listMilestonesForInnovation(id), []),
  ]);

  const title = innovation?.title ?? "Innovation";
  const open = bounties.filter((bounty) => bounty.status === "open" || bounty.status === "in_review");
  const closed = bounties.filter((bounty) => bounty.status === "completed" || bounty.status === "cancelled");
  const milestoneOptions = milestones.map((milestone) => ({ id: milestone.id, title: milestone.title }));

  return (
    <AppShell title={title} eyebrow="bounties">
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <InnovationTabs innovationId={id} />
          <BountyOwnerActions
            innovationId={id}
            creatorWallet={innovation?.creatorWalletAddress}
            freeWei={escrow.freeWei}
            milestones={milestoneOptions}
          />
        </div>

        <BountyAnalyticsStrip analytics={analytics} />

        {bounties.length === 0 ? (
          <EmptyState
            icon={<Trophy className="size-6" aria-hidden />}
            title="No bounties yet"
            description="Bounties let you reserve part of the escrow as reward-based tasks. Contributors submit work, you review it, and approved submissions trigger escrow payouts."
            guidance="Fund the innovation escrow first, then create a bounty to reserve a reward for a specific task."
            action={
              <Button asChild variant="secondary">
                <Link href={`/innovation/${id}`}>Back to overview</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4">
            {open.length > 0 ? (
              <section className="grid gap-3">
                <h2 className="text-lg font-semibold">Open bounties</h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  {open.map((bounty) => (
                    <BountyCard key={bounty.id} bounty={bounty} href={`/innovation/${id}/bounties/${bounty.id}`} />
                  ))}
                </div>
              </section>
            ) : null}

            {closed.length > 0 ? (
              <section className="grid gap-3">
                <h2 className="text-lg font-semibold">Completed &amp; closed</h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  {closed.map((bounty) => (
                    <BountyCard key={bounty.id} bounty={bounty} href={`/innovation/${id}/bounties/${bounty.id}`} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </AppShell>
  );
}
