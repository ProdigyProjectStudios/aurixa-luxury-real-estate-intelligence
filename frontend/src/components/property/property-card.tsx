import { Link } from "wouter";
import { Property, formatPrice } from "@/data/properties";
import { BedDouble, Bath, Maximize, Heart, ArrowRight } from "lucide-react";
import { VisionBadge } from "@/components/property/vision-badge";

interface PropertyCardProps {
  property: Property;
  /** When provided, the heart becomes an interactive save toggle (frontend-only). */
  saved?: boolean;
  onToggleSave?: (id: string) => void;
}

export function PropertyCard({ property, saved, onToggleSave }: PropertyCardProps) {
  return (
    <Link href={`/property/${property.id}`}>
      <div className="group cursor-pointer">
        <div className="relative aspect-[4/3] overflow-hidden mb-4 rounded-sm">
          <img 
            src={property.image} 
            alt={property.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
          
          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {property.isSelected && (
              <span className="bg-[#C2A063] text-black text-[10px] font-bold tracking-wider px-3 py-1 uppercase rounded-sm">
                Selecionado
              </span>
            )}
            {property.isActive && (
              <span className="bg-black/70 text-[#C2A063] border border-[#C2A063]/30 text-[10px] font-bold tracking-wider px-3 py-1 uppercase rounded-sm">
                Ativo
              </span>
            )}
          </div>
          
          <button
            onClick={
              onToggleSave
                ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleSave(property.id);
                  }
                : undefined
            }
            aria-label={saved ? "Remover dos salvos" : "Salvar imóvel"}
            aria-pressed={onToggleSave ? !!saved : undefined}
            className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
              saved
                ? "bg-[#C2A063] border-[#C2A063] text-black"
                : "bg-black/45 border-white/10 text-white hover:bg-[#C2A063] hover:border-[#C2A063] hover:text-black"
            }`}
          >
            <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
          </button>

          {/* Price overlaid bottom-right */}
          <div className="absolute bottom-4 right-4 text-white font-serif text-xl tracking-wide">
            {formatPrice(property.price)}
          </div>

          {/* Vision Badge overlapping thumbnail, bottom-left */}
          {property.isVerified && (
            <div className="absolute bottom-11 left-4">
              <VisionBadge />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-white font-serif text-2xl mb-1 group-hover:text-[#C2A063] transition-colors">{property.name}</h3>
            <p className="text-[11px] font-semibold tracking-widest text-[#9A938A] uppercase">
              {property.location} • {property.state}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div className="flex items-center gap-6 text-[#9A938A] text-sm">
              <div className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-[#C2A063]" />
                <span>{property.suites} Suítes</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="w-4 h-4 text-[#C2A063]" />
                <span>{property.bathrooms} Banheiros</span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize className="w-4 h-4 text-[#C2A063]" />
                <span>{property.area} m²</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#C2A063] group-hover:border-[#C2A063] group-hover:text-black transition-all text-[#C2A063]">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
