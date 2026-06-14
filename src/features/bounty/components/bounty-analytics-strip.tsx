import { Award, CircleDot, Coins, Timer, Users } from "lucide-react";
import type { ComponentType } from "react";
import type { BountyAnalytics } from "@/services/bounty/bounty-repository";
import { formatWeiEth } from "@/features/bounty/bounty-ui";

type Metric = {
  readonly label: string;
  readonly value: string;
  readonly icon: ComponentType<{ className?: string }>;
  readonly tone: string;
};

export function BountyAnalyticsStrip({ analytics }: { readonly analytics: BountyAnalytics }) {
  const metrics: readonly Metric[] = [
    { label: "Total bounties", value: String(analytics.totalBounties), icon: CircleDot, tone: "text-innovation" },
    { label: "Completed", value: String(analytics.completedBounties), icon: Award, tone: "text-success" },
    { label: "Rewards paid", value: formatWeiEth(analytics.rewardsDistributedWei), icon: Coins, tone: "text-funding" },
    {
      label: "Avg. completion",
      value: analytics.averageCompletionHours === null ? "—" : `${analytics.averageCompletionHours}h`,
      icon: Timer,
      tone: "text-reputation",
    },
    { label: "Contributors", value: String(analytics.activeContributors), icon: Users, tone: "text-contributor" },
    { label: "Approval rate", value: `${analytics.participationRate}%`, icon: Users, tone: "text-ai" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <div key={metric.label} className="glass-panel rounded-card p-4">
            <Icon className={`size-4 ${metric.tone}`} aria-hidden />
            <p className={`mono mt-3 text-xl ${metric.tone}`}>{metric.value}</p>
            <p className="mt-1 text-xs text-text-muted">{metric.label}</p>
          </div>
        );
      })}
    </div>
  );
}
