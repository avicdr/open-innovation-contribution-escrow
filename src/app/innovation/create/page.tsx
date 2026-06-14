import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { CreateInnovationWorkspace } from "@/features/innovation/components/create-innovation-workspace";

export default function CreateInnovationPage() {
  return (
    <AppShell title="Create Innovation" eyebrow="registration">
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <CreateInnovationWorkspace />
        </Card>
        <div className="grid h-fit gap-4">
          <Card variant="glow" className="border-ai/25 p-5">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-card border border-ai/30 bg-ai/10 text-ai">
                <Sparkles className="size-4" aria-hidden />
              </span>
              <h2 className="text-lg font-semibold">Start with AI</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Switch to the <span className="font-semibold text-text-primary">Generate with AI</span> tab, paste a
              GitHub repo and a short prompt, and Gemini drafts the full registration for you to review and edit.
            </p>
          </Card>
          <Card className="p-5">
            <h2 className="text-xl font-semibold">Creation Flow</h2>
            <div className="mt-5 grid gap-3">
              {[
                ["1", "Store metadata in MongoDB"],
                ["2", "Prepare IPFS metadata hash"],
                ["3", "Register innovation on-chain"],
                ["4", "Open mission control"],
              ].map(([number, label]) => (
                <div key={number} className="grid grid-cols-[36px_1fr] gap-3 rounded-card border border-border bg-background-secondary p-3">
                  <span className="mono text-innovation">{number}</span>
                  <span className="text-sm text-text-secondary">{label}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-xl font-semibold">Contributor Graph Starts Here</h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              New innovations become discoverable to contributors, funders, validators, and the AI copilot
              immediately after creation.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
