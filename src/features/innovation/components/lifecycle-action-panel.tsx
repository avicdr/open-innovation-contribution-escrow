"use client";

import { ArrowRight, Calculator, CheckCircle2, CircleDollarSign, Clock, GitPullRequestArrow, ShieldCheck, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { encodeFunctionData, formatEther, parseEther } from "viem";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, TextArea, TextInput } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { innovationEscrowAbi, innovationEscrowAddress } from "@/services/blockchain/innovation-escrow";
import type { ContributionDto } from "@/services/contribution/contribution-repository";
import type { FundingEventDto } from "@/services/funding/funding-repository";
import type { MilestoneDto, MilestoneProposalDto } from "@/services/milestone/milestone-repository";
import type { RewardDto } from "@/services/reward/reward-repository";

const proposalStatusStyle = {
  PENDING: { rail: "bg-reputation", pill: "border-reputation/30 bg-reputation/10 text-reputation", Icon: Clock, label: "Pending review" },
  APPROVED: { rail: "bg-success", pill: "border-success/30 bg-success/10 text-success", Icon: CheckCircle2, label: "Approved" },
  REJECTED: { rail: "bg-risk", pill: "border-risk/30 bg-risk/10 text-risk", Icon: XCircle, label: "Rejected" },
} as const;

function proposalStyleFor(status: string) {
  return proposalStatusStyle[status as keyof typeof proposalStatusStyle] ?? proposalStatusStyle.PENDING;
}

type EthereumProvider = {
  request<T = unknown>(args: { method: string; params?: unknown[] }): Promise<T>;
};

type LifecycleActionPanelProps = {
  readonly innovationId: string;
  readonly creatorWalletAddress?: string;
  readonly projectStatus?: string;
  readonly onChainInnovationId?: string;
  readonly contributions: readonly ContributionDto[];
  readonly fundingEvents: readonly FundingEventDto[];
  readonly milestones: readonly MilestoneDto[];
  readonly milestoneProposals: readonly MilestoneProposalDto[];
  readonly rewards: readonly RewardDto[];
};

type PanelState =
  | { readonly status: "idle" }
  | { readonly status: "submitting"; readonly message: string }
  | { readonly status: "success"; readonly message: string }
  | { readonly status: "error"; readonly message: string };

type RewardPreviewRow = {
  readonly contributionId: string;
  readonly onChainContributionId?: string;
  readonly title: string;
  readonly walletAddress: string;
  readonly score: number;
  readonly share: number;
  readonly amountWei: bigint;
};

type ApiResponse<T> =
  | {
      readonly success: true;
      readonly data: T;
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

function toBigInt(value: string) {
  try {
    return BigInt(value);
  } catch {
    return 0n;
  }
}

function formatWei(value: bigint) {
  if (value === 0n) {
    return "0 ETH";
  }

  const eth = formatEther(value);
  const [whole, fraction = ""] = eth.split(".");
  const trimmedFraction = fraction.slice(0, 4).replace(/0+$/, "");

  return trimmedFraction ? `${whole}.${trimmedFraction} ETH` : `${whole} ETH`;
}

function parseEthAmountToWei(value: string) {
  try {
    return parseEther(value || "0");
  } catch {
    return 0n;
  }
}

function shortHash(value?: string) {
  if (!value) {
    return "pending";
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function scoreForContribution(contribution: ContributionDto) {
  return Math.max(0, Math.round(contribution.impactScore ?? contribution.aiScore?.overallScore ?? 0));
}

function rewardPreview(contributions: readonly ContributionDto[], availableWei: bigint): RewardPreviewRow[] {
  const scored = contributions
    .map((contribution) => ({
      contribution,
      score: scoreForContribution(contribution),
    }))
    .filter((entry) => entry.score > 0);
  const totalScore = scored.reduce((total, entry) => total + entry.score, 0);

  if (totalScore === 0 || availableWei === 0n) {
    return scored.map(({ contribution, score }) => ({
      contributionId: contribution.id,
      onChainContributionId: contribution.onChainContributionId,
      title: contribution.title,
      walletAddress: contribution.contributorWalletAddress,
      score,
      share: 0,
      amountWei: 0n,
    }));
  }

  return scored.map(({ contribution, score }) => ({
    contributionId: contribution.id,
    onChainContributionId: contribution.onChainContributionId,
    title: contribution.title,
    walletAddress: contribution.contributorWalletAddress,
    score,
    share: score / totalScore,
    amountWei: (availableWei * BigInt(score)) / BigInt(totalScore),
  }));
}

async function requestAccounts() {
  const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;

  if (!ethereum) {
    throw new Error("No Ethereum wallet found. Install or unlock a browser wallet first.");
  }

  const accounts = await ethereum.request<string[]>({ method: "eth_requestAccounts" });
  const account = accounts[0];

  if (!account) {
    throw new Error("No wallet account selected.");
  }

  return { ethereum, account };
}

export function LifecycleActionPanel({
  innovationId,
  creatorWalletAddress,
  projectStatus,
  onChainInnovationId,
  contributions,
  fundingEvents,
  milestones,
  milestoneProposals,
  rewards,
}: LifecycleActionPanelProps) {
  const router = useRouter();
  const notify = useToast();
  const [state, setState] = useState<PanelState>({ status: "idle" });
  const [proposalFeedback, setProposalFeedback] = useState<Record<string, string>>({});
  const [rewardAmount, setRewardAmount] = useState("0");

  function markSuccess(message: string) {
    setState({ status: "success", message });
    notify.success(message);
  }

  function markError(message: string) {
    setState({ status: "error", message });
    notify.error(message);
  }
  const chainInnovationId = onChainInnovationId;
  const canAttemptOwnerReview = Boolean(creatorWalletAddress);
  const totalFundingWei = useMemo(
    () => fundingEvents.reduce((total, event) => total + toBigInt(event.amountWei), 0n),
    [fundingEvents],
  );
  const distributedWei = useMemo(() => rewards.reduce((total, reward) => total + toBigInt(reward.amountWei), 0n), [rewards]);
  const availableWei = totalFundingWei > distributedWei ? totalFundingWei - distributedWei : 0n;
  const rewardAmountWei = useMemo(() => parseEthAmountToWei(rewardAmount), [rewardAmount]);
  const previewRows = useMemo(() => rewardPreview(contributions, rewardAmountWei), [contributions, rewardAmountWei]);
  const rewardAmountInvalid = rewardAmountWei === 0n || rewardAmountWei > availableWei;
  const approvedMilestone = milestones.find((milestone) => milestone.status === "approved");
  const deleteBlockers = [
    ...(projectStatus && projectStatus !== "draft" ? [`status:${projectStatus}`] : []),
    ...(chainInnovationId ? ["on-chain registration"] : []),
    ...(contributions.length > 0 ? ["contributions"] : []),
    ...(fundingEvents.length > 0 ? ["funding"] : []),
    ...(milestones.length > 0 ? ["milestones"] : []),
    ...(milestoneProposals.length > 0 ? ["checkpoint proposals"] : []),
    ...(rewards.length > 0 ? ["rewards"] : []),
  ];
  const canAttemptDelete = Boolean(creatorWalletAddress) && deleteBlockers.length === 0;

  useEffect(() => {
    if (availableWei > 0n && rewardAmount === "0") {
      setRewardAmount(formatEther(availableWei));
    }
  }, [availableWei, rewardAmount]);

  async function depositFunds(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const ethAmount = value(formData, "ethAmount");
    setState({ status: "submitting", message: "Awaiting wallet confirmation for depositFunds()." });

    try {
      if (!chainInnovationId) {
        throw new Error("This project has not been registered on-chain yet.");
      }

      const { ethereum, account } = await requestAccounts();
      const data = encodeFunctionData({
        abi: innovationEscrowAbi,
        functionName: "depositFunds",
        args: [BigInt(chainInnovationId)],
      });

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: innovationEscrowAddress,
            value: `0x${parseEther(ethAmount).toString(16)}`,
            data,
          },
        ],
      });
      markSuccess("Deposit transaction submitted. Funding appears after FundsDeposited is indexed.");
    } catch (error) {
      markError(error instanceof Error ? error.message : "Deposit transaction failed.");
    }
  }

  async function proposeMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState({ status: "submitting", message: "Submitting milestone proposal." });

    try {
      const { account } = await requestAccounts();
      const response = await fetch("/api/milestone/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          innovationId,
          proposerAddress: account,
          title: value(formData, "title"),
          description: value(formData, "description"),
        }),
      });

      if (!response.ok) {
        throw new Error("Milestone proposal failed.");
      }

      markSuccess("Milestone proposal submitted for project owner review.");
    } catch (error) {
      markError(error instanceof Error ? error.message : "Milestone proposal failed.");
    }
  }

  async function parseApiResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
    const payload = (await response.json()) as ApiResponse<T>;

    if (!payload.success) {
      throw new Error(payload.error.message || fallbackMessage);
    }

    return payload.data;
  }

  async function reviewProposal(proposal: MilestoneProposalDto, decision: "APPROVED" | "REJECTED") {
    setState({
      status: "submitting",
      message: decision === "APPROVED" ? "Approving checkpoint and creating milestone." : "Rejecting checkpoint.",
    });

    try {
      if (!creatorWalletAddress) {
        throw new Error("This project does not have a creator wallet recorded.");
      }

      const { account } = await requestAccounts();

      if (account.toLowerCase() !== creatorWalletAddress.toLowerCase()) {
        throw new Error(`Only the project owner wallet ${shortHash(creatorWalletAddress)} can review checkpoints.`);
      }

      await parseApiResponse<MilestoneProposalDto>(
        await fetch("/api/milestone/proposal/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proposalId: proposal.id,
            reviewerAddress: account,
            decision,
            feedback: proposalFeedback[proposal.id]?.trim() || undefined,
          }),
        }),
        "Milestone proposal review failed.",
      );

      if (decision === "APPROVED") {
        await parseApiResponse<MilestoneDto>(
          await fetch("/api/milestone/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              innovationId,
              title: proposal.title,
              description: proposal.description,
              targetDate: proposal.targetDate,
              acceptedProposalId: proposal.id,
              ownerAddress: account,
            }),
          }),
          "Official milestone creation failed.",
        );
      }

      markSuccess(
        decision === "APPROVED"
          ? "Checkpoint approved and converted into an official planned milestone."
          : "Checkpoint rejected and feedback saved.",
      );
      router.refresh();
    } catch (error) {
      markError(error instanceof Error ? error.message : "Proposal review failed.");
    }
  }

  async function executeDistribution() {
    setState({ status: "submitting", message: "Awaiting wallet confirmation for distributeRewards()." });

    try {
      if (!approvedMilestone) {
        throw new Error("A validator-approved milestone is required before rewards can be released.");
      }

      if (!chainInnovationId) {
        throw new Error("This project has not been registered on-chain yet.");
      }

      const contributionIds = previewRows
        .map((row) => row.onChainContributionId)
        .filter((id): id is string => Boolean(id))
        .map((id) => BigInt(id));

      if (contributionIds.length === 0) {
        throw new Error("No on-chain contribution ids are available for distribution.");
      }

      const { ethereum, account } = await requestAccounts();

      if (creatorWalletAddress && account.toLowerCase() !== creatorWalletAddress.toLowerCase()) {
        throw new Error(`Only the project owner wallet ${shortHash(creatorWalletAddress)} can distribute rewards.`);
      }

      if (rewardAmountWei === 0n) {
        throw new Error("Enter a reward pool amount greater than 0.");
      }

      if (rewardAmountWei > availableWei) {
        throw new Error(`Reward pool exceeds available unlocked escrow (${formatWei(availableWei)}).`);
      }

      const data = encodeFunctionData({
        abi: innovationEscrowAbi,
        functionName: "distributeRewards",
        args: [BigInt(chainInnovationId), contributionIds, rewardAmountWei],
      });

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: innovationEscrowAddress,
            data,
          },
        ],
      });
      markSuccess("Distribution transaction submitted. Wallet splits update after RewardsDistributed is indexed.");
    } catch (error) {
      markError(error instanceof Error ? error.message : "Reward distribution failed.");
    }
  }

  async function deleteProject() {
    setState({ status: "submitting", message: "Verifying project owner before deletion." });

    try {
      if (!creatorWalletAddress) {
        throw new Error("This project does not have a creator wallet recorded.");
      }

      if (deleteBlockers.length > 0) {
        throw new Error(`This project is not fresh. Blockers: ${deleteBlockers.join(", ")}.`);
      }

      const confirmed = window.confirm(
        "Delete this fresh project? This removes the draft from OICE. Projects with contributions or on-chain history cannot be deleted.",
      );

      if (!confirmed) {
        setState({ status: "idle" });
        return;
      }

      const { account } = await requestAccounts();

      if (account.toLowerCase() !== creatorWalletAddress.toLowerCase()) {
        throw new Error(`Only the project owner wallet ${shortHash(creatorWalletAddress)} can delete this project.`);
      }

      await parseApiResponse<{ readonly deleted: true }>(
        await fetch(`/api/innovation/${innovationId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ownerAddress: account }),
        }),
        "Project deletion failed.",
      );

      markSuccess("Fresh project deleted.");
      router.push("/my-projects");
      router.refresh();
    } catch (error) {
      markError(error instanceof Error ? error.message : "Project deletion failed.");
    }
  }

  return (
    <div className="grid gap-4">
      {state.status === "submitting" ? (
        <p className="flex items-center gap-2 rounded-card border border-innovation/40 bg-innovation/10 p-3 text-sm text-text-secondary">
          <span className="size-2 animate-pulse rounded-full bg-innovation" aria-hidden />
          {state.message}
        </p>
      ) : null}

      <Card className="border-innovation/20 p-5">
        <p className="mono text-xs uppercase tracking-wider text-innovation">role permissions</p>
        <h2 className="mt-1 text-xl font-semibold">Protocol Roles</h2>
        <div className="mt-4 grid gap-2">
          {[
            ["Owner", "Approve checkpoints, create official milestones, execute approved releases."],
            ["Contributor", "Submit proof and propose checkpoints. Cannot release funds."],
            ["Validator", "Approve delivery and protect the reward gate."],
            ["Sponsor", "Deposit ETH and inspect escrow status."],
          ].map(([role, body]) => (
            <div key={role} className="rounded-card border border-white/10 bg-white/[0.035] p-3">
              <p className="font-semibold">{role}</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">{body}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-funding/20 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mono text-xs uppercase tracking-wider text-funding">funder panel</p>
            <h2 className="mt-1 text-xl font-semibold">{formatWei(availableWei)} Available Funding</h2>
            <p className="mono mt-2 text-xs text-text-muted">
              contract project: {chainInnovationId ? `#${chainInnovationId}` : "pending on-chain registration"}
            </p>
          </div>
          <CircleDollarSign className="size-5 text-funding" aria-hidden />
        </div>
        <form className="mt-5 grid gap-3" onSubmit={depositFunds}>
          <Field label="Sponsor Deposit Amount" hint="This sends ETH to depositFunds(); no funding row is created by the client.">
            <TextInput name="ethAmount" inputMode="decimal" placeholder="1.0" defaultValue="1.0" required />
          </Field>
          <Button type="submit" disabled={state.status === "submitting" || !innovationEscrowAddress || !chainInnovationId}>
            Deposit ETH to Escrow
          </Button>
        </form>
        <p className="mt-3 text-xs leading-5 text-text-muted">
          Indexed funding records originate from <span className="mono">FundsDeposited</span> events.
        </p>
      </Card>

      <Card className="border-contributor/20 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mono text-xs uppercase tracking-wider text-contributor">contributor flow</p>
            <h2 className="mt-1 text-xl font-semibold">Propose Checkpoint</h2>
          </div>
          <GitPullRequestArrow className="size-5 text-contributor" aria-hidden />
        </div>
        <form className="mt-5 grid gap-3" onSubmit={proposeMilestone}>
          <Field label="Proposal Title">
            <TextInput name="title" placeholder="Prototype Complete" defaultValue="Prototype Complete" required />
          </Field>
          <Field label="Delivery Evidence">
            <TextArea
              name="description"
              placeholder="Describe the verifiable work package and evidence validators should inspect."
              defaultValue="Forecast dashboard, proof anchoring, and responder validation loop are connected."
              required
            />
          </Field>
          <Button type="submit" disabled={state.status === "submitting"}>
            Submit Checkpoint
          </Button>
        </form>
        <div className="mt-5 rounded-card border border-innovation/20 bg-innovation/10 p-3">
          <p className="mono text-xs uppercase tracking-wider text-innovation">project owner review</p>
          <p className="mt-1 text-sm text-text-secondary">
            Pending checkpoints can be approved or rejected by connecting the creator wallet {shortHash(creatorWalletAddress)}.
          </p>
        </div>
        <div className="mt-4 grid gap-3">
          {milestoneProposals.slice(0, 4).map((proposal) => {
            const style = proposalStyleFor(proposal.status);
            const StatusIcon = style.Icon;

            return (
              <div key={proposal.id} className="relative overflow-hidden rounded-card border border-border bg-white/[0.03] p-4 pl-5">
                <span className={`absolute inset-y-3 left-0 w-0.5 rounded-full ${style.rail}`} aria-hidden />
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">{proposal.title}</p>
                  <span className={`mono flex shrink-0 items-center gap-1 rounded-card border px-2 py-1 text-[11px] ${style.pill}`}>
                    <StatusIcon className="size-3" aria-hidden />
                    {style.label}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-text-secondary">{proposal.description}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                  <span className="mono">proposer {shortHash(proposal.proposerAddress)}</span>
                  {proposal.reviewerAddress ? <span className="mono">reviewer {shortHash(proposal.reviewerAddress)}</span> : null}
                  {proposal.targetDate ? <span className="mono">target {proposal.targetDate}</span> : null}
                </div>
                {proposal.feedback ? (
                  <p className="mt-3 rounded-card border border-border bg-white/[0.03] p-2.5 text-xs leading-5 text-text-secondary">
                    <span className="font-semibold text-text-primary">Owner feedback:</span> {proposal.feedback}
                  </p>
                ) : null}
                {proposal.status === "PENDING" ? (
                  <div className="mt-3 grid gap-2 border-t border-border pt-3">
                    <TextInput
                      value={proposalFeedback[proposal.id] ?? ""}
                      placeholder="Owner feedback for contributor, optional"
                      onChange={(event) =>
                        setProposalFeedback((current) => ({
                          ...current,
                          [proposal.id]: event.target.value,
                        }))
                      }
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={state.status === "submitting" || !canAttemptOwnerReview}
                        onClick={() => void reviewProposal(proposal, "APPROVED")}
                      >
                        <CheckCircle2 className="size-4" aria-hidden />
                        Approve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        disabled={state.status === "submitting" || !canAttemptOwnerReview}
                        onClick={() => void reviewProposal(proposal, "REJECTED")}
                      >
                        <XCircle className="size-4" aria-hidden />
                        Reject
                      </Button>
                    </div>
                    <p className="text-xs text-text-muted">Review verifies the connected wallet against the project owner.</p>
                  </div>
                ) : null}
              </div>
            );
          })}
          {milestoneProposals.length === 0 ? (
            <p className="rounded-card border border-border bg-white/[0.03] p-3 text-sm text-text-secondary">
              No contributor milestone proposals yet.
            </p>
          ) : null}
        </div>
      </Card>

      <Card className="border-ai/20 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mono text-xs uppercase tracking-wider text-ai">automatic reward engine</p>
            <h2 className="mt-1 text-xl font-semibold">Distribution Preview</h2>
          </div>
          <Calculator className="size-5 text-ai" aria-hidden />
        </div>
        <div className="mt-5">
          <Field
            label="Reward Pool Amount"
            hint={`Project owner chooses how much unlocked escrow to distribute now. Available: ${formatWei(availableWei)}.`}
          >
            <TextInput
              value={rewardAmount}
              inputMode="decimal"
              placeholder="0.5"
              onChange={(event) => setRewardAmount(event.target.value)}
            />
          </Field>
        </div>
        <div className="mt-5 grid gap-3">
          {previewRows.length > 0 ? (
            previewRows.map((row) => (
              <div key={row.contributionId} className="rounded-card border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{row.title}</p>
                    <p className="mono mt-1 text-xs text-text-muted">{shortHash(row.walletAddress)}</p>
                  </div>
                  <p className="mono text-sm text-ai">{formatWei(row.amountWei)}</p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <span className="rounded-card bg-white/[0.04] p-2 text-text-secondary">Score {row.score}</span>
                  <span className="rounded-card bg-white/[0.04] p-2 text-text-secondary">
                    Share {(row.share * 100).toFixed(1)}%
                  </span>
                  <span className="rounded-card bg-white/[0.04] p-2 text-text-secondary">
                    Contribution ID {row.onChainContributionId ?? "missing"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-card border border-white/10 bg-white/[0.035] p-4 text-sm text-text-secondary">
              Add scored contributions and escrow funding to generate a reward preview.
            </p>
          )}
        </div>
        <Button
          className="mt-4 w-full"
          type="button"
          disabled={state.status === "submitting" || rewardAmountInvalid}
          onClick={executeDistribution}
        >
          Execute Distribution
          <ArrowRight className="size-4" aria-hidden />
        </Button>
        <p className="mt-3 flex gap-2 text-xs leading-5 text-text-muted">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
          The owner chooses the reward pool. The contract recalculates each recipient&apos;s share from contribution scores.
        </p>
      </Card>

      <Card className="border-risk/25 p-5">
        <p className="mono text-xs uppercase tracking-wider text-risk">owner danger zone</p>
        <h2 className="mt-1 text-xl font-semibold">Delete Fresh Project</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Project owners can delete only untouched draft projects. Once contributors, checkpoints, funding, rewards, or
          on-chain registration exist, OICE preserves the project history.
        </p>
        {deleteBlockers.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {deleteBlockers.map((blocker) => (
              <span key={blocker} className="rounded-card border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-text-muted">
                {blocker}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-card border border-risk/30 bg-risk/10 p-3 text-sm text-text-secondary">
            This project appears fresh. Connect the creator wallet {shortHash(creatorWalletAddress)} to delete it.
          </p>
        )}
        <Button
          className="mt-4 w-full"
          type="button"
          variant="danger"
          disabled={state.status === "submitting" || !canAttemptDelete}
          onClick={() => void deleteProject()}
        >
          Delete Project
        </Button>
      </Card>
    </div>
  );
}
