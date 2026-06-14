import { BadgeCheck, Wallet } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getSessionWallet } from "@/services/auth/auth-service";
import { listInnovationsByCreator } from "@/services/innovation/innovation-repository";

export const dynamic = "force-dynamic";

function shortHash(value: string) {
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export default async function HypercertificateIndexPage() {
  const cookieStore = await cookies();
  const walletAddress = await getSessionWallet(cookieStore.get("oice_session")?.value);

  if (!walletAddress) {
    return (
      <AppShell title="Innovation hypercertificate" eyebrow="verifiable profiles">
        <EmptyState
          icon={<Wallet className="size-6" aria-hidden />}
          title="Connect your wallet"
          description="Sign in with the wallet button in the top bar to open hypercertificates for the innovations you created, or browse other innovations to inspect theirs."
          guidance="A hypercertificate is a portable, on-chain-backed record of contributions, funding, and rewards - connect to see yours."
          action={
            <Button asChild variant="secondary">
              <Link href="/contributor/projects">Browse Innovations</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const innovations = await loadInnovations(walletAddress);

  return (
    <AppShell title="Innovation hypercertificate" eyebrow={`creator ${shortHash(walletAddress)}`}>
      <div className="grid gap-4">
        <Card className="p-5">
          <h2 className="text-xl font-semibold">Select a hypercertificate</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Each innovation has a verifiable lifecycle hypercertificate built from on-chain proofs, funding, rewards, and AI
            analysis.
          </p>
        </Card>

        {innovations.length === 0 ? (
          <EmptyState
            icon={<BadgeCheck className="size-6" aria-hidden />}
            title="No hypercertificate yet"
            description="Create an innovation and record contributions to generate its first hypercertificate."
            guidance="Hypercertificates fill in automatically as proofs are anchored, funding arrives, and rewards are distributed - there is nothing to configure."
            action={
              <Button asChild>
                <Link href="/innovation/create">Create Innovation</Link>
              </Button>
            }
          />
        ) : (
          innovations.map((innovation) => (
            <Card
              key={innovation.id}
              variant="interactive"
              className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{innovation.title}</h3>
                  <span className="mono rounded-card border border-border bg-background-secondary px-2 py-0.5 text-xs capitalize text-text-secondary">
                    {innovation.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-text-muted">{innovation.category}</p>
              </div>
              <Button asChild variant="secondary">
                <Link href={`/hypercertificate/${innovation.id}`}>Open hypercertificate</Link>
              </Button>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}

async function loadInnovations(walletAddress: string) {
  try {
    return await listInnovationsByCreator(walletAddress);
  } catch {
    return [];
  }
}
