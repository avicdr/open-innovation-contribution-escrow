import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ContributionDto } from "@/services/contribution/contribution-repository";

type ContributionHeatmapGraphProps = {
  readonly contributions: readonly ContributionDto[];
  /** Render inside an existing card instead of its own card shell. */
  readonly bare?: boolean;
};

// X axis: impact-score bands. Y axis: contribution type. Cell value: count.
const bands: ReadonlyArray<{ readonly label: string; readonly min: number; readonly max: number }> = [
  { label: "0–20", min: 0, max: 20 },
  { label: "21–40", min: 21, max: 40 },
  { label: "41–60", min: 41, max: 60 },
  { label: "61–80", min: 61, max: 80 },
  { label: "81–100", min: 81, max: 100 },
];

const INNOVATION = "0, 229, 255";

function impactOf(contribution: ContributionDto): number | null {
  const raw = contribution.impactScore ?? contribution.aiScore?.overallScore;
  return typeof raw === "number" ? Math.max(0, Math.min(100, Math.round(raw))) : null;
}

function bandIndex(score: number): number {
  return Math.min(bands.length - 1, bands.findIndex((band) => score >= band.min && score <= band.max));
}

function cellStyle(count: number, max: number): { readonly style: React.CSSProperties; readonly fg: string } {
  if (count === 0) {
    return {
      style: { backgroundColor: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" },
      fg: "text-text-muted/40",
    };
  }

  const t = max <= 1 ? 1 : count / max;
  const alpha = 0.2 + t * 0.72;

  return {
    style: {
      backgroundColor: `rgba(${INNOVATION}, ${alpha})`,
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: t >= 0.8 ? `0 0 14px rgba(${INNOVATION}, 0.3)` : "none",
    },
    fg: t >= 0.55 ? "text-[#06121f]" : "text-text-primary",
  };
}

export function ContributionHeatmapGraph({ contributions, bare = false }: ContributionHeatmapGraphProps) {
  const scored = contributions
    .map((contribution) => ({ type: contribution.type, score: impactOf(contribution) }))
    .filter((entry): entry is { type: ContributionDto["type"]; score: number } => entry.score !== null);
  const pendingCount = contributions.length - scored.length;

  // Build the type → band → count matrix, ordered by total contributions per type.
  const matrix = new Map<string, number[]>();
  for (const entry of scored) {
    const row = matrix.get(entry.type) ?? new Array(bands.length).fill(0);
    row[bandIndex(entry.score)] += 1;
    matrix.set(entry.type, row);
  }

  const rows = Array.from(matrix.entries())
    .map(([type, counts]) => ({ type, counts, total: counts.reduce((sum, value) => sum + value, 0) }))
    .sort((a, b) => b.total - a.total);

  const maxCount = rows.reduce((max, row) => Math.max(max, ...row.counts), 0);
  const columnTotals = bands.map((_, index) => rows.reduce((sum, row) => sum + row.counts[index], 0));
  const legendSteps = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.max(t === 0 ? 0 : 1, Math.round(t * maxCount)));

  const body = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mono flex items-center gap-1.5 text-xs uppercase tracking-wider text-innovation">
            <Activity className="size-3.5" aria-hidden />
            Contribution Impact Heatmap
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Contribution density by type and AI impact score. Brighter cells hold more work.
          </p>
        </div>
        {pendingCount > 0 ? (
          <span className="mono rounded-card border border-border bg-white/[0.04] px-2 py-1 text-[11px] text-text-muted">
            {pendingCount} pending score
          </span>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="mt-5 rounded-card border border-white/10 bg-white/[0.03] p-4 text-sm text-text-secondary">
          No scored contributions yet. As work is submitted and AI-evaluated, the heatmap fills in.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[360px]">
            {/* Header row: corner + impact-band labels + total */}
            <div className="grid items-end gap-1.5" style={{ gridTemplateColumns: "112px repeat(5, 1fr) 44px" }}>
              <span />
              {bands.map((band) => (
                <span key={band.label} className="mono pb-1 text-center text-[10px] text-text-muted">
                  {band.label}
                </span>
              ))}
              <span className="mono pb-1 text-center text-[10px] text-text-muted">Σ</span>
            </div>

            {/* Matrix rows */}
            <div className="grid gap-1.5">
              {rows.map((row) => (
                <div key={row.type} className="grid items-center gap-1.5" style={{ gridTemplateColumns: "112px repeat(5, 1fr) 44px" }}>
                  <span className="truncate text-right text-xs capitalize text-text-secondary" title={row.type}>
                    {row.type}
                  </span>
                  {row.counts.map((count, index) => {
                    const { style, fg } = cellStyle(count, maxCount);
                    return (
                      <div
                        key={index}
                        className={`mono grid aspect-[2/1] min-h-9 place-items-center rounded-[6px] text-xs font-semibold transition duration-fast hover:scale-[1.04] ${fg}`}
                        style={style}
                        title={`${row.type} · ${bands[index].label} impact · ${count} contribution${count === 1 ? "" : "s"}`}
                      >
                        {count > 0 ? count : ""}
                      </div>
                    );
                  })}
                  <span className="mono text-center text-xs text-text-secondary">{row.total}</span>
                </div>
              ))}

              {/* Column totals */}
              <div className="mt-0.5 grid items-center gap-1.5 border-t border-border pt-2" style={{ gridTemplateColumns: "112px repeat(5, 1fr) 44px" }}>
                <span className="mono text-right text-[10px] uppercase tracking-wider text-text-muted">total</span>
                {columnTotals.map((total, index) => (
                  <span key={index} className="mono text-center text-xs text-text-secondary">
                    {total}
                  </span>
                ))}
                <span className="mono text-center text-xs text-innovation">{scored.length}</span>
              </div>
            </div>

            {/* X-axis caption */}
            <div className="mt-2 grid gap-1.5" style={{ gridTemplateColumns: "112px repeat(5, 1fr) 44px" }}>
              <span />
              <span className="col-span-5 text-center text-[10px] uppercase tracking-wider text-text-muted">
                AI impact score →
              </span>
              <span />
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-4">
        <span className="text-[11px] text-text-muted">Fewer</span>
        <div className="flex items-center gap-1">
          {legendSteps.map((step, index) => {
            const { style } = cellStyle(step, maxCount);
            return <span key={index} className="size-4 rounded-[4px]" style={style} aria-hidden />;
          })}
        </div>
        <span className="text-[11px] text-text-muted">More contributions</span>
      </div>
    </>
  );

  if (bare) {
    return <div>{body}</div>;
  }

  return <Card className="border-innovation/20 p-5">{body}</Card>;
}
