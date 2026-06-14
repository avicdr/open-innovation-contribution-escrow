import { ArrowLeft, CalendarClock, Coins, Flag, Trophy } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getBountyById, listSubmissionsForBounty } from "@/services/bounty/bounty-repository";
import { getInnovationById } from "@/services/innovation/innovation-repository";
import { BountyCategoryBadge, BountyStatusBadge, deadlineLabel, formatReward } from "@/features/bounty/bounty-ui";
import { CancelBountyButton } from "@/features/bounty/components/cancel-bounty-button";
import { ReviewSubmissionPanel } from "@/features/bounty/components/review-submission-panel";
import { SubmitBountyWorkForm } from "@/features/bounty/components/submit-bounty-work-form";

type PageProps = {
  readonly params: Promise<{ readonly id: string; readonly bountyId: string }>;
};

async function safe<T>(loader: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await loader();
  } catch {
    return fallback;
  }
}

export default async function BountyDetailPage({ params }: PageProps) {
  const { id, bountyId } = await params;
  const bounty = await safe(() => getBountyById(bountyId), null);

  if (!bounty || bounty.innovationId !== id) {
    return (
      <AppShell title="Bounty" eyebrow="bounties">
        <EmptyState
          icon={<Trophy className="size-6" aria-hidden />}
          title="Bounty not found"
          description="This bounty does not exist or belongs to a different innovation."
          action={
            <Button asChild variant="secondary">
              <Link href={`/innovation/${id}/bounties`}>Back to bounties</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const [submissions, innovation] = await Promise.all([
    safe(() => listSubmissionsForBounty(bountyId), []),
    safe(() => getInnovationById(id), null),
  ]);

  const deadline = deadlineLabel(bounty.deadline);
  const closed = bounty.status === "completed" || bounty.status === "cancelled";
  const isLive = bounty.status === "open" || bounty.status === "in_review";

  return (
    <AppShell title={bounty.title} eyebrow={innovation?.title ?? "bounty"}>
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-4">
          <Link
            href={`/innovation/${id}/bounties`}
            className="inline-flex w-fit items-center gap-1.5 text-sm text-text-secondary transition duration-fast hover:text-text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden />
            All bounties
          </Link>

          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <BountyCategoryBadge category={bounty.category} />
              <BountyStatusBadge status={bounty.status} />
              <span className="mono ml-auto inline-flex items-center gap-1 rounded-card border border-funding/30 bg-funding/10 px-2.5 py-1 text-sm text-funding">
                <Coins className="size-4" aria-hidden />
                {formatReward(bounty.rewardAmount, bounty.rewardToken)}
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold">{bounty.title}</h2>
            <p className="mt-3 whitespace-pre-wrap text-text-secondary">{bounty.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted">
              <span className="mono">{bounty.submissionCount} submissions</span>
              {deadline ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="size-3.5" aria-hidden />
                  {deadline}
                </span>
              ) : null}
              {bounty.milestoneId ? (
                <span className="inline-flex items-center gap-1.5">
                  <Flag className="size-3.5" aria-hidden />
                  linked milestone
                </span>
              ) : null}
            </div>
            {isLive ? (
              <div className="mt-5 border-t border-border pt-4">
                <CancelBountyButton bountyId={bounty.id} creatorWallet={bounty.createdBy} />
              </div>
            ) : null}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold">Submissions &amp; review</h3>
            <p className="mt-1 text-sm text-text-secondary">
              The innovation owner reviews evidence and approves work. Gemini can summarise and flag duplicates, but
              never approves rewards.
            </p>
            <div className="mt-5">
              <ReviewSubmissionPanel bounty={bounty} submissions={submissions} />
            </div>
          </Card>
        </div>

        <div className="grid h-fit gap-4">
          <Card className="border-contributor/20 p-5">
            <p className="mono text-xs uppercase tracking-wider text-contributor">submit work</p>
            <h3 className="mt-1 text-xl font-semibold">Submit Contribution</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Describe what you delivered and link evidence. Approved work is rewarded from escrow and recorded on your
              hypercertificate.
            </p>
            <div className="mt-5">
              <SubmitBountyWorkForm bountyId={bounty.id} bountyTitle={bounty.title} disabled={closed} />
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-semibold">Reward pool</h3>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Reward</span>
                <span className="mono text-funding">{formatReward(bounty.rewardAmount, bounty.rewardToken)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Status</span>
                <BountyStatusBadge status={bounty.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Funded from</span>
                <span className="text-text-secondary">Innovation escrow</span>
              </div>
            </div>
            <Button asChild variant="secondary" className="mt-5 w-full">
              <Link href={`/hypercertificate/${id}`}>View hypercertificate</Link>
            </Button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
