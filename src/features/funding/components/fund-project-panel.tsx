"use client";

import { CircleDollarSign, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { encodeFunctionData, formatEther, parseEther } from "viem";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, TextInput } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { demoFundingEnabled, innovationEscrowAbi, innovationEscrowAddress } from "@/services/blockchain/innovation-escrow";
import type { FundingEventDto } from "@/services/funding/funding-repository";

type EthereumProvider = {
  request<T = unknown>(args: { method: string; params?: unknown[] }): Promise<T>;
};

type FundProjectPanelProps = {
  readonly onChainInnovationId?: string;
  /** Funding currently available in escrow, as raw wei (so demo deposits can be added client-side). */
  readonly availableFundingWei: string;
  readonly fundingEvents: readonly FundingEventDto[];
};

type FunderRow = {
  readonly key: string;
  readonly label: string;
  readonly amountWei: string;
  readonly createdAt: string;
};

const presets = ["0.1", "0.5", "1.0"];

function shortHash(value?: string) {
  return value ? `${value.slice(0, 6)}…${value.slice(-4)}` : "—";
}

function toBigInt(value: string) {
  try {
    return BigInt(value);
  } catch {
    return 0n;
  }
}

function formatWei(wei: bigint) {
  if (wei === 0n) {
    return "0 ETH";
  }

  const [whole, fraction = ""] = formatEther(wei).split(".");
  const trimmed = fraction.slice(0, 3).replace(/0+$/, "");

  return trimmed ? `${whole}.${trimmed} ETH` : `${whole} ETH`;
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

export function FundProjectPanel({ onChainInnovationId, availableFundingWei, fundingEvents }: FundProjectPanelProps) {
  const router = useRouter();
  const notify = useToast();
  const [amount, setAmount] = useState("0.5");
  const [submitting, setSubmitting] = useState(false);
  // Optimistic, client-only deposits shown while in demo mode.
  const [demoEvents, setDemoEvents] = useState<ReadonlyArray<{ id: string; amountWei: string; createdAt: string }>>([]);

  const rows = useMemo<FunderRow[]>(() => {
    const realRows: FunderRow[] = fundingEvents.map((event) => ({
      key: event.id ?? event.txHash,
      label: shortHash(event.sponsorAddress),
      amountWei: event.amountWei,
      createdAt: event.createdAt,
    }));
    const demoRows: FunderRow[] = demoEvents.map((event) => ({
      key: event.id,
      label: "you · demo",
      amountWei: event.amountWei,
      createdAt: event.createdAt,
    }));

    return [...demoRows, ...realRows].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [demoEvents, fundingEvents]);

  const demoTotalWei = demoEvents.reduce((total, event) => total + toBigInt(event.amountWei), 0n);
  const totalRaised = formatWei(rows.reduce((total, row) => total + toBigInt(row.amountWei), 0n));
  const availableDisplay = formatWei(toBigInt(availableFundingWei) + demoTotalWei);
  const sponsorCount = new Set(fundingEvents.map((event) => event.sponsorAddress.toLowerCase())).size + (demoEvents.length ? 1 : 0);
  const recent = rows.slice(0, 4);

  const registered = Boolean(onChainInnovationId);
  const escrowConfigured = Boolean(innovationEscrowAddress);
  const disabledReason = demoFundingEnabled
    ? null
    : !escrowConfigured
      ? "On-chain funding is disabled in this environment — the escrow contract address (NEXT_PUBLIC_INNOVATION_ESCROW_ADDRESS) is not configured."
      : !registered
        ? "This project has not been registered on-chain yet. Funding opens once the owner registers it with the escrow contract."
        : null;

  async function fund(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const parsed = parseEther(amount || "0");

      if (parsed <= 0n) {
        throw new Error("Enter an amount greater than 0.");
      }

      if (demoFundingEnabled) {
        setDemoEvents((previous) => [
          { id: `demo-${previous.length}-${parsed.toString()}`, amountWei: parsed.toString(), createdAt: new Date().toISOString() },
          ...previous,
        ]);
        notify.success(`Simulated deposit of ${amount} ETH recorded (demo mode — no on-chain transaction).`);
        return;
      }

      if (!registered) {
        throw new Error("This project has not been registered on-chain yet, so it cannot accept escrow funding.");
      }

      if (!innovationEscrowAddress) {
        throw new Error("Escrow contract address is not configured.");
      }

      const { ethereum, account } = await requestAccounts();
      const data = encodeFunctionData({
        abi: innovationEscrowAbi,
        functionName: "depositFunds",
        args: [BigInt(onChainInnovationId as string)],
      });

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: innovationEscrowAddress,
            value: `0x${parsed.toString(16)}`,
            data,
          },
        ],
      });

      notify.success(`Deposit of ${amount} ETH submitted. Funding appears once FundsDeposited is indexed.`);
      router.refresh();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Deposit transaction failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card variant="glow" className="border-funding/25 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mono flex items-center gap-1.5 text-xs uppercase tracking-wider text-funding">
            <CircleDollarSign className="size-3.5" aria-hidden />
            Funder panel
            {demoFundingEnabled ? <span className="rounded border border-funding/30 px-1.5 py-0.5 text-[10px] text-funding">demo</span> : null}
          </p>
          <h2 className="mt-1 text-h3">Fund this project</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Deposit ETH into the on-chain escrow. After approval, the owner chooses how much unlocked escrow to release by contribution score.
          </p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-card border border-funding/30 bg-funding/10 text-funding">
          <Wallet className="size-5" aria-hidden />
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-card border border-border bg-surface/50 p-3">
          <p className="text-xs text-text-muted">Available</p>
          <p className="mono mt-1 text-sm text-funding">{availableDisplay}</p>
        </div>
        <div className="rounded-card border border-border bg-surface/50 p-3">
          <p className="text-xs text-text-muted">Total raised</p>
          <p className="mono mt-1 text-sm text-text-primary">{totalRaised}</p>
        </div>
        <div className="rounded-card border border-border bg-surface/50 p-3">
          <p className="text-xs text-text-muted">Sponsors</p>
          <p className="mono mt-1 text-sm text-text-primary">{sponsorCount}</p>
        </div>
      </div>

      {disabledReason ? (
        <p className="mt-4 rounded-card border border-reputation/30 bg-reputation/10 p-3 text-sm text-text-secondary">
          {disabledReason}
        </p>
      ) : null}

      <form className="mt-4 grid gap-3" onSubmit={fund}>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              className={`mono rounded-card border px-3 py-1 text-xs transition duration-fast ${
                amount === preset
                  ? "border-funding/50 bg-funding/10 text-funding"
                  : "border-border text-text-secondary hover:border-funding/40"
              }`}
            >
              {preset} ETH
            </button>
          ))}
        </div>
        <Field label="Amount" hint="Sends ETH to depositFunds(); the funding record is created when the contract event is indexed.">
          <TextInput
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.5"
            pattern="^[0-9]*\.?[0-9]*$"
            required
          />
        </Field>
        <Button type="submit" disabled={submitting || Boolean(disabledReason)}>
          <CircleDollarSign className="size-4" aria-hidden />
          {submitting ? "Confirm in wallet…" : disabledReason ? "Funding unavailable" : `Fund ${amount || "0"} ETH`}
        </Button>
      </form>

      <div className="mt-5">
        <p className="text-sm font-semibold text-text-secondary">Recent funders</p>
        <div className="mt-3 grid gap-2">
          {recent.length ? (
            recent.map((row) => (
              <div key={row.key} className="flex items-center justify-between rounded-card border border-border bg-surface/50 px-3 py-2">
                <span className="mono text-xs text-text-muted">{row.label}</span>
                <span className="mono text-sm text-funding">{formatWei(toBigInt(row.amountWei))}</span>
              </div>
            ))
          ) : (
            <p className="rounded-card border border-border bg-surface/50 px-3 py-2 text-sm text-text-muted">
              No funding yet — be the first sponsor.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
