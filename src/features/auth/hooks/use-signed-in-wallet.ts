"use client";

import { useEffect, useState } from "react";

export const signedInWalletChangedEvent = "oice:signed-in-wallet-changed";

type SessionResponse =
  | {
      readonly success: true;
      readonly data: {
        readonly walletAddress: string | null;
      };
    }
  | {
      readonly success: false;
      readonly error: {
        readonly message: string;
      };
    };

export function publishSignedInWallet(walletAddress: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (walletAddress) {
    window.localStorage.setItem("oice_wallet_address", walletAddress);
  } else {
    window.localStorage.removeItem("oice_wallet_address");
  }

  window.dispatchEvent(new CustomEvent(signedInWalletChangedEvent, { detail: { walletAddress } }));
}

export function useSignedInWallet() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    function syncFromLocalStorage() {
      setWalletAddress(window.localStorage.getItem("oice_wallet_address"));
    }

    async function syncFromSession() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const payload = (await response.json()) as SessionResponse;

        if (!active) {
          return;
        }

        if (payload.success) {
          setWalletAddress(payload.data.walletAddress);
          if (payload.data.walletAddress) {
            window.localStorage.setItem("oice_wallet_address", payload.data.walletAddress);
          } else {
            window.localStorage.removeItem("oice_wallet_address");
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    function handleWalletChanged(event: Event) {
      const detail = (event as CustomEvent<{ walletAddress: string | null }>).detail;
      setWalletAddress(detail.walletAddress);
    }

    syncFromLocalStorage();
    void syncFromSession();
    window.addEventListener(signedInWalletChangedEvent, handleWalletChanged);
    window.addEventListener("storage", syncFromLocalStorage);

    return () => {
      active = false;
      window.removeEventListener(signedInWalletChangedEvent, handleWalletChanged);
      window.removeEventListener("storage", syncFromLocalStorage);
    };
  }, []);

  return { walletAddress, loading };
}
