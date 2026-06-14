import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type FieldProps = LabelHTMLAttributes<HTMLLabelElement> & {
  readonly label: string;
  readonly hint?: string;
  readonly children: ReactNode;
};

const controlClassName =
  "w-full rounded-card border border-border bg-white/[0.04] px-3 text-sm text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none backdrop-blur-md backdrop-saturate-150 transition duration-fast placeholder:text-text-muted/70 focus:border-accent/70 focus:bg-white/[0.07] focus:shadow-glow-soft";

export function Field({ label, hint, children, className, ...props }: FieldProps) {
  return (
    <label className={cn("grid gap-2", className)} {...props}>
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      {children}
      {hint ? <span className="text-xs leading-5 text-text-muted">{hint}</span> : null}
    </label>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-10", controlClassName, className)} {...props} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-24 py-3", controlClassName, className)} {...props} />;
}

export function SelectInput({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-10", controlClassName, className)} {...props} />;
}
