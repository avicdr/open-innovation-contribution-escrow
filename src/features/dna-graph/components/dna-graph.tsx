"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  Panel,
  type Edge,
  type Node,
  type NodeTypes,
} from "reactflow";
import { DnaNodeView } from "@/features/dna-graph/components/dna-node";
import type { DnaEdgeKind, DnaGraph } from "@/features/dna-graph/types";

type DnaGraphViewProps = {
  readonly graph: DnaGraph;
  readonly compact?: boolean;
};

const nodeTypes: NodeTypes = {
  dna: DnaNodeView,
};

const edgeColor: Record<DnaEdgeKind, string> = {
  knowledge: "#ee692e",
  contribution: "#f0a8ba",
  funding: "#85be9d",
  reward: "#eb8299",
  execution: "#f08a5d",
};

const legend: ReadonlyArray<readonly [string, string]> = [
  ["Idea", "#ee692e"],
  ["Contributor", "#f0a8ba"],
  ["Funding", "#85be9d"],
  ["Milestone", "#f08a5d"],
  ["Reward", "#eb8299"],
];

const nodeColorByKind: Record<string, string> = {
  innovation: "#ee692e",
  contributor: "#f0a8ba",
  contribution: "#a8d3bb",
  funding: "#85be9d",
  milestone: "#f08a5d",
  outcome: "#85be9d",
  reward: "#eb8299",
};

export function DnaGraphView({ graph, compact = false }: DnaGraphViewProps) {
  const nodes = useMemo<Node[]>(
    () =>
      graph.nodes.map((node) => ({
        id: node.id,
        type: "dna",
        position: node.position,
        data: {
          kind: node.kind,
          label: node.label,
          metric: node.metric,
        },
      })),
    [graph.nodes],
  );

  const edges = useMemo<Edge[]>(
    () =>
      graph.edges.map((edge) => {
        const color = edgeColor[edge.kind];
        const animated = edge.kind === "funding" || edge.kind === "reward";

        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          type: "smoothstep",
          animated,
          style: { stroke: color, strokeWidth: 1.75, opacity: 0.85 },
          labelStyle: { fill: "#ded2c4", fontSize: 11 },
          labelBgStyle: { fill: "#0a0a0a", fillOpacity: 0.85 },
          markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
        };
      }),
    [graph.edges],
  );

  return (
    <div
      className={`overflow-hidden rounded-card border border-border bg-background-secondary ${
        compact ? "h-[26rem]" : "h-full min-h-[34rem]"
      }`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.2}
        nodesDraggable
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255,255,255,0.06)" gap={26} />
        {compact ? null : <Controls showInteractive={false} className="!border-border !bg-surface-elevated" />}
        {compact ? null : (
          <MiniMap
            pannable
            zoomable
            nodeColor={(node) => nodeColorByKind[(node.data as { kind?: string })?.kind ?? ""] ?? "#ee692e"}
            nodeStrokeWidth={0}
            maskColor="rgba(10, 10, 10, 0.72)"
            className="!border !border-border !bg-background-secondary"
          />
        )}
        <Panel position="top-left" className={compact ? "max-w-[calc(100%-1rem)]" : undefined}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-card border border-border bg-background-secondary/85 px-3 py-2 backdrop-blur">
            {legend.map(([label, color]) => (
              <span key={label} className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </span>
            ))}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
