import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { Property, formatPrice } from "@/data/properties";
import { VisionBadge } from "@/components/property/vision-badge";
import { ArrowUpRight } from "lucide-react";

interface PinnacleTileProps {
  property: Property;
  tall?: boolean;
  delay?: number;
}

export function PinnacleTile({ property, tall, delay = 0 }: PinnacleTileProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.97 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: reduce ? 0.4 : 0.7, delay: reduce ? 0 : delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={tall ? "lg:row-span-2 min-h-[420px]" : "min-h-[260px]"}
    >
      <Link
        href={`/property/${property.id}`}
        className="group relative block w-full h-full overflow-hidden rounded-lg cursor-pointer"
      >
        <img
          src={property.image}
          alt={property.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30"></div>

        {property.isVerified && (
          <div className="absolute top-5 left-5">
            <VisionBadge />
          </div>
        )}

        <div className="absolute bottom-6 right-6 w-11 h-11 rounded-full bg-black/55 border border-white/15 flex items-center justify-center text-white transition-colors group-hover:bg-[#C2A063] group-hover:border-[#C2A063] group-hover:text-black">
          <ArrowUpRight className="w-4 h-4" />
        </div>

        <div className="absolute bottom-6 left-6 right-20">
          <h3 className={"font-serif leading-tight mb-1.5 " + (tall ? "text-3xl lg:text-4xl" : "text-xl lg:text-2xl")}>
            {property.name}
          </h3>
          <div className="text-[10px] font-bold tracking-[0.2em] text-[#9A938A] uppercase mb-2">
            Aurixa Coleção
          </div>
          <div className={"font-serif text-[#C2A063] tracking-wide " + (tall ? "text-2xl" : "text-lg")}>
            {formatPrice(property.price)}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
