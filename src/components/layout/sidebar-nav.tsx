"use client";

import { Fingerprint, GitBranch, HeartHandshake, Home, LayoutGrid, Plus, Trophy, Workflow } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils/cn";

type NavItem = {
  readonly href: string;
  readonly label: string;
  readonly icon: ComponentType<{ className?: string }>;
};

export const navItems: readonly NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/my-projects", label: "My Projects", icon: LayoutGrid },
  { href: "/contributor/projects", label: "Contribute", icon: HeartHandshake },
  { href: "/bounties", label: "Bounties", icon: Trophy },
  { href: "/innovation/create", label: "Create", icon: Plus },
  { href: "/simulation", label: "Simulation", icon: Workflow },
  { href: "/hypercertificate", label: "Hypercertificate", icon: Fingerprint },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const pathname = usePathname() ?? "/";

  return (
    <aside className="group fixed inset-y-0 left-0 z-40 hidden w-[72px] flex-col overflow-hidden border-r border-border bg-background-secondary/70 backdrop-blur-2xl backdrop-saturate-150 transition-[width] duration-normal hover:w-[248px] hover:shadow-elev-3 lg:flex">
      <Link href="/" className="flex h-16 items-center gap-3 px-[18px]">
        <span className="grid size-9 shrink-0 place-items-center rounded-card border border-accent/30 bg-accent-dim shadow-glow-accent">
          <GitBranch className="size-5 text-accent-soft" />
        </span>
        <span className="overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-normal group-hover:opacity-100">
          <span className="block text-sm font-semibold">OICE</span>
          <span className="mono text-xs text-text-muted">base-sepolia</span>
        </span>
      </Link>

      <nav className="mt-4 grid gap-1 px-3">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-11 items-center gap-3 rounded-card px-[10px] text-sm font-medium transition duration-fast",
                active
                  ? "bg-accent-dim text-text-primary"
                  : "text-text-secondary hover:bg-white/[0.05] hover:text-text-primary",
              )}
            >
              {active ? <span className="absolute left-0 h-6 w-0.5 rounded-full bg-accent shadow-glow-accent" /> : null}
              <Icon className={cn("size-5 shrink-0", active && "text-accent-soft")} />
              <span className="overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-normal group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-background-secondary/80 px-1 py-1.5 backdrop-blur-2xl backdrop-saturate-150 lg:hidden">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-card py-1.5 text-[10px] font-medium transition duration-fast",
              active ? "text-accent-soft" : "text-text-muted hover:text-text-secondary",
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
