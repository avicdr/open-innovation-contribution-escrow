"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { navItems } from "@/components/layout/sidebar-nav";

type Command = {
  readonly href: string;
  readonly label: string;
  readonly hint: string;
  readonly keywords: string;
};

const commands: readonly Command[] = [
  ...navItems.map((item) => ({
    href: item.href,
    label: item.label,
    hint: "Navigate",
    keywords: item.label.toLowerCase(),
  })),
  { href: "/innovation/create", label: "Create new innovation", hint: "Action", keywords: "create new innovation project idea" },
  { href: "/simulation", label: "Run the lifecycle simulation", hint: "Action", keywords: "simulation demo walkthrough lifecycle" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return commands;
    }

    return commands.filter((command) => command.label.toLowerCase().includes(q) || command.keywords.includes(q));
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelected(0);
  }, []);

  const run = useCallback(
    (command: Command) => {
      close();
      router.push(command.href);
    },
    [close, router],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      } else if (event.key === "Escape") {
        close();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    if (open) {
      setSelected(0);
      const id = window.setTimeout(() => inputRef.current?.focus(), 10);

      return () => window.clearTimeout(id);
    }
  }, [open]);

  function onListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelected((current) => Math.min(current + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && results[selected]) {
      event.preventDefault();
      run(results[selected]);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-full max-w-xs items-center gap-2 rounded-card border border-border bg-white/[0.04] px-3 text-sm text-text-muted backdrop-blur-md backdrop-saturate-150 transition duration-fast hover:border-accent/40 hover:text-text-secondary"
      >
        <Search className="size-4" aria-hidden />
        <span className="flex-1 text-left">Search or jump to…</span>
        <kbd className="mono rounded border border-border px-1.5 py-0.5 text-[10px] text-text-muted">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <button type="button" aria-label="Close command palette" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              onKeyDown={onListKeyDown}
              className="glass-strong relative w-full max-w-xl overflow-hidden rounded-xl"
            >
              <div className="flex items-center gap-3 border-b border-border px-4">
                <Search className="size-4 text-text-muted" aria-hidden />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSelected(0);
                  }}
                  placeholder="Search projects, ideas, and actions…"
                  className="h-12 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
                />
                <kbd className="mono rounded border border-border px-1.5 py-0.5 text-[10px] text-text-muted">esc</kbd>
              </div>

              <div className="max-h-[50vh] overflow-y-auto p-2">
                {results.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-text-muted">No matches for “{query}”.</p>
                ) : (
                  results.map((command, index) => (
                    <button
                      key={`${command.href}-${command.label}`}
                      type="button"
                      onClick={() => run(command)}
                      onMouseEnter={() => setSelected(index)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-card px-3 py-2.5 text-left text-sm transition duration-fast",
                        index === selected ? "bg-accent-dim text-text-primary" : "text-text-secondary",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className={cn("mono text-[10px] uppercase tracking-wider", index === selected ? "text-accent-soft" : "text-text-muted")}>
                          {command.hint}
                        </span>
                        {command.label}
                      </span>
                      {index === selected ? <CornerDownLeft className="size-3.5 text-text-muted" aria-hidden /> : null}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
