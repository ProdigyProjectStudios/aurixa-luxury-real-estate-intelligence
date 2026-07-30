import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col">
      <Navbar />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 pt-24 pb-20">
        <div className="pointer-events-none absolute -top-20 right-0 h-[320px] w-[320px] rounded-full bg-[#C2A063]/10 blur-[120px]" />
        <div className="relative text-center">
          <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.3em] text-[#C2A063]">
            Erro 404
          </div>
          <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl leading-none mb-6">
            Página não encontrada
          </h1>
          <p className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-[#9A938A]">
            O endereço que você procura não existe ou foi movido. Retorne ao
            início para continuar explorando nossa coleção exclusiva.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-sm bg-[#C2A063] px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao início
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
