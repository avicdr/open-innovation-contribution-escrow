import type { ReactNode } from "react";
import { CheckCircle2, CircleDot, Clock, XCircle } from "lucide-react";
import { formatEther } from "viem";
import { cn } from "@/lib/utils/cn";
import type { BountyCategory, BountyStatus, SubmissionStatus } from "@/domain/bounty/schemas";

export const bountyStatusMeta: Record<
  BountyStatus,
  { readonly label: string; readonly pill: string; readonly icon: ReactNode }
> = {
  open: {
    label: "Open",
    pill: "border-funding/30 bg-funding/10 text-funding",
    icon: <CircleDot className="size-3.5" aria-hidden />,
  },
  in_review: {
    label: "In review",
    pill: "border-reputation/30 bg-reputation/10 text-reputation",
    icon: <Clock className="size-3.5" aria-hidden />,
  },
  completed: {
    label: "Completed",
    pill: "border-innovation/30 bg-innovation/10 text-innovation",
    icon: <CheckCircle2 className="size-3.5" aria-hidden />,
  },
  cancelled: {
    label: "Cancelled",
    pill: "border-risk/30 bg-risk/10 text-risk",
    icon: <XCircle className="size-3.5" aria-hidden />,
  },
};

export const submissionStatusMeta: Record<SubmissionStatus, { readonly label: string; readonly pill: string }> = {
  pending: { label: "Pending review", pill: "border-reputation/30 bg-reputation/10 text-reputation" },
  approved: { label: "Approved", pill: "border-success/30 bg-success/10 text-success" },
  rejected: { label: "Rejected", pill: "border-risk/30 bg-risk/10 text-risk" },
};

export const bountyCategoryMeta: Record<BountyCategory, { readonly label: string; readonly tone: string }> = {
  development: { label: "Development", tone: "border-innovation/30 bg-innovation/10 text-innovation" },
  design: { label: "Design", tone: "border-contributor/30 bg-contributor/10 text-contributor" },
  research: { label: "Research", tone: "border-ai/30 bg-ai/10 text-ai" },
  marketing: { label: "Marketing", tone: "border-reputation/30 bg-reputation/10 text-reputation" },
  business: { label: "Business", tone: "border-funding/30 bg-funding/10 text-funding" },
  other: { label: "Other", tone: "border-border bg-white/[0.04] text-text-secondary" },
};

export function BountyStatusBadge({ status, className }: { readonly status: BountyStatus; readonly className?: string }) {
  const meta = bountyStatusMeta[status];

  return (
    <span
      className={cn(
        "mono inline-flex items-center gap-1 rounded-card border px-2 py-0.5 text-[11px] uppercase tracking-wider",
        meta.pill,
        className,
      )}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
}

export function BountyCategoryBadge({ category }: { readonly category: BountyCategory }) {
  const meta = bountyCategoryMeta[category];

  return (
    <span className={cn("mono rounded-card border px-2 py-0.5 text-[11px] uppercase tracking-wider", meta.tone)}>
      {meta.label}
    </span>
  );
}

export function SubmissionStatusBadge({ status }: { readonly status: SubmissionStatus }) {
  const meta = submissionStatusMeta[status];

  return (
    <span className={cn("mono rounded-card border px-2 py-0.5 text-[11px] uppercase tracking-wider", meta.pill)}>
      {meta.label}
    </span>
  );
}

/** Reward amounts on a bounty are whole-token numbers; render compactly. */
export function formatReward(amount: number, token: string) {
  const trimmed = Number.isInteger(amount) ? amount.toString() : amount.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  return `${trimmed} ${token}`;
}

/** Wei (string) → trimmed ETH for analytics totals coming from the rewards ledger. */
export function formatWeiEth(wei: string) {
  let value = 0n;
  try {
    value = BigInt(wei);
  } catch {
    value = 0n;
  }

  if (value === 0n) {
    return "0 ETH";
  }

  const [whole, fraction = ""] = formatEther(value).split(".");
  const trimmed = fraction.slice(0, 4).replace(/0+$/, "");

  return trimmed ? `${whole}.${trimmed} ETH` : `${whole} ETH`;
}

export function deadlineLabel(deadline?: string) {
  if (!deadline) {
    return null;
  }

  const time = new Date(deadline).getTime();

  if (Number.isNaN(time)) {
    return null;
  }

  const diffDays = Math.ceil((time - Date.now()) / 86_400_000);

  if (diffDays < 0) {
    return "Closed";
  }

  if (diffDays === 0) {
    return "Closes today";
  }

  if (diffDays === 1) {
    return "Closes tomorrow";
  }

  return `${diffDays}d left`;
}
