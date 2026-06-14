import { BadgeCheck, Brain, CircleDollarSign, Coins, FileText, Flag, Gauge, ShieldCheck, Workflow } from "lucide-react";
import type { ComponentType } from "react";
import { formatEther } from "viem";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { ContributionDto } from "@/services/contribution/contribution-repository";
import type { FundingEventDto } from "@/services/funding/funding-repository";
import type { InnovationDto } from "@/services/innovation/innovation-repository";
import type { MilestoneDto } from "@/services/milestone/milestone-repository";
import type { RewardDto } from "@/services/reward/reward-repository";

type AiCoordinatorProps = {
  readonly innovation: InnovationDto | null;
  readonly contributions: readonly ContributionDto[];
  readonly fundingEvents: readonly FundingEventDto[];
  readonly milestones: readonly MilestoneDto[];
  readonly rewards: readonly RewardDto[];
};

type AgentStatus = "complete" | "active" | "idle";

const statusStyle: Record<AgentStatus, { readonly dot: string; readonly pill: string; readonly label: string }> = {
  complete: { dot: "bg-success", pill: "border-success/30 bg-success/10 text-success", label: "Done" },
  active: { dot: "bg-accent shadow-glow-accent", pill: "border-accent/30 bg-accent-dim text-accent-soft", label: "Active" },
  idle: { dot: "bg-text-muted", pill: "border-border bg-white/[0.03] text-text-muted", label: "Idle" },
};

function shortHash(value?: string) {
  if (!value) {
    return "pending";
  }

  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function formatEth(value: string) {
  try {
    const [whole, fraction = ""] = formatEther(BigInt(value)).split(".");
    const trimmed = fraction.slice(0, 3).replace(/0+$/, "");

    return trimmed ? `${whole}.${trimmed} ETH` : `${whole} ETH`;
  } catch {
    return "0 ETH";
  }
}

function timeAgo(iso: string) {
  const then = new Date(iso).getTime();

  if (Number.isNaN(then)) {
    return "";
  }

  const minutes = Math.round((Date.now() - then) / 60000);

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.round(hours / 24)}d ago`;
}

type ActivityEntry = {
  readonly key: string;
  readonly icon: ComponentType<{ className?: string }>;
  readonly tone: string;
  readonly text: string;
  readonly at: string;
};

export function AiCoordinator({ innovation, contributions, fundingEvents, milestones, rewards }: AiCoordinatorProps) {
  const plan = innovation?.aiCopilot;
  const scored = contributions.filter((contribution) => contribution.aiScore || contribution.impactScore != null).length;
  const hasContrib = contributions.length > 0;
  const hasFunding = fundingEvents.length > 0;
  const approved = milestones.some((milestone) => milestone.status === "approved");
  const hasRewards = rewards.length > 0;

  const agents: ReadonlyArray<{
    readonly name: string;
    readonly role: string;
    readonly icon: ComponentType<{ className?: string }>;
    readonly status: AgentStatus;
    readonly detail: string;
  }> = [
    {
      name: "Planner",
      role: "Maps roles, milestones, risks",
      icon: Brain,
      status: plan ? "complete" : "idle",
      detail: plan ? `${plan.successProbability}% success forecast` : "Awaiting analysis",
    },
    {
      name: "Evaluator",
      role: "Scores contributions",
      icon: Gauge,
      status: hasContrib ? (scored > 0 ? "complete" : "active") : "idle",
      detail: hasContrib ? `${scored}/${contributions.length} scored` : "No contributions",
    },
    {
      name: "Validator",
      role: "Verifies proof trails",
      icon: ShieldCheck,
      status: hasContrib ? "active" : "idle",
      detail: hasContrib ? `${contributions.length} proofs in review` : "No proofs yet",
    },
    {
      name: "Escrow",
      role: "Holds and releases funds",
      icon: CircleDollarSign,
      status: hasFunding ? (approved ? "complete" : "active") : "idle",
      detail: hasFunding ? (approved ? "Release gate open" : "Awaiting milestone") : "Unfunded",
    },
    {
      name: "Reward Engine",
      role: "Splits funds by score",
      icon: Coins,
      status: hasRewards ? "complete" : approved ? "active" : "idle",
      detail: hasRewards ? `${rewards.length} payouts` : approved ? "Ready to distribute" : "Locked",
    },
    {
      name: "Hypercertificate",
      role: "Compiles lifecycle certificate",
      icon: BadgeCheck,
      status: hasContrib ? "complete" : "idle",
      detail: hasContrib ? "Profile live" : "Pending",
    },
  ];

  const activity: ActivityEntry[] = [
    ...contributions.map((contribution) => ({
      key: `c-${contribution.id}`,
      icon: FileText,
      tone: "text-contributor",
      text: `${shortHash(contribution.contributorWalletAddress)} submitted “${contribution.title}”`,
      at: contribution.createdAt,
    })),
    ...fundingEvents.map((event) => ({
      key: `f-${event.id ?? event.txHash}`,
      icon: CircleDollarSign,
      tone: "text-funding",
      text: `${shortHash(event.sponsorAddress)} escrowed ${formatEth(event.amountWei)}`,
      at: event.createdAt,
    })),
    ...milestones.map((milestone) => ({
      key: `m-${milestone.id}`,
      icon: Flag,
      tone: "text-reputation",
      text: `Milestone “${milestone.title}” ${milestone.status}`,
      at: milestone.createdAt,
    })),
    ...rewards.map((reward) => ({
      key: `r-${reward.txHash}-${reward.walletAddress}`,
      icon: Coins,
      tone: "text-ai",
      text: `${shortHash(reward.walletAddress)} rewarded ${formatEth(reward.amountWei)}`,
      at: reward.createdAt,
    })),
  ]
    .filter((entry) => entry.at)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6);

  const decisions = [
    ...(plan?.clarifyingQuestions ?? []).slice(0, 2).map((question) => ({ tone: "text-reputation", text: question })),
    ...(plan?.risks ?? []).slice(0, 2).map((risk) => ({ tone: "text-risk", text: risk })),
  ];

  return (
    <Card variant="glow" className="border-accent/25 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="mono flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent-soft">
            <Workflow className="size-3.5" aria-hidden />
            AI Coordinator
          </p>
          <h2 className="mt-1 text-h3">Coordination control center</h2>
        </div>
        <span className="mono rounded-card border border-accent/30 bg-accent-dim px-2.5 py-1 text-xs text-accent-soft">
          {agents.filter((agent) => agent.status !== "idle").length}/{agents.length} agents engaged
        </span>
      </div>

      {/* Agent pipeline */}
      <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => {
          const style = statusStyle[agent.status];
          const Icon = agent.icon;

          return (
            <div key={agent.name} className="rounded-card border border-border bg-surface/50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-card border border-border bg-white/[0.04] text-text-secondary">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="text-sm font-semibold">{agent.name}</span>
                </span>
                <span className={cn("mono flex items-center gap-1 rounded-card border px-2 py-0.5 text-[10px]", style.pill)}>
                  <span className={cn("size-1.5 rounded-full", style.dot)} />
                  {style.label}
                </span>
              </div>
              <p className="mt-2 text-xs text-text-muted">{agent.role}</p>
              <p className="mt-1 text-xs text-text-secondary">{agent.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Activity stream */}
        <div>
          <p className="text-sm font-semibold text-text-secondary">Activity stream</p>
          <div className="mt-3 grid gap-3">
            {activity.length ? (
              activity.map((entry) => {
                const Icon = entry.icon;

                return (
                  <div key={entry.key} className="flex items-start gap-2.5">
                    <span className={cn("mt-0.5 shrink-0", entry.tone)}>
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm leading-5 text-text-secondary">{entry.text}</p>
                      <p className="mono text-xs text-text-muted">{timeAgo(entry.at)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-text-muted">No coordinated activity yet. The first contribution starts the stream.</p>
            )}
          </div>
        </div>

        {/* Decisions / suggested actions */}
        <div>
          <p className="text-sm font-semibold text-text-secondary">Decisions to make</p>
          <div className="mt-3 grid gap-2">
            {decisions.length ? (
              decisions.map((decision) => (
                <div key={decision.text} className="flex items-start gap-2 rounded-card border border-border bg-white/[0.03] p-2.5">
                  <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", decision.tone.replace("text-", "bg-"))} />
                  <p className="text-sm leading-5 text-text-secondary">{decision.text}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-muted">
                {plan ? "No open decisions — the copilot has no blocking questions or risks." : "Generate the AI analysis to surface decisions."}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
