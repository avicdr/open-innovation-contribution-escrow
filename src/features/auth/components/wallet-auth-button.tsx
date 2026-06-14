"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { publishSignedInWallet, useSignedInWallet } from "@/features/auth/hooks/use-signed-in-wallet";

type EthereumProvider = {
  request<T = unknown>(args: { method: string; params?: unknown[] }): Promise<T>;
};

type NonceResponse =
  | {
      readonly success: true;
      readonly data: {
        readonly message: string;
      };
    }
  | {
      readonly success: false;
      readonly error: {
        readonly message: string;
      };
    };

export function WalletAuthButton() {
  const { walletAddress: signedInWalletAddress, loading } = useSignedInWallet();
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "signing" | "authenticated" | "error">("idle");
  const walletAddress = connectedWalletAddress ?? signedInWalletAddress;

  const connectWallet = useCallback(async () => {
    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;

    if (!ethereum) {
      setStatus("error");
      return;
    }

    const accounts = await ethereum.request<string[]>({ method: "eth_requestAccounts" });
    setConnectedWalletAddress(accounts[0] ?? null);
  }, []);

  const authenticate = useCallback(
    async (walletAddress: string) => {
      const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;

      if (!ethereum) {
        setStatus("error");
        return;
      }

      setStatus("signing");

      const nonceResponse = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });
      const noncePayload = (await nonceResponse.json()) as NonceResponse;

      if (!noncePayload.success) {
        setStatus("error");
        return;
      }

      const signature = await ethereum.request<string>({
        method: "personal_sign",
        params: [noncePayload.data.message, walletAddress],
      });
      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, signature }),
      });

      if (verifyResponse.ok) {
        publishSignedInWallet(walletAddress.toLowerCase());
        setStatus("authenticated");
      } else {
        setStatus("error");
      }
    },
    [],
  );

  if (loading && !walletAddress) {
    return (
      <Button variant="secondary" disabled>
        Checking Session
      </Button>
    );
  }

  if (!walletAddress) {
    return (
      <Button variant="secondary" onClick={connectWallet}>
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" type="button">
        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
      </Button>
      <Button
        type="button"
        onClick={() => authenticate(walletAddress)}
        disabled={status === "signing" || status === "authenticated" || signedInWalletAddress === walletAddress.toLowerCase()}
      >
        {status === "authenticated" || signedInWalletAddress === walletAddress.toLowerCase()
          ? "Signed In"
          : status === "signing"
            ? "Signing"
            : "Sign In"}
      </Button>
    </div>
  );
}
