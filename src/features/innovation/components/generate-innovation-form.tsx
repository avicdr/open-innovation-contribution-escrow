"use client";

import { Github, Loader2, Sparkles, Wand2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextArea, TextInput } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import type { InnovationDraftData } from "@/domain/ai/schemas";

type GenerateInnovationFormProps = {
  /** Called with the AI-generated draft so the parent can pre-fill the manual form. */
  readonly onGenerated: (draft: InnovationDraftData) => void;
};

type GenerateState =
  | { readonly status: "idle" }
  | { readonly status: "generating" }
  | { readonly status: "error"; readonly message: string };

type ApiResponse =
  | {
      readonly success: true;
      readonly data: InnovationDraftData;
    }
  | {
      readonly success: false;
      readonly error: {
        readonly message: string;
      };
    };

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function GenerateInnovationForm({ onGenerated }: GenerateInnovationFormProps) {
  const notify = useToast();
  const [state, setState] = useState<GenerateState>({ status: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState({ status: "generating" });

    try {
      const response = await fetch("/api/innovation/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubUrl: value(formData, "githubUrl") || undefined,
          prompt: value(formData, "prompt"),
        }),
      });

      const payload = (await response.json()) as ApiResponse;

      if (!payload.success) {
        throw new Error(payload.error.message);
      }

      setState({ status: "idle" });
      notify.success("Draft generated. Review the details and register when ready.");
      onGenerated(payload.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Draft generation failed.";
      setState({ status: "error", message });
      notify.error(message);
    }
  }

  const generating = state.status === "generating";

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="glass-panel flex items-start gap-3 rounded-card p-4">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-card border border-ai/30 bg-ai/10 text-ai">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-text-primary">Generate with Gemini</p>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Drop a GitHub repository and describe the project. Gemini reads the repo and your prompt, then drafts
            the title, summary, description, category, and tags. You can review and edit everything before registering.
          </p>
        </div>
      </div>

      <Field label="GitHub URL" hint="Optional, but a public repo gives Gemini real context to work from.">
        <div className="relative">
          <Github className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden />
          <TextInput
            name="githubUrl"
            type="url"
            className="pl-9"
            placeholder="https://github.com/org/project"
          />
        </div>
      </Field>

      <Field
        label="Project prompt"
        hint="Describe the problem, who it's for, and what you're building. The more detail, the better the draft."
      >
        <TextArea
          name="prompt"
          className="min-h-40"
          placeholder="A decentralized network that crowdsources flood-risk sensor data and uses AI to forecast flash floods for at-risk communities, with on-chain proofs so responders can trust the alerts."
          minLength={10}
          maxLength={4000}
          required
        />
      </Field>

      {generating ? (
        <div
          role="status"
          aria-live="polite"
          className="glass-panel flex items-center gap-3 rounded-card border border-ai/30 bg-ai/10 p-4"
        >
          <Loader2 className="size-5 shrink-0 animate-spin text-ai" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-text-primary">Gemini is drafting…</p>
            <p className="mt-0.5 text-sm leading-6 text-text-secondary">
              Reading the repository and your prompt to draft the title, summary, description, category, and tags. This
              can take a few moments.
            </p>
          </div>
        </div>
      ) : null}

      {state.status === "error" ? (
        <p className="rounded-card border border-risk/40 bg-risk/10 p-3 text-sm text-text-secondary">{state.message}</p>
      ) : null}

      <div className="flex justify-end border-t border-border pt-5">
        <Button type="submit" disabled={generating}>
          <Wand2 className={`size-4 ${generating ? "animate-pulse" : ""}`} aria-hidden />
          {generating ? "Gemini is drafting…" : "Generate Draft"}
        </Button>
      </div>
    </form>
  );
}
