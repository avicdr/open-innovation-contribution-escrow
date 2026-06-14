import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  readonly icon?: ReactNode;
  readonly title: string;
  readonly description: string;
  /** AI-style guidance line — what the user should do and why it matters. */
  readonly guidance?: string;
  readonly action?: ReactNode;
};

export function EmptyState({ icon, title, description, guidance, action }: EmptyStateProps) {
  return (
    <Card className="grid place-items-center gap-3 p-12 text-center">
      {icon ? (
        <div className="grid size-12 place-items-center rounded-xl border border-accent/30 bg-accent-dim text-accent-soft shadow-glow-accent">
          {icon}
        </div>
      ) : null}
      <h2 className="text-h3">{title}</h2>
      <p className="max-w-md text-text-secondary">{description}</p>
      {guidance ? (
        <p className="flex max-w-md items-start gap-2 rounded-card border border-ai/25 bg-ai/[0.06] px-3 py-2 text-left text-sm text-text-secondary">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-ai" aria-hidden />
          <span>{guidance}</span>
        </p>
      ) : null}
      {action ? <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </Card>
  );
}
