"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type RoadmapStat = {
  readonly label: string;
  readonly value: string;
};

export type RoadmapStage = {
  readonly label: string;
  readonly note: string;
  readonly summary: string;
  readonly stats: readonly RoadmapStat[];
};

type RoadmapTimelineProps = {
  readonly stages: readonly RoadmapStage[];
  /** Index of the furthest stage reached (0-based). */
  readonly currentIndex: number;
  /** Currently selected/inspected stage (controlled). */
  readonly selected: number;
  readonly onSelect: (index: number) => void;
};

type Status = "complete" | "active" | "upcoming";

const statusLabel: Record<Status, string> = {
  complete: "Completed",
  active: "In progress",
  upcoming: "Upcoming",
};

const statusPill: Record<Status, string> = {
  complete: "border-success/30 bg-success/10 text-success",
  active: "border-accent/30 bg-accent-dim text-accent-soft",
  upcoming: "border-border bg-white/[0.03] text-text-muted",
};

export function RoadmapTimeline({ stages, currentIndex, selected, onSelect }: RoadmapTimelineProps) {
  const lastIndex = stages.length - 1;
  const clampedCurrent = Math.min(Math.max(currentIndex, 0), lastIndex);
  const safeSelected = Math.min(Math.max(selected, 0), lastIndex);

  const statusOf = (index: number): Status =>
    index < currentIndex ? "complete" : index === currentIndex ? "active" : "upcoming";

  const active = stages[safeSelected];
  const activeStatus = statusOf(safeSelected);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="text-h3">Execution Roadmap</h2>
        <span className="mono text-xs text-accent-soft">stage · {stages[clampedCurrent].label}</span>
      </div>

      <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {stages.map((stage, index) => {
          const status = statusOf(index);
          const isSelected = index === safeSelected;

          return (
            <li key={stage.label}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full flex-col gap-2 rounded-card border p-3 text-left transition duration-fast",
                  isSelected ? "border-accent bg-accent-dim" : "border-border bg-surface/40 hover:border-accent/40",
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "mono grid size-6 shrink-0 place-items-center rounded-full border text-[11px]",
                      status === "complete" && "border-success/50 bg-success/15 text-success",
                      status === "active" && "border-accent bg-accent text-white shadow-glow-accent",
                      status === "upcoming" && "border-border text-text-muted",
                    )}
                  >
                    {status === "complete" ? <Check className="size-3.5" aria-hidden /> : index + 1}
                  </span>
                  <span className={cn("text-sm font-semibold", status === "upcoming" && !isSelected ? "text-text-muted" : "text-text-primary")}>
                    {stage.label}
                  </span>
                </span>
                <span className="text-xs text-text-muted">{stage.note}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 rounded-card border border-border bg-surface/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">{active.label}</h3>
          <span className={cn("mono rounded-card border px-2 py-0.5 text-[11px]", statusPill[activeStatus])}>
            {statusLabel[activeStatus]}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{active.summary}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {active.stats.map((stat) => (
            <div key={stat.label} className="rounded-card border border-border bg-background-secondary/60 p-3">
              <p className="text-xs text-text-muted">{stat.label}</p>
              <p className="mono mt-1 text-sm capitalize text-text-primary">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
