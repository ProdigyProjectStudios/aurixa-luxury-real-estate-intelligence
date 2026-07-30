import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PropertyCard } from "@/components/property/property-card";
import { properties } from "@/data/properties";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";
import { Search, SlidersHorizontal, LayoutGrid, List, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Properties() {
  const [activeTab, setActiveTab] = useState("DESTAQUES");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();
  const reduce = useReducedMotion();

  const tabs = ["DESTAQUES", "NOVOS", "FRENTE MAR", "COBERTURAS", "CASAS", "INVESTIMENTO"];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white overflow-x-clip">
      <Navbar />
      
      <div className="pt-32 pb-16 px-6 max-w-[1440px] mx-auto">
        {/* Header */}
        <Reveal direction="left" distance={40} blur={6} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
          <div className="max-w-2xl">
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#C2A063] uppercase mb-4">Coleções Selecionadas</div>
            <h1 className="font-serif text-4xl sm:text-5xl mb-6">A Edição <span className="text-[#C2A063] italic">Pinnacle</span></h1>
            <p className="text-[#9A938A] leading-relaxed">
              Explore o ápice do mercado imobiliário. Propriedades que redefinem o conceito de viver bem, 
              avaliadas e verificadas por nossa inteligência artificial para garantir a máxima qualidade e valor.
            </p>
          </div>
          
          <div className="bg-[#161514] border border-white/5 p-4 rounded-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-[#C2A063]/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#C2A063]" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest text-[#9A938A] uppercase mb-1">Qualidade Garantida</div>
              <div className="text-white text-sm font-medium tracking-wide">Aurixa Vision™ Verificado</div>
            </div>
          </div>
        </Reveal>

        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-center border-b border-white/10 pb-4 mb-12 gap-6">
          <div className="flex overflow-x-auto w-full lg:w-auto scrollbar-hide gap-8 pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[11px] font-bold tracking-widest uppercase whitespace-nowrap pb-2 relative transition-colors ${
                  activeTab === tab ? "text-[#C2A063]" : "text-[#9A938A] hover:text-white"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-[#C2A063]"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => toast({ title: "Filtros Inteligentes", description: "Os filtros avançados com IA estarão disponíveis em breve." })}
              className="flex flex-1 lg:flex-none justify-center items-center gap-2 text-[10px] font-bold tracking-widest uppercase border border-white/20 px-4 py-2.5 rounded-sm hover:border-[#C2A063] hover:text-[#C2A063] transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3" />
              Filtros Inteligentes
            </button>
            <select className="flex-1 lg:flex-none bg-transparent border border-white/20 px-4 py-2.5 rounded-sm text-[10px] font-bold tracking-widest uppercase text-white outline-none focus:border-[#C2A063]">
              <option value="" className="bg-[#0B0B0B]">Localização</option>
              <option value="sp" className="bg-[#0B0B0B]">São Paulo</option>
              <option value="sc" className="bg-[#0B0B0B]">Santa Catarina</option>
              <option value="ba" className="bg-[#0B0B0B]">Bahia</option>
            </select>
            <div className="flex items-center border border-white/20 rounded-sm overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Visualização em grade"
                className={`p-2 transition-colors ${viewMode === "grid" ? "bg-white/10 text-white" : "text-[#9A938A] hover:text-white"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="Visualização em lista"
                className={`p-2 transition-colors ${viewMode === "list" ? "bg-white/10 text-white" : "text-[#9A938A] hover:text-white"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className={`grid gap-x-8 gap-y-12 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-3xl mx-auto"}`}>
          {properties.map((prop, i) => (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 36, scale: 0.96 }}
              whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: reduce ? 0.4 : 0.7, delay: reduce ? 0 : (i % 3) * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              key={prop.id}
            >
              <PropertyCard property={prop} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendation Bar */}
      <div className="bg-[#161514] border-t border-y-white/5 py-12 px-6">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Sparkles className="w-6 h-6 text-[#C2A063]" />
            <div>
              <h4 className="text-white font-serif text-xl mb-1">Inteligência Aurixa</h4>
              <p className="text-[#9A938A] text-sm">Não encontrou o que procura? Nossa IA pode sugerir propriedades baseadas no seu perfil.</p>
            </div>
          </div>
          <button
            onClick={() => toast({ title: "Recomendações personalizadas", description: "Nossa IA está preparando sugestões com base no seu perfil." })}
            className="bg-[#C2A063] text-black px-6 py-3 text-[11px] font-bold tracking-widest uppercase hover:bg-white transition-colors rounded-sm"
          >
            Ver Minhas Recomendações
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
