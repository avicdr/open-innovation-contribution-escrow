import type { ReactNode } from "react";
import { CommandPalette } from "@/components/layout/command-palette";
import { MobileNav, SidebarNav } from "@/components/layout/sidebar-nav";
import { NotificationsButton } from "@/components/layout/notifications-button";
import { WalletAuthButton } from "@/features/auth/components/wallet-auth-button";

type AppShellProps = {
  readonly title: string;
  readonly eyebrow: string;
  readonly children: ReactNode;
};

export function AppShell({ title, eyebrow, children }: AppShellProps) {
  return (
    <main className="min-h-screen text-text-primary lg:pl-[72px]">
      <SidebarNav />

      <header className="sticky top-0 z-30 border-b border-border bg-background-primary/60 backdrop-blur-2xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-5 py-3 lg:px-8">
          <div className="min-w-0 flex-1">
            <p className="mono text-xs uppercase tracking-wider text-text-muted">{eyebrow}</p>
            <h1 className="mt-0.5 truncate text-2xl font-bold">{title}</h1>
          </div>
          <div className="hidden flex-1 justify-center md:flex">
            <CommandPalette />
          </div>
          <div className="flex items-center gap-2">
            <NotificationsButton />
            <WalletAuthButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-6 lg:px-8 lg:pb-10">{children}</div>

      <MobileNav />
    </main>
  );
}
