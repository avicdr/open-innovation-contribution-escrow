export type DnaNodeKind = "innovation" | "contributor" | "contribution" | "funding" | "milestone" | "outcome" | "reward";

export type DnaNode = {
  readonly id: string;
  readonly kind: DnaNodeKind;
  readonly label: string;
  readonly metric?: string;
  readonly position: {
    readonly x: number;
    readonly y: number;
  };
};

export type DnaEdgeKind = "knowledge" | "contribution" | "funding" | "reward" | "execution";

export type DnaEdge = {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly kind: DnaEdgeKind;
  readonly label?: string;
};

export type DnaGraph = {
  readonly nodes: readonly DnaNode[];
  readonly edges: readonly DnaEdge[];
};
