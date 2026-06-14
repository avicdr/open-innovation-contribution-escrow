import { cn } from "@/lib/utils/cn";

export type MetricTone = "accent" | "innovation" | "funding" | "risk" | "reputation" | "ai";

const toneColor: Record<MetricTone, string> = {
  accent: "#f08a5d",
  innovation: "#ee692e",
  funding: "#85be9d",
  risk: "#d9544e",
  reputation: "#f08a5d",
  ai: "#eb8299",
};

const toneText: Record<MetricTone, string> = {
  accent: "text-accent-soft",
  innovation: "text-innovation",
  funding: "text-funding",
  risk: "text-risk",
  reputation: "text-reputation",
  ai: "text-ai",
};

type RingProps = {
  readonly label: string;
  /** 0–100 progress driving the ring fill. */
  readonly value: number;
  /** Text shown in the centre (defaults to `${value}`). */
  readonly display?: string;
  readonly sub?: string;
  readonly tone?: MetricTone;
};

export function MetricRing({ label, value, display, sub, tone = "accent" }: RingProps) {
  const pct = Math.max(0, Math.min(100, value));
  const size = 76;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (circumference * pct) / 100;
  const color = toneColor[tone];

  return (
    <div className="flex items-center gap-4 rounded-card border border-border bg-surface/50 p-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            style={{ filter: `drop-shadow(0 0 5px ${color}66)` }}
          />
        </svg>
        <span className="mono absolute inset-0 grid place-items-center text-sm font-semibold text-text-primary">
          {display ?? String(value)}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        {sub ? <p className="mt-0.5 text-xs text-text-muted">{sub}</p> : null}
      </div>
    </div>
  );
}

type StatProps = {
  readonly label: string;
  readonly display: string;
  readonly sub?: string;
  readonly tone?: MetricTone;
};

export function MetricStat({ label, display, sub, tone = "accent" }: StatProps) {
  return (
    <div className="rounded-card border border-border bg-surface/50 p-4">
      <p className="text-sm text-text-muted">{label}</p>
      <p className={cn("mono mt-2 break-words text-2xl", toneText[tone])}>{display}</p>
      {sub ? <p className="mt-1 text-xs text-text-muted">{sub}</p> : null}
    </div>
  );
}
