import { Trophy } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listBounties } from "@/services/bounty/bounty-repository";
import { getInnovationById } from "@/services/innovation/innovation-repository";
import { BountyDiscovery, type DiscoveryBounty } from "@/features/bounty/components/bounty-discovery";

export const dynamic = "force-dynamic";

async function loadBounties(): Promise<readonly DiscoveryBounty[]> {
  try {
    const bounties = await listBounties({ limit: 120 });
    const titles = new Map<string, string>();

    await Promise.all(
      Array.from(new Set(bounties.map((bounty) => bounty.innovationId))).map(async (innovationId) => {
        try {
          const innovation = await getInnovationById(innovationId);
          if (innovation) {
            titles.set(innovationId, innovation.title);
          }
        } catch {
          // Ignore — the card simply omits the innovation title.
        }
      }),
    );

    return bounties.map((bounty) => ({ ...bounty, innovationTitle: titles.get(bounty.innovationId) }));
  } catch {
    return [];
  }
}

export default async function BountiesDiscoveryPage() {
  const bounties = await loadBounties();

  return (
    <AppShell title="Bounty Marketplace" eyebrow="discover open work">
      <div className="grid gap-4">
        <Card className="border-innovation/20 bg-surface-elevated/70 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-10 place-items-center rounded-card border border-innovation/30 bg-innovation/10 text-innovation">
              <Trophy className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-2xl font-bold">Earn rewards for verified innovation work.</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Browse open bounties across every innovation. Submit proof-backed work, get reviewed, and build your
                hypercertificate reputation.
              </p>
            </div>
          </div>
        </Card>

        {bounties.length === 0 ? (
          <EmptyState
            icon={<Trophy className="size-6" aria-hidden />}
            title="No open bounties right now"
            description="Bounties appear here as soon as project owners fund escrow and post reward-based tasks."
            action={
              <Button asChild variant="secondary">
                <Link href="/contributor/projects">Browse innovations</Link>
              </Button>
            }
          />
        ) : (
          <BountyDiscovery bounties={bounties} />
        )}
      </div>
    </AppShell>
  );
}
