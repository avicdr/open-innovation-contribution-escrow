"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, Wallet, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatEther, parseEther } from "viem";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import type { BountyCategory } from "@/domain/bounty/schemas";

type MilestoneOption = {
  readonly id: string;
  readonly title: string;
};

type CreateBountyModalProps = {
  readonly innovationId: string;
  readonly ownerWallet: string;
  readonly freeWei: string;
  readonly milestones: readonly MilestoneOption[];
};

type ApiResponse =
  | { readonly success: true; readonly data: { readonly id: string } }
  | { readonly success: false; readonly error: { readonly message: string } };

const categories: ReadonlyArray<{ readonly value: BountyCategory; readonly label: string }> = [
  { value: "development", label: "Development" },
  { value: "design", label: "Design" },
  { value: "research", label: "Research" },
  { value: "marketing", label: "Marketing" },
  { value: "business", label: "Business" },
  { value: "other", label: "Other" },
];

function value(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export function CreateBountyModal({ innovationId, ownerWallet, freeWei, milestones }: CreateBountyModalProps) {
  const router = useRouter();
  const notify = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const freeEth = (() => {
    try {
      return Number(formatEther(BigInt(freeWei)));
    } catch {
      return 0;
    }
  })();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const rewardAmount = Number(value(form, "rewardAmount"));
    setError(null);

    if (!Number.isFinite(rewardAmount) || rewardAmount <= 0) {
      setError("Reward must be greater than 0.");
      return;
    }

    let exceedsEscrow = false;
    try {
      exceedsEscrow = parseEther(rewardAmount.toString()) > BigInt(freeWei);
    } catch {
      exceedsEscrow = rewardAmount > freeEth;
    }

    if (exceedsEscrow) {
      setError(`Reward exceeds unallocated escrow (${freeEth} ETH available). Fund the escrow or lower the reward.`);
      return;
    }

    const deadlineRaw = value(form, "deadline");
    const milestoneId = value(form, "milestoneId");

    setSubmitting(true);

    try {
      const response = await fetch("/api/bounty/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          innovationId,
          title: value(form, "title"),
          description: value(form, "description"),
          category: value(form, "category"),
          rewardAmount,
          rewardToken: value(form, "rewardToken") || "ETH",
          createdBy: ownerWallet,
          milestoneId: milestoneId || undefined,
          deadline: deadlineRaw ? new Date(deadlineRaw).toISOString() : undefined,
        }),
      });

      const payload = (await response.json()) as ApiResponse;

      if (!payload.success) {
        throw new Error(payload.error.message);
      }

      notify.success("Bounty created. Reward reserved from the innovation escrow.");
      setOpen(false);
      router.refresh();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Bounty creation failed.";
      setError(message);
      notify.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden />
        Create Bounty
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto px-4 py-[8vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <button
              type="button"
              aria-label="Close create bounty"
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Create bounty"
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="glass-strong relative w-full max-w-xl rounded-xl"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <p className="mono text-xs uppercase tracking-wider text-innovation">new bounty</p>
                  <h2 className="mt-0.5 text-lg font-semibold">Create Innovation Bounty</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="rounded p-1 text-text-muted transition duration-fast hover:text-text-primary"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>

              <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
                <div className="glass-panel flex items-center justify-between rounded-card px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <Wallet className="size-4 text-funding" aria-hidden />
                    Unallocated escrow
                  </span>
                  <span className="mono text-funding">{freeEth} ETH</span>
                </div>

                <Field label="Title">
                  <TextInput name="title" placeholder="Build the responder alert webhook" minLength={3} maxLength={160} required />
                </Field>
                <Field label="Description" hint="What must be delivered, and what evidence proves completion.">
                  <TextArea
                    name="description"
                    className="min-h-28"
                    placeholder="Describe the task, acceptance criteria, and the evidence a contributor must submit."
                    minLength={20}
                    maxLength={8000}
                    required
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Category">
                    <SelectInput name="category" defaultValue="development">
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </SelectInput>
                  </Field>
                  <Field label="Milestone link" hint="Optional. Tie this bounty to a milestone.">
                    <SelectInput name="milestoneId" defaultValue="">
                      <option value="">No milestone</option>
                      {milestones.map((milestone) => (
                        <option key={milestone.id} value={milestone.id}>
                          {milestone.title}
                        </option>
                      ))}
                    </SelectInput>
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Reward">
                    <TextInput name="rewardAmount" inputMode="decimal" placeholder="0.25" defaultValue="0.1" required />
                  </Field>
                  <Field label="Token">
                    <TextInput name="rewardToken" defaultValue="ETH" maxLength={12} required />
                  </Field>
                  <Field label="Deadline" hint="Optional.">
                    <TextInput name="deadline" type="datetime-local" />
                  </Field>
                </div>

                {error ? (
                  <p className="rounded-card border border-risk/40 bg-risk/10 p-3 text-sm text-text-secondary">{error}</p>
                ) : null}

                <div className="flex justify-end gap-2 border-t border-border pt-4">
                  <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating…" : "Create Bounty"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
