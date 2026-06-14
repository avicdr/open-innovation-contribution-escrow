"use client";

import { Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useSignedInWallet } from "@/features/auth/hooks/use-signed-in-wallet";

type CancelBountyButtonProps = {
  readonly bountyId: string;
  readonly creatorWallet: string;
};

type CancelResponse =
  | { readonly success: true }
  | { readonly success: false; readonly error: { readonly message: string } };

export function CancelBountyButton({ bountyId, creatorWallet }: CancelBountyButtonProps) {
  const router = useRouter();
  const notify = useToast();
  const { walletAddress } = useSignedInWallet();
  const [busy, setBusy] = useState(false);

  const isOwner = walletAddress?.toLowerCase() === creatorWallet.toLowerCase();

  if (!isOwner) {
    return null;
  }

  async function cancel() {
    if (!window.confirm("Cancel this bounty and unlock its reserved escrow?")) {
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(`/api/bounty/${bountyId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerAddress: walletAddress }),
      });

      const payload = (await response.json()) as CancelResponse;

      if (!payload.success) {
        throw new Error(payload.error.message);
      }

      notify.success("Bounty cancelled. Reserved escrow released back to the pool.");
      router.refresh();
    } catch (caught) {
      notify.error(caught instanceof Error ? caught.message : "Could not cancel the bounty.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button type="button" variant="danger" size="sm" disabled={busy} onClick={() => void cancel()}>
      <Ban className="size-4" aria-hidden />
      {busy ? "Cancelling…" : "Cancel bounty"}
    </Button>
  );
}
