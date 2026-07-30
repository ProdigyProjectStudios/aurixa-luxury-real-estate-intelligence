import { Sparkles, ArrowRight, Activity, MapPin, LineChart } from "lucide-react";

const items = [
  { icon: Activity, title: "Inteligência de Mercado", subtext: "Dados em tempo real" },
  { icon: MapPin, title: "Matching com IA", subtext: "Imóveis alinhados ao seu perfil" },
  { icon: LineChart, title: "Insights de Investimento", subtext: "Análises e projeções exclusivas" },
];

export function IntelligenceSidebar() {
  return (
    <div className="bg-[#0B0B0B] border border-[#C2A063]/20 rounded-lg p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#C2A063]" />
        <h3 className="text-xs text-[#C2A063] uppercase tracking-widest">Aurixa Intelligence™</h3>
      </div>

      <h4 className="text-xl text-white font-serif italic leading-snug">
        Inteligência que Ilumina Decisões
      </h4>

      <p className="text-sm text-gray-400 leading-relaxed">
        Analisamos dados de mercado, tendências e perfil para apresentar oportunidades alinhadas ao seu estilo de vida.
      </p>

      <div className="flex flex-col gap-4 mt-1">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C2A063]/10 border border-[#C2A063]/25 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-[#C2A063]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-white leading-tight">{item.title}</span>
                <span className="text-xs text-gray-500">{item.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      <a className="text-xs text-[#C2A063] mt-2 flex items-center gap-1 uppercase tracking-wide cursor-pointer hover:text-white transition-colors">
        Saiba mais sobre a nossa inteligência <ArrowRight className="w-3 h-3" />
      </a>
    </div>
  );
}
