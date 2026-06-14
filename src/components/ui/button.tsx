import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-card text-sm font-semibold transition duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-accent to-ai px-4 text-white shadow-glow-accent transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[0_0_2px_rgba(238,105,46,0.9),0_0_36px_rgba(238,105,46,0.6)]",
        secondary:
          "border border-border bg-white/[0.05] px-4 text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl backdrop-saturate-150 hover:border-accent/40 hover:bg-white/[0.08]",
        outline:
          "border border-border bg-transparent px-4 text-text-secondary backdrop-blur-md hover:border-accent/40 hover:bg-white/[0.04] hover:text-text-primary",
        ghost: "text-text-secondary hover:bg-white/[0.06] hover:text-text-primary hover:backdrop-blur-md",
        danger: "bg-risk px-4 text-white hover:brightness-110",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-5 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    readonly asChild?: boolean;
  };

export function Button({ asChild = false, className, size, variant, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return <Component className={cn(buttonVariants({ className, size, variant }))} {...props} />;
}
