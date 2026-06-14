import type { DnaGraph } from "@/features/dna-graph/types";

export const demoDnaGraph: DnaGraph = {
  nodes: [
    { id: "idea", kind: "innovation", label: "AI Flood Prediction Network", metric: "82 readiness", position: { x: 0, y: 160 } },
    { id: "alice", kind: "contributor", label: "Alice", metric: "engineering", position: { x: -260, y: 20 } },
    { id: "bob", kind: "contributor", label: "Bob", metric: "research", position: { x: -260, y: 160 } },
    { id: "carol", kind: "contributor", label: "Carol", metric: "community", position: { x: -260, y: 300 } },
    { id: "smart-contract", kind: "contribution", label: "Smart Contract", metric: "94 impact", position: { x: 260, y: 20 } },
    { id: "dataset", kind: "contribution", label: "Research Dataset", metric: "86 impact", position: { x: 260, y: 160 } },
    { id: "growth", kind: "contribution", label: "Community Growth", metric: "74 impact", position: { x: 260, y: 300 } },
    { id: "funding", kind: "funding", label: "Escrow Deposit", metric: "1.0 ETH", position: { x: 560, y: 110 } },
    { id: "milestone", kind: "milestone", label: "Prototype Complete", metric: "approved", position: { x: 560, y: 250 } },
    { id: "reward", kind: "reward", label: "Reward Split", metric: "0.5 / 0.3 / 0.2", position: { x: 840, y: 180 } },
  ],
  edges: [
    { id: "alice-contract", source: "alice", target: "smart-contract", kind: "contribution" },
    { id: "bob-dataset", source: "bob", target: "dataset", kind: "knowledge" },
    { id: "carol-growth", source: "carol", target: "growth", kind: "contribution" },
    { id: "contract-idea", source: "smart-contract", target: "idea", kind: "contribution" },
    { id: "dataset-idea", source: "dataset", target: "idea", kind: "knowledge" },
    { id: "growth-idea", source: "growth", target: "idea", kind: "contribution" },
    { id: "idea-funding", source: "idea", target: "funding", kind: "funding" },
    { id: "idea-milestone", source: "idea", target: "milestone", kind: "execution" },
    { id: "funding-reward", source: "funding", target: "reward", kind: "reward" },
    { id: "milestone-reward", source: "milestone", target: "reward", kind: "execution" },
  ],
};

const simulationRevealByStep = [
  ["idea"],
  ["idea"],
  ["idea", "alice", "bob", "carol"],
  ["idea", "alice", "bob", "carol", "smart-contract", "dataset", "growth"],
  ["idea", "alice", "bob", "carol", "smart-contract", "dataset", "growth"],
  ["idea", "alice", "bob", "carol", "smart-contract", "dataset", "growth"],
  ["idea", "alice", "bob", "carol", "smart-contract", "dataset", "growth", "funding"],
  ["idea", "alice", "bob", "carol", "smart-contract", "dataset", "growth", "funding", "milestone"],
  ["idea", "alice", "bob", "carol", "smart-contract", "dataset", "growth", "funding", "milestone", "reward"],
  ["idea", "alice", "bob", "carol", "smart-contract", "dataset", "growth", "funding", "milestone", "reward"],
  ["idea", "alice", "bob", "carol", "smart-contract", "dataset", "growth", "funding", "milestone", "reward"],
  ["idea", "alice", "bob", "carol", "smart-contract", "dataset", "growth", "funding", "milestone", "reward"],
] as const;

export function demoGraphForSimulationStep(stepIndex: number): DnaGraph {
  const visible = new Set<string>(simulationRevealByStep[Math.min(stepIndex, simulationRevealByStep.length - 1)]);

  return {
    nodes: demoDnaGraph.nodes.filter((node) => visible.has(node.id)),
    edges: demoDnaGraph.edges.filter((edge) => visible.has(edge.source) && visible.has(edge.target)),
  };
}
