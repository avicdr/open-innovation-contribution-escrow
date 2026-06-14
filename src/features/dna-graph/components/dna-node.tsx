import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { DnaNodeKind } from "@/features/dna-graph/types";

type DnaNodeData = {
  readonly kind: DnaNodeKind;
  readonly label: string;
  readonly metric?: string;
};

type KindStyle = {
  readonly label: string;
  readonly color: string;
};

const kindStyles: Record<DnaNodeKind, KindStyle> = {
  innovation: { label: "Idea", color: "#ee692e" },
  contributor: { label: "Contributor", color: "#f0a8ba" },
  contribution: { label: "Contribution", color: "#a8d3bb" },
  funding: { label: "Funding", color: "#85be9d" },
  milestone: { label: "Milestone", color: "#f08a5d" },
  outcome: { label: "Outcome", color: "#85be9d" },
  reward: { label: "Reward", color: "#eb8299" },
};

function DnaNodeComponent({ data }: NodeProps<DnaNodeData>) {
  const style = kindStyles[data.kind];

  return (
    <div className="relative w-52">
      <Handle type="target" position={Position.Left} className="!size-1.5 !border-0 !bg-white/30" />
      <div
        className="overflow-hidden rounded-card border bg-surface-elevated"
        style={{ borderColor: `${style.color}66`, boxShadow: `0 0 0 1px ${style.color}33, 0 0 22px ${style.color}33, 0 12px 36px rgba(0,0,0,0.4)` }}
      >
        <div className="h-1 w-full" style={{ backgroundColor: style.color }} />
        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full" style={{ backgroundColor: style.color }} />
            <span className="mono text-[10px] uppercase tracking-wider" style={{ color: style.color }}>
              {style.label}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-5 text-text-primary">{data.label}</p>
          {data.metric ? <p className="mono mt-1 text-xs text-text-muted">{data.metric}</p> : null}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!size-1.5 !border-0 !bg-white/30" />
    </div>
  );
}

export const DnaNodeView = memo(DnaNodeComponent);
