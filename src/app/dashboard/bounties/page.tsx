import { Trophy, Wallet } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getSessionWallet } from "@/services/auth/auth-service";
import { listBountiesByOwner } from "@/services/bounty/bounty-repository";
import { BountyCard } from "@/features/bounty/components/bounty-card";
import { formatReward } from "@/features/bounty/bounty-ui";

export const dynamic = "force-dynamic";

function shortHash(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export default async function DashboardBountiesPage() {
  const cookieStore = await cookies();
  const walletAddress = await getSessionWallet(cookieStore.get("oice_session")?.value);

  if (!walletAddress) {
    return (
      <AppShell title="Bounty Dashboard" eyebrow="owner workspace">
        <EmptyState
          icon={<Wallet className="size-6" aria-hidden />}
          title="Connect your wallet"
          description="Sign in with the wallet button in the top bar to manage the bounties you have created across your innovations."
          action={
            <Button asChild variant="secondary">
              <Link href="/bounties">Browse the marketplace</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const bounties = await listBountiesByOwner(walletAddress).catch(() => []);
  const open = bounties.filter((bounty) => bounty.status === "open" || bounty.status === "in_review");
  const completed = bounties.filter((bounty) => bounty.status === "completed");
  const totalRewardCommitted = open.reduce((total, bounty) => total + bounty.rewardAmount, 0);
  const totalRewardPaid = completed.reduce((total, bounty) => total + bounty.rewardAmount, 0);
  const pendingReview = open.filter((bounty) => bounty.status === "in_review").length;

  const summary: ReadonlyArray<readonly [string, string]> = [
    ["Live bounties", String(open.length)],
    ["Awaiting review", String(pendingReview)],
    ["Reward committed", formatReward(totalRewardCommitted, "ETH")],
    ["Reward paid", formatReward(totalRewardPaid, "ETH")],
  ];

  return (
    <AppShell title="Bounty Dashboard" eyebrow={`owner ${shortHash(walletAddress)}`}>
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {summary.map(([label, value]) => (
            <div key={label} className="glass-panel rounded-card p-4">
              <p className="mono mt-1 text-xl text-innovation">{value}</p>
              <p className="mt-1 text-xs text-text-muted">{label}</p>
            </div>
          ))}
        </div>

        {bounties.length === 0 ? (
          <EmptyState
            icon={<Trophy className="size-6" aria-hidden />}
            title="You haven't created any bounties"
            description="Open a bounty from any innovation you own to reserve an escrow reward for a specific task."
            action={
              <Button asChild variant="secondary">
                <Link href="/my-projects">Go to my projects</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4">
            {open.length > 0 ? (
              <section className="grid gap-3">
                <h2 className="text-lg font-semibold">Live bounties</h2>
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {open.map((bounty) => (
                    <BountyCard
                      key={bounty.id}
                      bounty={bounty}
                      href={`/innovation/${bounty.innovationId}/bounties/${bounty.id}`}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {completed.length > 0 ? (
              <section className="grid gap-3">
                <h2 className="text-lg font-semibold">Completed</h2>
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {completed.map((bounty) => (
                    <BountyCard
                      key={bounty.id}
                      bounty={bounty}
                      href={`/innovation/${bounty.innovationId}/bounties/${bounty.id}`}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </AppShell>
  );
}
