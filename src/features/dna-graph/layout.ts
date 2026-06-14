import type { DnaNode, DnaNodeKind } from "@/features/dna-graph/types";

export type LayoutNode = Omit<DnaNode, "position"> & {
  readonly layer: number;
};

const COLUMN_WIDTH = 320;
const ROW_HEIGHT = 150;

const layerByKind: Record<DnaNodeKind, number> = {
  contributor: 0,
  contribution: 1,
  innovation: 2,
  outcome: 3,
  funding: 3,
  milestone: 3,
  reward: 4,
};

export function layerForKind(kind: DnaNodeKind): number {
  return layerByKind[kind];
}

/**
 * Positions nodes in clean left-to-right columns by layer, vertically centered
 * within each column. Replaces hand-tuned coordinates so the graph never
 * overlaps regardless of how many contributions/milestones a project has.
 */
export function layoutLayered(nodes: readonly LayoutNode[]): DnaNode[] {
  const byLayer = new Map<number, LayoutNode[]>();

  for (const node of nodes) {
    const bucket = byLayer.get(node.layer) ?? [];
    bucket.push(node);
    byLayer.set(node.layer, bucket);
  }

  const positioned: DnaNode[] = [];

  for (const [layer, layerNodes] of byLayer) {
    const startY = -((layerNodes.length - 1) * ROW_HEIGHT) / 2;

    for (const [index, node] of layerNodes.entries()) {
      positioned.push({
        id: node.id,
        kind: node.kind,
        label: node.label,
        metric: node.metric,
        position: { x: layer * COLUMN_WIDTH, y: startY + index * ROW_HEIGHT },
      });
    }
  }

  return positioned;
}
