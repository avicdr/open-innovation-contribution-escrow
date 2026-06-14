"use client";

import { LayoutDashboard, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type InnovationTabsProps = {
  readonly innovationId: string;
};

export function InnovationTabs({ innovationId }: InnovationTabsProps) {
  const pathname = usePathname() ?? "";
  const tabs = [
    { href: `/innovation/${innovationId}`, label: "Overview", icon: LayoutDashboard, exact: true },
    { href: `/innovation/${innovationId}/bounties`, label: "Bounties", icon: Trophy, exact: false },
  ];

  return (
    <div className="glass-panel inline-flex gap-1 rounded-card p-1">
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-[6px] px-4 py-2 text-sm font-semibold transition duration-fast",
              active ? "bg-accent-dim text-text-primary shadow-glow-soft" : "text-text-secondary hover:bg-white/[0.05] hover:text-text-primary",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
