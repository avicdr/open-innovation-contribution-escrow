"use client";

import { AlertTriangle, Clock, ListChecks, RefreshCw, Sparkles, TrendingUp, Users, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import type { InnovationDto } from "@/services/innovation/innovation-repository";

type CopilotPlan = Omit<NonNullable<InnovationDto["aiCopilot"]>, "generatedAt"> & {
  readonly generatedAt?: string;
};

type CopilotPanelProps = {
  readonly innovationId: string;
  readonly initialPlan?: CopilotPlan;
};

type CopilotState =
  | { readonly status: "idle"; readonly plan?: CopilotPlan; readonly message?: string }
  | { readonly status: "processing"; readonly plan?: CopilotPlan; readonly message: string }
  | { readonly status: "success"; readonly plan: CopilotPlan; readonly message: string }
  | { readonly status: "error"; readonly plan?: CopilotPlan; readonly message: string };

type CopilotApiResponse =
  | {
      readonly success: true;
      readonly data: {
        readonly plan: CopilotPlan;
        readonly innovation: InnovationDto | null;
      };
    }
  | {
      readonly success: false;
      readonly error: {
        readonly message: string;
      };
    };

export function CopilotPanel({ innovationId, initialPlan }: CopilotPanelProps) {
  const router = useRouter();
  const notify = useToast();
  const [state, setState] = useState<CopilotState>({ status: "idle", plan: initialPlan });
  const plan = state.plan;
  const inputQuality = plan?.inputQuality ?? "UNDER_SPECIFIED";
  const qualityLabel =
    inputQuality === "CLEAR" ? "Clear Input" : inputQuality === "INVALID_OR_NOISY" ? "Invalid or Noisy Input" : "Under-Specified Input";

  async function generateCopilotPlan() {
    setState({
      status: "processing",
      plan,
      message: "Gemini is recalculating needed contributors, milestones, risks, budget, and readiness.",
    });

    try {
      const response = await fetch(`/api/innovation/${innovationId}/copilot`, {
        method: "POST",
        cache: "no-store",
      });
      const payload = (await response.json()) as CopilotApiResponse;

      if (!payload.success) {
        throw new Error(payload.error.message);
      }

      const savedPlan = payload.data.innovation?.aiCopilot ?? payload.data.plan;

      setState({
        status: "success",
        plan: savedPlan,
        message: "Copilot plan regenerated and saved to this project.",
      });
      notify.success("Copilot plan regenerated and saved to this project.");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Copilot generation failed.";
      setState({
        status: "error",
        plan,
        message,
      });
      notify.error(message);
    }
  }

  return (
    <Card variant="glow" className="border-ai/25 p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="min-w-0">
          <p className="mono flex items-center gap-1.5 text-xs uppercase tracking-wider text-ai">
            <Sparkles className="size-3.5" aria-hidden />
            AI Intelligence
          </p>
          <h2 className="mt-1 text-h3">
            {plan ? `${plan.successProbability}% success probability` : "Awaiting AI analysis"}
          </h2>
          {plan ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`mono rounded-card border px-3 py-1 text-xs ${
                  inputQuality === "CLEAR"
                    ? "border-success/35 bg-success/10 text-success"
                    : inputQuality === "INVALID_OR_NOISY"
                      ? "border-risk/35 bg-risk/10 text-risk"
                      : "border-reputation/35 bg-reputation/10 text-reputation"
                }`}
              >
                {qualityLabel}
              </span>
              <span className="mono rounded-card border border-ai/25 bg-ai/10 px-3 py-1 text-xs text-ai">
                {plan.planReliability ?? 0}% reliability
              </span>
            </div>
          ) : null}
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {plan?.reasoning ??
              "Generate the copilot analysis to map needed contributors, milestones, budget, risks, and opportunities."}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="shrink-0"
          disabled={state.status === "processing"}
          onClick={generateCopilotPlan}
        >
          <RefreshCw className={`size-4 ${state.status === "processing" ? "animate-spin" : ""}`} aria-hidden />
          {plan ? "Retry analysis" : "Generate"}
        </Button>
      </div>

      {state.status !== "idle" ? (
        <p
          className={`mt-4 rounded-card border p-3 text-sm text-text-secondary ${
            state.status === "error"
              ? "border-risk/40 bg-risk/10"
              : state.status === "success"
                ? "border-success/40 bg-success/10"
                : "border-ai/40 bg-ai/10"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      {plan ? (
        <div className="mt-5 grid gap-4">
          {inputQuality !== "CLEAR" ? (
            <div className="rounded-card border border-reputation/30 bg-reputation/10 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-reputation">
                <AlertTriangle className="size-4" aria-hidden />
                Trust check required
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                This is a discovery plan, not a full execution plan. Improve the project description and rerun Gemini
                before recruiting or funding against it.
              </p>
            </div>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <Prediction icon={Clock} label="Timeline" value={plan.timeline} tone="text-innovation" />
            <Prediction icon={Wallet} label="Budget estimate" value={plan.budgetEstimate} tone="text-funding" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Section icon={ListChecks} title="Recommended next steps" tone="text-accent-soft">
              <div className="grid gap-2">
                {plan.milestones.slice(0, 3).map((milestone) => (
                  <div key={milestone.title} className="rounded-card border border-border bg-white/[0.03] p-3">
                    <p className="text-sm font-semibold">{milestone.title}</p>
                    <p className="mt-1 text-xs leading-5 text-text-secondary">{milestone.description}</p>
                    <p className="mono mt-1.5 text-xs text-text-muted">{milestone.estimatedTime}</p>
                  </div>
                ))}
              </div>
            </Section>

            <div className="grid gap-4">
              <Section icon={AlertTriangle} title="Risks" tone="text-risk">
                <BulletList items={plan.risks} dot="bg-risk" empty="No material risks flagged." />
              </Section>
              <Section icon={TrendingUp} title="Opportunities" tone="text-success">
                <BulletList items={plan.opportunities} dot="bg-success" empty="No opportunities surfaced yet." />
              </Section>
            </div>
          </div>

          <Section icon={Users} title="Resource suggestions" tone="text-contributor">
            <div className="flex flex-wrap gap-2">
              {plan.requiredRoles.length ? (
                plan.requiredRoles.map((role) => (
                  <span key={role} className="rounded-card border border-border bg-white/[0.04] px-3 py-1 text-xs text-text-secondary">
                    {role}
                  </span>
                ))
              ) : (
                <span className="text-sm text-text-muted">Awaiting Gemini role map.</span>
              )}
            </div>
          </Section>

          {plan.clarifyingQuestions?.length ? (
            <Section icon={AlertTriangle} title="Resolve before funding" tone="text-reputation">
              <div className="grid gap-2">
                {plan.clarifyingQuestions.slice(0, 5).map((question) => (
                  <p key={question} className="rounded-card border border-border bg-white/[0.03] p-3 text-xs leading-5 text-text-secondary">
                    {question}
                  </p>
                ))}
              </div>
            </Section>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

type SectionProps = {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly title: string;
  readonly tone: string;
  readonly children: React.ReactNode;
};

function Section({ icon: Icon, title, tone, children }: SectionProps) {
  return (
    <div>
      <p className={`flex items-center gap-1.5 text-sm font-semibold ${tone}`}>
        <Icon className="size-4" aria-hidden />
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function BulletList({ items, dot, empty }: { readonly items: readonly string[]; readonly dot: string; readonly empty: string }) {
  if (!items.length) {
    return <p className="text-sm text-text-muted">{empty}</p>;
  }

  return (
    <div className="grid gap-2">
      {items.slice(0, 5).map((item) => (
        <div key={item} className="flex items-start gap-2 text-sm leading-5 text-text-secondary">
          <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${dot}`} />
          {item}
        </div>
      ))}
    </div>
  );
}

function Prediction({
  icon: Icon,
  label,
  value,
  tone,
}: {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly value: string;
  readonly tone: string;
}) {
  return (
    <div className="rounded-card border border-border bg-surface/50 p-3">
      <p className="flex items-center gap-1.5 text-xs text-text-muted">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </p>
      <p className={`mt-1 text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
