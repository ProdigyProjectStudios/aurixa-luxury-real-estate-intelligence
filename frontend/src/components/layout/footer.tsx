import { Link } from "wouter";
import { Instagram, Linkedin, Twitter, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Footer() {
  const { toast } = useToast();

  const comingSoon = (label: string) =>
    toast({ title: label, description: "Esta seção estará disponível em breve." });

  return (
    <footer className="bg-[#0B0B0B] border-t border-white/5 pt-3.5 pb-4">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 gap-5 md:grid-cols-[1fr_auto_1fr] md:items-end md:gap-0">
        {/* Left — copyright + social icons */}
        <div className="flex flex-col items-center md:items-start gap-2.5">
          <div className="flex items-center gap-2">
            {[
              { icon: Instagram, label: "Instagram" },
              { icon: Linkedin, label: "LinkedIn" },
              { icon: Twitter, label: "Twitter" },
              { icon: Facebook, label: "Facebook" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                onClick={() => comingSoon(label)}
                aria-label={label}
                className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-[#9A938A] hover:border-[#C2A063] hover:text-[#C2A063] transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[#6f6962] uppercase">© 2026 Aurixa Real Estate</p>
        </div>

        {/* Center — brand */}
        <div className="order-first md:order-none flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#C2A063]">
              <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="currentColor"/>
            </svg>
            <span className="text-white tracking-[0.22em] font-medium text-base uppercase">AURIXA</span>
          </Link>
          <p className="text-[#9A938A] text-[13px] leading-relaxed mt-1.5">
            Inteligência que ilumina decisões. Exclusividade que transforma vidas.
          </p>
        </div>

        {/* Right — legal */}
        <div className="flex items-center justify-center md:justify-end gap-5 text-[10px] font-semibold tracking-[0.18em] text-[#6f6962] uppercase">
          <button onClick={() => comingSoon("Política de Privacidade")} className="uppercase hover:text-white transition-colors">Política de Privacidade</button>
          <button onClick={() => comingSoon("Termos de Serviço")} className="uppercase hover:text-white transition-colors">Termos de Serviço</button>
        </div>
      </div>
    </footer>
  );
}
