"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextArea, TextInput } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { useSignedInWallet } from "@/features/auth/hooks/use-signed-in-wallet";

type SubmissionState =
  | { readonly status: "idle" }
  | { readonly status: "submitting" }
  | { readonly status: "processing"; readonly innovationId: string; readonly message: string }
  | { readonly status: "success"; readonly innovationId: string; readonly message: string }
  | { readonly status: "error"; readonly message: string };

type ApiResponse =
  | {
      readonly success: true;
      readonly data: {
        readonly id: string;
      };
    }
  | {
      readonly success: false;
      readonly error: {
        readonly message: string;
      };
    };

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export type CreateInnovationInitialValues = {
  readonly title?: string;
  readonly summary?: string;
  readonly description?: string;
  readonly category?: string;
  readonly tags?: readonly string[];
  readonly websiteUrl?: string;
  readonly githubUrl?: string;
};

type CreateInnovationFormProps = {
  /** Pre-fills the uncontrolled fields, e.g. from an AI-generated draft. */
  readonly initialValues?: CreateInnovationInitialValues;
};

export function CreateInnovationForm({ initialValues }: CreateInnovationFormProps = {}) {
  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle" });
  const notify = useToast();
  const { walletAddress, loading } = useSignedInWallet();
  const [creatorWallet, setCreatorWallet] = useState("");

  // Keep the controlled field empty until the signed-in wallet resolves, then auto-fill it.
  useEffect(() => {
    if (walletAddress) {
      setCreatorWallet(walletAddress);
    }
  }, [walletAddress]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmission({ status: "submitting" });

    const response = await fetch("/api/innovation/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: formValue(formData, "title"),
        summary: formValue(formData, "summary"),
        description: formValue(formData, "description"),
        category: formValue(formData, "category"),
        creatorWalletAddress: formValue(formData, "creatorWalletAddress"),
        tags: formValue(formData, "tags")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        websiteUrl: formValue(formData, "websiteUrl") || undefined,
        githubUrl: formValue(formData, "githubUrl") || undefined,
      }),
    });

    const payload = (await response.json()) as ApiResponse;

    if (!payload.success) {
      setSubmission({ status: "error", message: payload.error.message });
      notify.error(payload.error.message);
      return;
    }

    setSubmission({
      status: "processing",
      innovationId: payload.data.id,
      message: "Project registered. Gemini is generating roles, milestones, risks, and readiness.",
    });
    notify.success("Project registered. Generating the AI copilot plan…");

    try {
      const copilotResponse = await fetch(`/api/innovation/${payload.data.id}/copilot`, {
        method: "POST",
      });

      if (!copilotResponse.ok) {
        throw new Error("Gemini copilot generation failed.");
      }

      setSubmission({
        status: "success",
        innovationId: payload.data.id,
        message: "Gemini copilot plan generated and attached to this innovation.",
      });
      notify.success("Gemini copilot plan generated and attached to this innovation.");
    } catch (error) {
      const message =
        error instanceof Error
          ? `${error.message} You can still open mission control and retry analysis later.`
          : "Project registered. You can open mission control while AI analysis is retried later.";
      setSubmission({
        status: "success",
        innovationId: payload.data.id,
        message,
      });
      notify.info(message);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <Field label="Title">
        <TextInput
          name="title"
          placeholder="AI Flood Prediction Network"
          defaultValue={initialValues?.title}
          minLength={3}
          maxLength={140}
          required
        />
      </Field>
      <Field label="Summary">
        <TextInput
          name="summary"
          placeholder="An open network for verifiable flood-risk forecasting."
          defaultValue={initialValues?.summary}
          minLength={12}
          maxLength={280}
          required
        />
      </Field>
      <Field label="Description">
        <TextArea
          name="description"
          className="min-h-40"
          placeholder="Describe the problem, the proposed innovation, required contributors, and what proof will be anchored on-chain."
          defaultValue={initialValues?.description}
          minLength={40}
          maxLength={8000}
          required
        />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Category">
          <TextInput
            name="category"
            placeholder="Climate Infrastructure"
            defaultValue={initialValues?.category}
            required
          />
        </Field>
        <Field
          label="Creator Wallet"
          hint={walletAddress ? "Filled from your signed-in wallet." : "Sign in from the header to fill this automatically."}
        >
          <TextInput
            name="creatorWalletAddress"
            className="mono"
            placeholder={loading ? "Checking signed-in wallet..." : "Connect and sign in to auto-fill"}
            readOnly={Boolean(walletAddress)}
            value={creatorWallet}
            onChange={(event) => setCreatorWallet(event.target.value)}
            pattern="^0x[a-fA-F0-9]{40}$"
            required
          />
        </Field>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Tags">
          <TextInput
            name="tags"
            placeholder="climate, ai, resilience"
            defaultValue={initialValues?.tags?.join(", ")}
          />
        </Field>
        <Field label="Website" hint="Optional. Leave blank if the project does not have a site yet.">
          <TextInput
            name="websiteUrl"
            type="url"
            placeholder="https://example.org (optional)"
            defaultValue={initialValues?.websiteUrl}
          />
        </Field>
        <Field label="GitHub">
          <TextInput
            name="githubUrl"
            type="url"
            placeholder="https://github.com/org/project"
            defaultValue={initialValues?.githubUrl}
          />
        </Field>
      </div>
      {submission.status === "error" ? (
        <p className="rounded-card border border-risk/40 bg-risk/10 p-3 text-sm text-text-secondary">
          {submission.message}
        </p>
      ) : null}
      {submission.status === "processing" || submission.status === "success" ? (
        <div
          className={`rounded-card border p-4 ${
            submission.status === "processing"
              ? "border-ai/40 bg-ai/10"
              : "border-success/40 bg-success/10"
          }`}
        >
          <p className="mono text-sm text-success">innovation:{submission.innovationId}</p>
          <p className="mt-2 text-sm text-text-secondary">{submission.message}</p>
          {submission.status === "processing" ? (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-innovation via-ai to-contributor" />
            </div>
          ) : null}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button asChild size="sm">
              <Link href={`/innovation/${submission.innovationId}`}>Open Mission Control</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/contributor/projects">View Contributor Marketplace</Link>
            </Button>
          </div>
        </div>
      ) : null}
      <div className="flex justify-end border-t border-border pt-5">
        <Button type="submit" disabled={submission.status === "submitting" || submission.status === "processing"}>
          {submission.status === "submitting"
            ? "Registering"
            : submission.status === "processing"
              ? "Gemini Processing"
              : "Prepare Registration"}
        </Button>
      </div>
    </form>
  );
}
