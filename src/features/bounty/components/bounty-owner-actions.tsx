"use client";

import { ShieldCheck } from "lucide-react";
import { useSignedInWallet } from "@/features/auth/hooks/use-signed-in-wallet";
import { CreateBountyModal } from "@/features/bounty/components/create-bounty-modal";

type MilestoneOption = {
  readonly id: string;
  readonly title: string;
};

type BountyOwnerActionsProps = {
  readonly innovationId: string;
  readonly creatorWallet?: string;
  readonly freeWei: string;
  readonly milestones: readonly MilestoneOption[];
};

export function BountyOwnerActions({ innovationId, creatorWallet, freeWei, milestones }: BountyOwnerActionsProps) {
  const { walletAddress, loading } = useSignedInWallet();

  if (loading) {
    return null;
  }

  const isOwner = Boolean(creatorWallet && walletAddress && walletAddress.toLowerCase() === creatorWallet.toLowerCase());

  if (!isOwner) {
    return (
      <span className="inline-flex items-center gap-2 rounded-card border border-border bg-white/[0.03] px-3 py-2 text-xs text-text-muted">
        <ShieldCheck className="size-3.5 text-text-muted" aria-hidden />
        Connect the owner wallet to create bounties
      </span>
    );
  }

  return (
    <CreateBountyModal
      innovationId={innovationId}
      ownerWallet={creatorWallet as string}
      freeWei={freeWei}
      milestones={milestones}
    />
  );
}
