"use client";

import { Activity, GitBranch, ShieldCheck, Sparkles } from "lucide-react";

const innovationNodes = [
  { id: "flood", label: "AI Flood Prediction", x: 50, y: 13, tone: "#ee692e", metric: "82" },
  { id: "battery", label: "Battery Materials", x: 82, y: 30, tone: "#85be9d", metric: "76" },
  { id: "mesh", label: "Mesh Response Kit", x: 80, y: 70, tone: "#f0a8ba", metric: "71" },
  { id: "water", label: "Open Water Sensors", x: 50, y: 88, tone: "#f08a5d", metric: "68" },
  { id: "bio", label: "Biochar MRV", x: 18, y: 70, tone: "#eb8299", metric: "79" },
  { id: "care", label: "Rural Care Routing", x: 18, y: 30, tone: "#a8d3bb", metric: "73" },
];

const satellites = [
  { label: "Proofs", x: 36, y: 36, icon: ShieldCheck },
  { label: "AI Scores", x: 64, y: 36, icon: Sparkles },
  { label: "Funding", x: 63, y: 64, icon: Activity },
  { label: "Rewards", x: 37, y: 64, icon: GitBranch },
];

export function InnovationSpiderGraph() {
  return (
    <div className="relative h-full min-h-[34rem] overflow-hidden rounded-card border border-innovation/20 bg-background-secondary shadow-[0_0_70px_rgba(238,105,46,0.12)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <filter id="spiderGlow">
            <feGaussianBlur stdDeviation="1.6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {innovationNodes.map((node) => (
          <line
            key={`core-${node.id}`}
            x1="50"
            y1="50"
            x2={node.x}
            y2={node.y}
            stroke={node.tone}
            strokeOpacity="0.42"
            strokeWidth="0.35"
            filter="url(#spiderGlow)"
          />
        ))}
        {innovationNodes.map((node, index) => {
          const next = innovationNodes[(index + 1) % innovationNodes.length];
          return (
            <line
              key={`ring-${node.id}`}
              x1={node.x}
              y1={node.y}
              x2={next.x}
              y2={next.y}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="0.25"
            />
          );
        })}
        {satellites.map((node) => (
          <line
            key={`satellite-${node.label}`}
            x1="50"
            y1="50"
            x2={node.x}
            y2={node.y}
            stroke="rgba(255,255,255,0.18)"
            strokeDasharray="1 1"
            strokeWidth="0.22"
          />
        ))}
      </svg>

      <div className="absolute left-1/2 top-1/2 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-innovation/40 bg-surface-elevated text-center shadow-[0_0_50px_rgba(238,105,46,0.22)]">
        <div>
          <p className="mono text-xs text-innovation">OICE</p>
          <p className="mt-1 text-sm font-semibold">Coordination Core</p>
        </div>
      </div>

      {innovationNodes.map((node) => (
        <div
          key={node.id}
          className="absolute w-44 -translate-x-1/2 -translate-y-1/2 rounded-card border bg-surface/95 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.32)]"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            borderColor: `${node.tone}66`,
            boxShadow: `0 0 34px ${node.tone}24`,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold leading-5">{node.label}</p>
            <span className="mono text-sm" style={{ color: node.tone }}>
              {node.metric}
            </span>
          </div>
          <p className="mono mt-2 text-[11px] text-text-muted">readiness</p>
        </div>
      ))}

      {satellites.map((satellite) => {
        const Icon = satellite.icon;
        return (
          <div
            key={satellite.label}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-border bg-background-primary/95 px-3 py-2 text-xs text-text-secondary"
            style={{ left: `${satellite.x}%`, top: `${satellite.y}%` }}
          >
            <Icon className="size-3.5 text-innovation" aria-hidden />
            {satellite.label}
          </div>
        );
      })}
    </div>
  );
}
