import { Link, useLocation } from "wouter";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { MobileMenu } from "@/components/layout/mobile-menu";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const comingSoon = (label: string) =>
    toast({
      title: `${label}`,
      description: "Esta seção estará disponível em breve.",
    });

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-[#0B0B0B]/90 backdrop-blur-sm border-b border-white/5 [transform:translateZ(0)]">
        <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2 group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#C2A063] transition-transform group-hover:scale-110 duration-500">
                <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="currentColor"/>
              </svg>
              <span className="text-white tracking-[0.22em] font-medium text-sm uppercase">AURIXA</span>
            </Link>

            <div className="hidden md:flex items-center gap-7 text-[10px] font-semibold tracking-[0.18em] text-[#9A938A]">
              <Link href="/properties" className="hover:text-white transition-colors">PROPRIEDADES</Link>
              <button onClick={() => comingSoon("Agentes")} className="hover:text-white transition-colors uppercase">Agentes</button>
              <button onClick={() => comingSoon("Jornal")} className="hover:text-white transition-colors uppercase">Jornal</button>
              <button onClick={() => comingSoon("Sobre")} className="hover:text-white transition-colors uppercase">Sobre</button>
              <button onClick={() => comingSoon("Contato")} className="hover:text-white transition-colors uppercase">Contato</button>
            </div>
          </div>

          <div className="flex items-center">
            <div className="hidden md:flex items-center gap-5 text-[10px] font-semibold tracking-[0.18em] text-[#9A938A]">
              <button onClick={() => setLocation("/properties")} aria-label="Buscar imóveis" className="hover:text-white transition-colors">
                <Search className="w-3.5 h-3.5" />
              </button>
              <div className="w-[1px] h-3.5 bg-white/10"></div>
              <Link href="/client-portal" className="hover:text-white transition-colors">CLIENTE</Link>
              <Link href="/admin" className="hover:text-white transition-colors">ADMINISTRADOR</Link>
              <button
                onClick={() => comingSoon("Listar Imóvel")}
                className="border border-[#C2A063] text-[#C2A063] px-5 py-1.5 rounded-sm hover:bg-[#C2A063] hover:text-black transition-colors uppercase"
              >
                Listar Imóvel
              </button>
            </div>

            {/* Mobile hamburger — morphs to X */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              className="md:hidden relative flex h-10 w-10 items-center justify-center -mr-2 text-white"
            >
              <span className="relative block h-3.5 w-6">
                <motion.span
                  className="absolute left-0 top-0 block h-[1.5px] w-full origin-center rounded-full bg-current"
                  animate={menuOpen ? { rotate: 45, y: 6, backgroundColor: "#C2A063" } : { rotate: 0, y: 0, backgroundColor: "#ffffff" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.span
                  className="absolute left-0 top-1/2 block h-[1.5px] w-full -translate-y-1/2 rounded-full bg-current"
                  animate={menuOpen ? { opacity: 0, x: -12 } : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                />
                <motion.span
                  className="absolute bottom-0 left-0 block h-[1.5px] w-full origin-center rounded-full bg-current"
                  animate={menuOpen ? { rotate: -45, y: -6, backgroundColor: "#C2A063" } : { rotate: 0, y: 0, backgroundColor: "#ffffff" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
