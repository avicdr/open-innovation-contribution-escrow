"use client";

import { PencilLine, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { InnovationDraftData } from "@/domain/ai/schemas";
import {
  CreateInnovationForm,
  type CreateInnovationInitialValues,
} from "@/features/innovation/components/create-innovation-form";
import { GenerateInnovationForm } from "@/features/innovation/components/generate-innovation-form";

type Tab = "manual" | "ai";

const tabs: ReadonlyArray<{ readonly id: Tab; readonly label: string; readonly icon: typeof PencilLine }> = [
  { id: "manual", label: "Manual entry", icon: PencilLine },
  { id: "ai", label: "Generate with AI", icon: Sparkles },
];

function toInitialValues(draft: InnovationDraftData): CreateInnovationInitialValues {
  return {
    title: draft.title,
    summary: draft.summary,
    description: draft.description,
    category: draft.category,
    tags: draft.tags,
    websiteUrl: draft.websiteUrl || undefined,
    githubUrl: draft.githubUrl || undefined,
  };
}

export function CreateInnovationWorkspace() {
  const [tab, setTab] = useState<Tab>("manual");
  const [draft, setDraft] = useState<CreateInnovationInitialValues | undefined>(undefined);
  // Bump to remount the uncontrolled manual form so a new draft re-applies defaults.
  const [draftVersion, setDraftVersion] = useState(0);

  function handleGenerated(generated: InnovationDraftData) {
    setDraft(toInitialValues(generated));
    setDraftVersion((current) => current + 1);
    setTab("manual");
  }

  return (
    <div className="grid gap-6">
      <div
        role="tablist"
        aria-label="Innovation creation mode"
        className="glass-panel grid grid-cols-2 gap-1 rounded-card p-1"
      >
        {tabs.map((entry) => {
          const Icon = entry.icon;
          const active = tab === entry.id;

          return (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(entry.id)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-[6px] px-4 py-2.5 text-sm font-semibold transition duration-fast",
                active
                  ? "bg-accent-dim text-text-primary shadow-glow-soft"
                  : "text-text-secondary hover:bg-white/[0.05] hover:text-text-primary",
              )}
            >
              <Icon className={cn("size-4", active && entry.id === "ai" && "text-ai")} aria-hidden />
              {entry.label}
            </button>
          );
        })}
      </div>

      {tab === "manual" ? (
        <div>
          {draft ? (
            <p className="mb-5 flex items-center gap-2 rounded-card border border-ai/30 bg-ai/10 p-3 text-sm text-text-secondary">
              <Sparkles className="size-4 shrink-0 text-ai" aria-hidden />
              Pre-filled from your AI draft. Review and edit anything before registering.
            </p>
          ) : null}
          <CreateInnovationForm key={draftVersion} initialValues={draft} />
        </div>
      ) : (
        <GenerateInnovationForm onGenerated={handleGenerated} />
      )}
    </div>
  );
}
