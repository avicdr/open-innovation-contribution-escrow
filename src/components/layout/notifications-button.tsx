"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function NotificationsButton() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);

    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="grid size-10 place-items-center rounded-card border border-border bg-white/[0.04] text-text-secondary backdrop-blur-md backdrop-saturate-150 transition duration-fast hover:border-accent/40 hover:text-text-primary"
      >
        <Bell className="size-4" aria-hidden />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="glass-strong absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-xl"
          >
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
            </div>
            <div className="grid place-items-center gap-2 px-4 py-8 text-center">
              <CheckCircle2 className="size-6 text-success" aria-hidden />
              <p className="text-sm text-text-secondary">You&apos;re all caught up.</p>
              <p className="text-xs text-text-muted">Contribution, funding, and reward events will appear here.</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
