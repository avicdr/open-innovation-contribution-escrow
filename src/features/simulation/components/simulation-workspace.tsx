"use client";

import { Check, Pause, Play, RotateCcw, StepBack, StepForward } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { DnaGraphView } from "@/features/dna-graph/components/dna-graph";
import { demoGraphForSimulationStep } from "@/features/dna-graph/sample-data";
import { simulationFrames, type SimulationLayer } from "@/features/simulation/state-machine";

const speedMs = {
  "1x": 3200,
  "2x": 1800,
  "5x": 700,
};

type Speed = keyof typeof speedMs;

const layerStyles: Record<SimulationLayer, { readonly label: string; readonly color: string }> = {
  User: { label: "User", color: "#f0a8ba" },
  Backend: { label: "Backend", color: "#f08a5d" },
  AI: { label: "AI", color: "#eb8299" },
  "On-Chain": { label: "On-Chain", color: "#ee692e" },
  Indexer: { label: "Indexer", color: "#85be9d" },
};

export function SimulationWorkspace() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<Speed>("1x");
  const lastIndex = simulationFrames.length - 1;
  const frame = simulationFrames[frameIndex];
  const complete = frameIndex === lastIndex;
  const graph = useMemo(() => demoGraphForSimulationStep(frameIndex), [frameIndex]);

  // Manual navigation (back/forward/jump) pauses autoplay so going to an
  // earlier step is not immediately overridden by the play timer.
  const goToStep = useCallback(
    (index: number) => {
      setPlaying(false);
      setFrameIndex(Math.min(Math.max(index, 0), lastIndex));
    },
    [lastIndex],
  );

  useEffect(() => {
    if (!playing || complete) {
      if (complete) {
        setPlaying(false);
      }
      return;
    }

    const timeout = window.setTimeout(() => {
      setFrameIndex((current) => Math.min(current + 1, lastIndex));
    }, speedMs[speed]);

    return () => window.clearTimeout(timeout);
  }, [complete, frameIndex, lastIndex, playing, speed]);

  return (
    <div className="grid min-h-[calc(100vh-9rem)] gap-4 lg:grid-cols-[320px_1fr_360px]">
      <Card className="flex max-h-[calc(100vh-9rem)] flex-col p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Timeline</h2>
          <span className="mono text-xs text-text-muted">click any step to jump</span>
        </div>
        <div className="mt-5 grid gap-2 overflow-y-auto pr-1">
          {simulationFrames.map((timelineFrame, index) => {
            const isCurrent = index === frameIndex;
            const isPast = index < frameIndex;

            return (
              <button
                key={timelineFrame.step}
                type="button"
                onClick={() => goToStep(index)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-card border p-3 text-left transition duration-fast",
                  isCurrent
                    ? "border-innovation/60 bg-innovation/10"
                    : isPast
                      ? "border-border bg-background-secondary hover:border-innovation/40"
                      : "border-border bg-background-secondary/40 hover:border-white/20",
                )}
              >
                <span
                  className={cn(
                    "mono grid size-6 shrink-0 place-items-center rounded-full border text-[11px]",
                    isCurrent
                      ? "border-innovation text-innovation"
                      : isPast
                        ? "border-success/50 bg-success/15 text-success"
                        : "border-border text-text-muted",
                  )}
                >
                  {isPast ? <Check className="size-3.5" aria-hidden /> : index + 1}
                </span>
                <span className="min-w-0">
                  <p className={cn("truncate text-sm font-semibold", isCurrent ? "text-text-primary" : "text-text-secondary")}>
                    {timelineFrame.title}
                  </p>
                  <p className="mono mt-0.5 text-xs text-text-muted">{timelineFrame.progress}%</p>
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="relative overflow-hidden p-4">
        <div className="absolute left-5 top-5 z-10 max-w-[18rem] rounded-card border border-border bg-surface/95 px-3 py-2">
          <p className="mono text-xs text-text-muted">
            step {frameIndex + 1} / {simulationFrames.length} · {frame.actor}
          </p>
          <p className="mt-1 text-sm font-semibold">{frame.title}</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">{frame.summary}</p>
        </div>
        <DnaGraphView key={frame.step} graph={graph} />
        <div className="absolute bottom-5 left-1/2 flex w-[min(28rem,calc(100%-2.5rem))] -translate-x-1/2 flex-col gap-2 rounded-card border border-border bg-surface/95 p-2">
          <input
            type="range"
            min={0}
            max={lastIndex}
            value={frameIndex}
            aria-label="Scrub simulation steps"
            onChange={(event) => goToStep(Number(event.target.value))}
            className="accent-innovation"
          />
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous step"
              disabled={frameIndex === 0}
              onClick={() => goToStep(frameIndex - 1)}
            >
              <StepBack className="size-4" aria-hidden />
            </Button>
            {playing ? (
              <Button variant="ghost" size="icon" aria-label="Pause simulation" onClick={() => setPlaying(false)}>
                <Pause className="size-4" aria-hidden />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Play simulation"
                disabled={complete}
                onClick={() => setPlaying(true)}
              >
                <Play className="size-4" aria-hidden />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next step"
              disabled={complete}
              onClick={() => goToStep(frameIndex + 1)}
            >
              <StepForward className="size-4" aria-hidden />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Restart simulation" onClick={() => goToStep(0)}>
              <RotateCcw className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </Card>

      <Card className="flex max-h-[calc(100vh-9rem)] flex-col p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="mono text-xs uppercase tracking-wider text-innovation">{frame.actor}</p>
            <h2 className="mt-0.5 text-xl font-semibold">{frame.title}</h2>
          </div>
          <span className="mono shrink-0 rounded-card border border-border bg-background-secondary px-2 py-1 text-xs text-text-muted">
            {frame.progress}%
          </span>
        </div>

        <div className="mt-4 grid gap-4 overflow-y-auto pr-1">
          <section>
            <p className="mono text-xs uppercase tracking-wider text-text-muted">What&apos;s happening</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{frame.explanation}</p>
          </section>

          <section>
            <p className="mono text-xs uppercase tracking-wider text-text-muted">Under the hood</p>
            <div className="mt-2 grid gap-2">
              {frame.details.map((detail) => {
                const style = layerStyles[detail.layer];

                return (
                  <div
                    key={detail.text}
                    className="rounded-card border border-border bg-background-secondary p-3"
                  >
                    <span
                      className="mono inline-block rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider"
                      style={{ color: style.color, borderColor: `${style.color}55`, backgroundColor: `${style.color}14` }}
                    >
                      {style.label}
                    </span>
                    <p className="mt-1.5 text-sm leading-5 text-text-secondary">{detail.text}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {frame.payload ? (
            <section>
              <p className="mono text-xs uppercase tracking-wider text-text-muted">{frame.payload.label}</p>
              <pre className="mono mt-2 overflow-x-auto rounded-card border border-ai/25 bg-background-primary/70 p-3 text-xs leading-5 text-ai">
                {frame.payload.code}
              </pre>
            </section>
          ) : null}

          <section className="grid grid-cols-3 gap-2">
            {frame.metrics.map((metric) => (
              <div key={metric.label} className="rounded-card border border-border bg-background-secondary p-3">
                <p className="text-[11px] leading-4 text-text-muted">{metric.label}</p>
                <p className="mono mt-1 text-sm text-innovation">{metric.value}</p>
              </div>
            ))}
          </section>

          <section>
            <p className="mono text-xs uppercase tracking-wider text-text-muted">Result</p>
            <p className="mt-2 rounded-card border border-success/30 bg-success/10 p-3 text-sm leading-6 text-text-secondary">
              {frame.result}
            </p>
            {frame.route.startsWith("contract:") ? (
              <span className="mono mt-2 block text-xs text-text-muted">{frame.route}</span>
            ) : (
              <Link href={frame.route} className="mono mt-2 block text-xs text-ai hover:underline">
                {frame.route}
              </Link>
            )}
          </section>

          <section>
            <p className="mono text-xs uppercase tracking-wider text-text-muted">System events</p>
            <div className="mt-2 grid gap-2">
              {frame.systemEvents.map((event) => (
                <div key={event} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-innovation" />
                  {event}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <div className="h-2 rounded-full bg-surface-hover">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-innovation to-funding transition-all duration-normal"
              style={{ width: `${frame.progress}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="mono text-xs text-text-muted">autoplay speed</span>
            <div className="flex gap-2">
              {(Object.keys(speedMs) as Speed[]).map((speedValue) => (
                <Button
                  key={speedValue}
                  type="button"
                  variant={speedValue === speed ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setSpeed(speedValue)}
                >
                  {speedValue}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
