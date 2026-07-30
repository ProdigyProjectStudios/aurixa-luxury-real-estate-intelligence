import { Link } from "wouter";
import { Property, formatPrice } from "@/data/properties";
import { BedDouble, Maximize, Heart, ArrowRight } from "lucide-react";
import { VisionBadge } from "@/components/property/vision-badge";
import { useToast } from "@/hooks/use-toast";

export function FeaturedArrival({ property }: { property: Property }) {
  const { toast } = useToast();

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({ title: "Imóvel salvo", description: "Este imóvel foi adicionado aos seus favoritos." });
  };

  return (
    <Link href={`/property/${property.id}`}>
      <div className="group relative aspect-[16/11] w-full overflow-hidden rounded-lg cursor-pointer">
        <img
          src={property.image}
          alt={property.name}
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30"></div>

        {/* Top badges — upper-left, compact (matches Pinnacle tiles) */}
        <div className="absolute top-5 left-5 flex flex-col items-start gap-2">
          {property.isActive && (
            <span className="bg-black/70 text-[#C2A063] border border-[#C2A063]/30 text-[10px] font-bold tracking-wider px-3 py-1 uppercase rounded-sm">
              Ativo
            </span>
          )}
          {property.isVerified && <VisionBadge />}
        </div>
        <button
          onClick={handleSave}
          aria-label="Salvar imóvel"
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-black/55 flex items-center justify-center border border-white/10 text-white hover:bg-[#C2A063] hover:border-[#C2A063] hover:text-black transition-colors"
        >
          <Heart className="w-4 h-4" />
        </button>

        {/* Bottom overlay info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="font-serif text-2xl lg:text-3xl text-white mb-1 tracking-wide">
                {formatPrice(property.price)}
              </div>
              <h3 className="font-serif text-xl lg:text-2xl text-white mb-2">{property.name}</h3>
              <div className="text-[10px] font-bold tracking-[0.2em] text-[#C2A063] uppercase mb-4">
                Aurixa Coleção
              </div>
              <div className="flex items-center gap-6 text-[#cfc9c0] text-xs">
                <span className="flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-[#C2A063]" />
                  {property.suites} Suítes
                </span>
                <span className="flex items-center gap-2">
                  <Maximize className="w-4 h-4 text-[#C2A063]" />
                  {property.area.toLocaleString("pt-BR")} m²
                </span>
              </div>
            </div>
            <div className="w-12 h-12 shrink-0 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-[#C2A063] group-hover:border-[#C2A063] group-hover:text-black transition-all">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
