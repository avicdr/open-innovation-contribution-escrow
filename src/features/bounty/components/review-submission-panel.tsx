"use client";

import { AlertTriangle, CheckCircle2, ExternalLink, FileText, Sparkles, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import type { BountySubmissionAnalysisData } from "@/domain/ai/schemas";
import type { BountyDto, BountySubmissionDto } from "@/services/bounty/bounty-repository";
import { useSignedInWallet } from "@/features/auth/hooks/use-signed-in-wallet";
import { SubmissionStatusBadge } from "@/features/bounty/bounty-ui";

type ReviewSubmissionPanelProps = {
  readonly bounty: BountyDto;
  readonly submissions: readonly BountySubmissionDto[];
};

type AnalysisResponse =
  | { readonly success: true; readonly data: BountySubmissionAnalysisData }
  | { readonly success: false; readonly error: { readonly message: string } };

type ReviewResponse =
  | { readonly success: true; readonly data: BountySubmissionDto }
  | { readonly success: false; readonly error: { readonly message: string } };

function shortHash(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

const duplicateTone: Record<string, string> = {
  LOW: "text-success",
  MEDIUM: "text-reputation",
  HIGH: "text-risk",
};

export function ReviewSubmissionPanel({ bounty, submissions }: ReviewSubmissionPanelProps) {
  const router = useRouter();
  const notify = useToast();
  const { walletAddress } = useSignedInWallet();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, BountySubmissionAnalysisData>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const isOwner = walletAddress?.toLowerCase() === bounty.createdBy.toLowerCase();

  async function runAnalysis(submission: BountySubmissionDto) {
    setAnalyzingId(submission.id);

    try {
      const priorSubmissions = submissions
        .filter((entry) => entry.id !== submission.id)
        .map((entry) => entry.description);

      const response = await fetch("/api/bounty/submission/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bountyTitle: bounty.title,
          bountyDescription: bounty.description,
          bountyCategory: bounty.category,
          submissionDescription: submission.description,
          evidenceLinks: submission.evidenceLinks,
          priorSubmissions,
        }),
      });

      const payload = (await response.json()) as AnalysisResponse;

      if (!payload.success) {
        throw new Error(payload.error.message);
      }

      setAnalyses((current) => ({ ...current, [submission.id]: payload.data }));
      setNotes((current) => ({ ...current, [submission.id]: current[submission.id] || payload.data.suggestedReviewNotes }));
      notify.info("Gemini review ready. Final approval is yours.");
    } catch (caught) {
      notify.error(caught instanceof Error ? caught.message : "AI review failed.");
    } finally {
      setAnalyzingId(null);
    }
  }

  async function review(submission: BountySubmissionDto, decision: "approved" | "rejected") {
    if (!walletAddress) {
      notify.error("Connect and sign in with the owner wallet to review submissions.");
      return;
    }

    setBusyId(submission.id);

    try {
      const response = await fetch("/api/bounty/submission/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submission.id,
          reviewerAddress: walletAddress,
          decision,
          reviewNotes: notes[submission.id]?.trim() || undefined,
        }),
      });

      const payload = (await response.json()) as ReviewResponse;

      if (!payload.success) {
        throw new Error(payload.error.message);
      }

      notify.success(
        decision === "approved"
          ? "Reward released successfully. Contribution recorded on the hypercertificate."
          : "Submission rejected and feedback saved.",
      );
      router.refresh();
    } catch (caught) {
      notify.error(caught instanceof Error ? caught.message : "Review failed.");
    } finally {
      setBusyId(null);
    }
  }

  if (submissions.length === 0) {
    return (
      <p className="rounded-card border border-border bg-white/[0.03] p-4 text-sm text-text-secondary">
        No submissions yet. Share the bounty with contributors to start receiving work.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {!isOwner ? (
        <p className="rounded-card border border-reputation/30 bg-reputation/10 p-3 text-sm text-text-secondary">
          Connect the owner wallet {shortHash(bounty.createdBy)} to approve, reject, or release rewards.
        </p>
      ) : null}

      {submissions.map((submission) => {
        const analysis = analyses[submission.id];
        const pending = submission.status === "pending";

        return (
          <div key={submission.id} className="glass-panel rounded-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="mono text-xs text-text-muted">{shortHash(submission.contributorWallet)}</p>
                <p className="mt-1 text-sm leading-6 text-text-secondary">{submission.description}</p>
              </div>
              <SubmissionStatusBadge status={submission.status} />
            </div>

            {submission.evidenceLinks.length > 0 || submission.ipfsHashes.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {submission.evidenceLinks.map((link) => (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="mono inline-flex items-center gap-1 rounded-card border border-border bg-white/[0.04] px-2 py-1 text-xs text-innovation hover:border-innovation/40"
                  >
                    <ExternalLink className="size-3" aria-hidden />
                    {link.replace(/^https?:\/\//, "").slice(0, 36)}
                  </a>
                ))}
                {submission.ipfsHashes.map((hash) => (
                  <a
                    key={hash}
                    href={`https://ipfs.io/ipfs/${hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mono inline-flex items-center gap-1 rounded-card border border-border bg-white/[0.04] px-2 py-1 text-xs text-ai hover:border-ai/40"
                  >
                    <FileText className="size-3" aria-hidden />
                    ipfs:{hash.slice(0, 10)}…
                  </a>
                ))}
              </div>
            ) : null}

            {submission.reviewNotes ? (
              <p className="mt-3 rounded-card border border-border bg-white/[0.03] p-2.5 text-xs leading-5 text-text-secondary">
                <span className="font-semibold text-text-primary">Owner notes:</span> {submission.reviewNotes}
              </p>
            ) : null}

            {analysis ? (
              <div className="mt-3 grid gap-2 rounded-card border border-ai/25 bg-ai/[0.06] p-3">
                <p className="mono flex items-center gap-1.5 text-xs uppercase tracking-wider text-ai">
                  <Sparkles className="size-3.5" aria-hidden />
                  Gemini assessment · advisory only
                </p>
                <p className="text-sm leading-6 text-text-secondary">{analysis.summary}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <span className="text-text-secondary">
                    Quality <span className="mono text-ai">{analysis.qualityScore}/100</span>
                  </span>
                  <span className="text-text-secondary">
                    Duplicate risk{" "}
                    <span className={`mono ${duplicateTone[analysis.duplicateRisk] ?? "text-text-secondary"}`}>
                      {analysis.duplicateRisk}
                    </span>
                  </span>
                </div>
                {analysis.concerns.length > 0 ? (
                  <p className="flex items-start gap-1.5 text-xs leading-5 text-text-muted">
                    <AlertTriangle className="mt-0.5 size-3 shrink-0 text-reputation" aria-hidden />
                    {analysis.concerns.join(" · ")}
                  </p>
                ) : null}
              </div>
            ) : null}

            {pending && isOwner ? (
              <div className="mt-3 grid gap-2 border-t border-border pt-3">
                <TextArea
                  className="min-h-16 text-sm"
                  placeholder="Review notes for the contributor (optional)"
                  value={notes[submission.id] ?? ""}
                  onChange={(event) => setNotes((current) => ({ ...current, [submission.id]: event.target.value }))}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={analyzingId === submission.id}
                    onClick={() => void runAnalysis(submission)}
                  >
                    <Sparkles className={`size-4 ${analyzingId === submission.id ? "animate-pulse" : ""}`} aria-hidden />
                    {analyzingId === submission.id ? "Analyzing…" : "AI review"}
                  </Button>
                  <Button type="button" size="sm" disabled={busyId === submission.id} onClick={() => void review(submission, "approved")}>
                    <CheckCircle2 className="size-4" aria-hidden />
                    Approve &amp; release
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={busyId === submission.id}
                    onClick={() => void review(submission, "rejected")}
                  >
                    <XCircle className="size-4" aria-hidden />
                    Reject
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
