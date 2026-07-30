import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
}

/**
 * Right-side luxury slide-over panel. Frontend-only — used across the portals
 * for scheduling, concierge messaging, inquiry details, and admin actions.
 * Closes on backdrop click and Escape, traps focus while open, restores focus
 * on close, and honors prefers-reduced-motion.
 */
export function Drawer({ open, onClose, eyebrow, title, children }: DrawerProps) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key === "Tab") {
        const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (!nodes || nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      (nodes && nodes.length ? nodes[0] : panelRef.current)?.focus();
    }, 60);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(focusTimer);
      lastFocused.current?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { x: "100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "100%" }}
            transition={{ type: "tween", ease: EASE, duration: 0.45 }}
            className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-[#0F0E0D] border-l border-white/10 flex flex-col shadow-2xl outline-none"
          >
            <div className="flex items-start justify-between gap-4 p-6 border-b border-white/5">
              <div>
                {eyebrow && (
                  <div className="text-[10px] font-bold tracking-[0.25em] text-[#C2A063] uppercase mb-2">
                    {eyebrow}
                  </div>
                )}
                {title && (
                  <h3 id={titleId} className="font-serif text-2xl leading-tight">
                    {title}
                  </h3>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Fechar painel"
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-[#9A938A] hover:text-white hover:border-white/30 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
