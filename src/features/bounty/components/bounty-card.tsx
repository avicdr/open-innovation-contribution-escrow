import { CalendarClock, Coins, Users } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { BountyDto } from "@/services/bounty/bounty-repository";
import { BountyCategoryBadge, BountyStatusBadge, deadlineLabel, formatReward } from "@/features/bounty/bounty-ui";

type BountyCardProps = {
  readonly bounty: BountyDto;
  readonly href: string;
  readonly innovationTitle?: string;
};

export function BountyCard({ bounty, href, innovationTitle }: BountyCardProps) {
  const deadline = deadlineLabel(bounty.deadline);

  return (
    <Card variant="interactive" className="p-5">
      <Link href={href} className="block">
        <div className="flex flex-wrap items-center gap-2">
          <BountyCategoryBadge category={bounty.category} />
          <BountyStatusBadge status={bounty.status} />
          <span className="mono ml-auto inline-flex items-center gap-1 rounded-card border border-funding/30 bg-funding/10 px-2 py-1 text-xs text-funding">
            <Coins className="size-3.5" aria-hidden />
            {formatReward(bounty.rewardAmount, bounty.rewardToken)}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-semibold leading-snug">{bounty.title}</h3>
        {innovationTitle ? <p className="mono mt-1 text-xs text-text-muted">{innovationTitle}</p> : null}
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-secondary">{bounty.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" aria-hidden />
            {bounty.submissionCount} submission{bounty.submissionCount === 1 ? "" : "s"}
          </span>
          {deadline ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-3.5" aria-hidden />
              {deadline}
            </span>
          ) : null}
        </div>
      </Link>
    </Card>
  );
}
