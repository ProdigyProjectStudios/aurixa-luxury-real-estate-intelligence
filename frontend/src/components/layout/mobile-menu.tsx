import { useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  ArrowUpRight,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_INOUT = [0.76, 0, 0.24, 1] as const;

const sheet: Variants = {
  closed: {
    clipPath: "circle(0% at calc(100% - 32px) 28px)",
    transition: { duration: 0.3, ease: EASE_INOUT },
  },
  open: {
    clipPath: "circle(150% at calc(100% - 32px) 28px)",
    transition: {
      duration: 0.45,
      ease: EASE_OUT,
      staggerChildren: 0.04,
      delayChildren: 0.06,
    },
  },
};

const item: Variants = {
  closed: { y: 14, opacity: 0 },
  open: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
};

const line: Variants = {
  closed: { scaleY: 0 },
  open: { scaleY: 1, transition: { duration: 0.6, ease: EASE_OUT } },
};

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      panelRef.current
        ? Array.from(
            panelRef.current.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((el) => el.offsetParent !== null)
        : [];

    const focusTimer = window.setTimeout(() => focusables()[0]?.focus(), 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const f = focusables();
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      prevFocused?.focus?.();
    };
  }, [open, onClose]);

  const comingSoon = (label: string) => {
    onClose();
    toast({ title: label, description: "Esta seção estará disponível em breve." });
  };

  const go = (href: string) => {
    onClose();
    setLocation(href);
  };

  const primary: { label: string; onClick: () => void; href?: string }[] = [
    { label: "Propriedades", href: "/properties", onClick: () => go("/properties") },
    { label: "Agentes", onClick: () => comingSoon("Agentes") },
    { label: "Jornal", onClick: () => comingSoon("Jornal") },
    { label: "Sobre", onClick: () => comingSoon("Sobre") },
    { label: "Contato", onClick: () => comingSoon("Contato") },
  ];

  const socials = [
    { icon: Instagram, label: "Instagram" },
    { icon: Linkedin, label: "LinkedIn" },
    { icon: Twitter, label: "Twitter" },
    { icon: Facebook, label: "Facebook" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          ref={panelRef}
          initial="closed"
          animate="open"
          exit="closed"
          variants={sheet}
          className="fixed inset-0 z-40 md:hidden bg-[#0B0B0B] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
          {/* Decorative layers */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-[360px] w-[360px] rounded-full bg-[#C2A063]/14 blur-[120px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B] via-[#0B0B0B]/40 to-[#0B0B0B]" />
            <div className="absolute inset-0 opacity-[0.5] [background-image:linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:100%_44px]" />
            {/* Corner brackets */}
            <motion.div
              variants={item}
              className="absolute left-6 top-20 h-8 w-8 border-l border-t border-[#C2A063]/30"
            />
            <motion.div
              variants={item}
              className="absolute bottom-8 right-6 h-8 w-8 border-b border-r border-[#C2A063]/30"
            />
            {/* Vertical accent line */}
            <motion.div
              variants={line}
              style={{ originY: 0 }}
              className="absolute left-6 top-32 bottom-28 w-px bg-gradient-to-b from-[#C2A063]/60 via-[#C2A063]/15 to-transparent"
            />
          </div>

          <div className="relative flex min-h-full flex-col px-7 pt-24 pb-10 pl-12">
            <motion.div
              variants={item}
              className="mb-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#6f6962]"
            >
              <span className="text-[#C2A063]">✦</span> Navegação
            </motion.div>

            {/* Search pill */}
            <motion.button
              variants={item}
              onClick={() => go("/properties")}
              className="mb-9 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3.5 text-left text-[#9A938A] transition-colors hover:border-[#C2A063]/50 hover:text-white"
            >
              <Search className="h-4 w-4 text-[#C2A063]" />
              <span className="text-[12px] font-medium tracking-wide">
                Buscar imóveis exclusivos
              </span>
              <ArrowUpRight className="ml-auto h-4 w-4 text-[#6f6962]" />
            </motion.button>

            {/* Primary nav */}
            <nav className="flex flex-col">
              {primary.map((it, i) => {
                const active = it.href && location === it.href;
                return (
                  <motion.button
                    key={it.label}
                    variants={item}
                    onClick={it.onClick}
                    className="group flex items-baseline gap-4 border-b border-white/5 py-3.5 text-left"
                  >
                    <span className="w-6 font-mono text-[11px] tracking-widest text-[#C2A063]/70">
                      0{i + 1}
                    </span>
                    <span
                      className={`font-serif text-[2.1rem] leading-none transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#C2A063] ${
                        active ? "text-[#C2A063] italic" : "text-white"
                      }`}
                    >
                      {it.label}
                    </span>
                    <ArrowUpRight className="ml-auto h-5 w-5 translate-y-1 text-[#C2A063] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" />
                  </motion.button>
                );
              })}
            </nav>

            {/* CTA */}
            <motion.button
              variants={item}
              onClick={() => comingSoon("Listar Imóvel")}
              className="mt-9 w-full rounded-sm bg-[#C2A063] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-white"
            >
              Listar Imóvel
            </motion.button>

            {/* Secondary access */}
            <motion.div
              variants={item}
              className="mt-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A938A]"
            >
              <Link
                href="/client-portal"
                onClick={onClose}
                className="flex-1 rounded-sm border border-white/10 py-3 text-center transition-colors hover:border-[#C2A063]/50 hover:text-white"
              >
                Cliente
              </Link>
              <Link
                href="/admin"
                onClick={onClose}
                className="flex-1 rounded-sm border border-white/10 py-3 text-center transition-colors hover:border-[#C2A063]/50 hover:text-white"
              >
                Administrador
              </Link>
            </motion.div>

            {/* Footer of menu */}
            <motion.div variants={item} className="mt-auto pt-10">
              <div className="flex items-center gap-2">
                {socials.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    onClick={() => comingSoon(label)}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#9A938A] transition-colors hover:border-[#C2A063] hover:text-[#C2A063]"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
              <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-[#6f6962]">
                Inteligência que ilumina decisões. Exclusividade que transforma
                vidas.
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
