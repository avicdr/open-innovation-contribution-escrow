import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type CardVariant = "default" | "interactive" | "glow";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  readonly variant?: CardVariant;
};

const base = "glass rounded-card";

const variantClasses: Record<CardVariant, string> = {
  default: "",
  interactive:
    "transition duration-fast hover:-translate-y-px hover:border-accent/30 hover:bg-surface-hover/70 hover:shadow-elev-3",
  glow: "border-accent/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(238,105,46,0.22),0_8px_28px_rgba(0,0,0,0.4)]",
};

export function Card({ className, variant = "default", ...props }: CardProps) {
  return <div className={cn(base, variantClasses[variant], className)} {...props} />;
}
