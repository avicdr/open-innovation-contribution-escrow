"use client";

import { Send, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextArea, TextInput } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { useSignedInWallet } from "@/features/auth/hooks/use-signed-in-wallet";

type SubmitBountyWorkFormProps = {
  readonly bountyId: string;
  readonly bountyTitle: string;
  readonly disabled?: boolean;
};

type SubmissionResponse =
  | { readonly success: true; readonly data: { readonly id: string } }
  | { readonly success: false; readonly error: { readonly message: string } };

type StorageResponse =
  | { readonly success: true; readonly data: { readonly cid: string } }
  | { readonly success: false; readonly error: { readonly message: string } };

function parseLinks(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Best-effort pin of an evidence package to IPFS via the existing Pinata route. */
async function pinEvidence(bountyTitle: string, description: string, links: readonly string[]): Promise<string | null> {
  try {
    const response = await fetch("/api/storage/metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "contribution",
        name: `bounty-evidence-${Date.now().toString(16)}`,
        metadata: { bountyTitle, description, links, kind: "bounty-submission-evidence" },
      }),
    });

    const payload = (await response.json()) as StorageResponse;
    return payload.success ? payload.data.cid : null;
  } catch {
    return null;
  }
}

export function SubmitBountyWorkForm({ bountyId, bountyTitle, disabled = false }: SubmitBountyWorkFormProps) {
  const router = useRouter();
  const notify = useToast();
  const { walletAddress, loading } = useSignedInWallet();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const description = String(form.get("description") ?? "").trim();
    const links = parseLinks(String(form.get("evidenceLinks") ?? ""));
    const contributorWallet = walletAddress ?? String(form.get("contributorWallet") ?? "").trim();
    setError(null);

    if (!contributorWallet) {
      setError("Connect and sign in with your wallet to submit work.");
      return;
    }

    setSubmitting(true);

    try {
      const cid = await pinEvidence(bountyTitle, description, links);

      const response = await fetch(`/api/bounty/${bountyId}/submission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contributorWallet,
          description,
          evidenceLinks: links,
          ipfsHashes: cid ? [cid] : [],
        }),
      });

      const payload = (await response.json()) as SubmissionResponse;

      if (!payload.success) {
        throw new Error(payload.error.message);
      }

      notify.success(
        cid
          ? "Submission received. Evidence pinned to IPFS and sent for owner review."
          : "Submission received and sent for owner review.",
      );
      event.currentTarget.reset();
      router.refresh();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Submission failed.";
      setError(message);
      notify.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (disabled) {
    return (
      <p className="rounded-card border border-border bg-white/[0.03] p-4 text-sm text-text-secondary">
        This bounty is closed and is no longer accepting submissions.
      </p>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <Field
        label="Contributor wallet"
        hint={walletAddress ? "Filled from your signed-in wallet." : "Sign in from the header to fill this automatically."}
      >
        <TextInput
          name="contributorWallet"
          className="mono"
          placeholder={loading ? "Checking signed-in wallet..." : "0x..."}
          defaultValue={walletAddress ?? ""}
          readOnly={Boolean(walletAddress)}
          pattern="^0x[a-fA-F0-9]{40}$"
        />
      </Field>
      <Field label="What did you deliver?" hint="Summarize the work and how it meets the bounty requirements.">
        <TextArea
          name="description"
          className="min-h-32"
          placeholder="Describe your contribution, the approach, and what the evidence demonstrates."
          minLength={20}
          maxLength={8000}
          required
        />
      </Field>
      <Field label="Evidence links" hint="One per line — PRs, demos, docs, designs. Pinned to IPFS on submit.">
        <TextArea
          name="evidenceLinks"
          className="min-h-20"
          placeholder={"https://github.com/org/repo/pull/42\nhttps://demo.example.org"}
        />
      </Field>

      {error ? (
        <p className="rounded-card border border-risk/40 bg-risk/10 p-3 text-sm text-text-secondary">{error}</p>
      ) : null}

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="flex items-center gap-2 text-xs text-text-muted">
          <Upload className="size-3.5" aria-hidden />
          Evidence is pinned to IPFS via Pinata
        </span>
        <Button type="submit" disabled={submitting}>
          <Send className="size-4" aria-hidden />
          {submitting ? "Submitting…" : "Submit Contribution"}
        </Button>
      </div>
    </form>
  );
}
