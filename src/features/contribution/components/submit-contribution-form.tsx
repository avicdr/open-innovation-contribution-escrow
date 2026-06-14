"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";

type SubmitContributionFormProps = {
  readonly innovationId: string;
};

type FormState =
  | { readonly status: "idle" }
  | { readonly status: "submitting" }
  | { readonly status: "success"; readonly id: string }
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

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function hex64(seed: string) {
  const encoded = Array.from(seed)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");

  return `0x${encoded.padEnd(64, "0").slice(0, 64)}`;
}

export function SubmitContributionForm({ innovationId }: SubmitContributionFormProps) {
  const [state, setState] = useState<FormState>({ status: "idle" });
  const notify = useToast();
  const defaults = useMemo(() => {
    const suffix = Date.now().toString(16).slice(-8);

    return {
      proofHash: hex64(`proof-${innovationId}-${suffix}`),
      txHash: hex64(`tx-${innovationId}-${suffix}`),
      onChainContributionId: suffix,
      onChainProofId: `${Number.parseInt(suffix.slice(-4), 16)}`,
    };
  }, [innovationId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState({ status: "submitting" });

    const response = await fetch("/api/contribution/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        innovationId,
        contributorWalletAddress: value(formData, "contributorWalletAddress"),
        title: value(formData, "title"),
        description: value(formData, "description"),
        type: value(formData, "type"),
        proofUri: value(formData, "proofUri"),
        proofHash: value(formData, "proofHash"),
        chainId: Number(value(formData, "chainId")),
        txHash: value(formData, "txHash"),
        onChainContributionId: value(formData, "onChainContributionId"),
        onChainProofId: value(formData, "onChainProofId"),
      }),
    });

    const payload = (await response.json()) as ApiResponse;

    if (!payload.success) {
      setState({ status: "error", message: payload.error.message });
      notify.error(payload.error.message);
      return;
    }

    setState({ status: "success", id: payload.data.id });
    notify.success("Contribution submitted. Gemini will score it shortly.");
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Contributor Wallet">
          <TextInput
            name="contributorWalletAddress"
            className="mono"
            placeholder="0x1111...1111"
            defaultValue="0x1111111111111111111111111111111111111111"
            pattern="^0x[a-fA-F0-9]{40}$"
            required
          />
        </Field>
        <Field label="Contribution Type">
          <SelectInput
            name="type"
            defaultValue="engineering"
          >
            {["engineering", "research", "design", "marketing", "community", "partnerships", "documentation", "testing", "other"].map(
              (type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ),
            )}
          </SelectInput>
        </Field>
      </div>
      <Field label="Contribution Title">
        <TextInput
          name="title"
          placeholder="Prototype dashboard refinement"
          defaultValue="Prototype dashboard refinement"
          required
        />
      </Field>
      <Field label="Description" hint="Summarize what changed, why it matters, and what proof supports it.">
        <TextArea
          name="description"
          placeholder="Improved the project dashboard and added field-ready data review states."
          defaultValue="Improved the project dashboard and added field-ready data review states."
          required
        />
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Proof URI">
          <TextInput
            name="proofUri"
            className="mono"
            placeholder="ipfs://bafy..."
            defaultValue="ipfs://bafy-demo-proof"
            required
          />
        </Field>
        <Field label="Chain ID">
          <TextInput
            name="chainId"
            className="mono"
            placeholder="84532"
            defaultValue="84532"
            required
          />
        </Field>
      </div>
      <details className="rounded-card border border-white/10 bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <summary className="cursor-pointer text-sm font-semibold text-text-secondary">On-chain proof fields</summary>
        <div className="mt-3 grid gap-3">
          <Field label="Proof Hash">
            <TextInput name="proofHash" className="mono text-xs" placeholder="0x64-byte-proof-hash" defaultValue={defaults.proofHash} required />
          </Field>
          <Field label="Anchor Transaction Hash">
            <TextInput name="txHash" className="mono text-xs" placeholder="0x64-byte-transaction-hash" defaultValue={defaults.txHash} required />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="On-chain Contribution ID">
              <TextInput name="onChainContributionId" className="mono text-xs" placeholder="1" defaultValue={defaults.onChainContributionId} required />
            </Field>
            <Field label="On-chain Proof ID">
              <TextInput name="onChainProofId" className="mono text-xs" placeholder="1" defaultValue={defaults.onChainProofId} required />
            </Field>
          </div>
        </div>
      </details>
      {state.status === "success" ? (
        <p className="mono rounded-card border border-success/40 bg-success/10 p-3 text-sm text-success">
          contribution:{state.id}
        </p>
      ) : null}
      {state.status === "error" ? (
        <p className="rounded-card border border-risk/40 bg-risk/10 p-3 text-sm text-text-secondary">{state.message}</p>
      ) : null}
      <Button type="submit" disabled={state.status === "submitting"}>
        {state.status === "submitting" ? "Submitting" : "Submit Contribution"}
      </Button>
    </form>
  );
}
