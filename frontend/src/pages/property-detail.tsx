import { useParams, Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { properties, formatPrice } from "@/data/properties";
import { agents } from "@/data/agents";
import { ArrowLeft, ArrowRight, BedDouble, Bath, Maximize, CarFront, Home, Info, Heart, Share2, Sparkles, Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";
import { IntelligenceSidebar } from "@/components/property/intelligence-sidebar";
import { useToast } from "@/hooks/use-toast";

export default function PropertyDetail() {
  const { id } = useParams();
  const property = properties.find(p => p.id === id) || properties[0];
  const agent = agents[0];
  const [activeTab, setActiveTab] = useState("Overview");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const currentIndex = properties.findIndex(p => p.id === property.id);
  const goToNeighbor = (dir: number) =>
    setLocation(`/property/${properties[(currentIndex + dir + properties.length) % properties.length].id}`);
  const notify = (title: string, description: string) => toast({ title, description });

  if (!property) return <div className="p-20 text-center">Property not found.</div>;

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <Navbar />
      
      {/* Top Nav */}
      <div className="pt-24 pb-4 px-6 max-w-[1440px] mx-auto flex flex-wrap justify-between items-center gap-y-2 border-b border-white/5 text-[11px] font-bold tracking-widest text-[#9A938A] uppercase">
        <Link href="/properties" className="hover:text-white flex items-center gap-2">
          <ArrowLeft className="w-3 h-3" /> Back to properties
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={() => goToNeighbor(-1)} className="hover:text-white flex items-center gap-2">
            <ArrowLeft className="w-3 h-3" /> Previous
          </button>
          <span className="text-white/20">|</span>
          <button onClick={() => goToNeighbor(1)} className="hover:text-white flex items-center gap-2">
            Next <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 pt-8 pb-24 lg:pb-8 flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN */}
        <div className="w-full lg:w-3/4">
          
          {/* Gallery */}
          <Reveal scale={0.97} blur={6} className="flex flex-col lg:flex-row gap-4 mb-8 lg:h-[600px]">
            <div className="relative w-full lg:w-3/4 h-[280px] sm:h-[420px] lg:h-full rounded-sm overflow-hidden group">
              <img src={property.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Main" />
              <div className="absolute top-4 left-4">
                <span className="bg-[#C2A063] text-black text-[10px] font-bold tracking-wider px-3 py-1 uppercase rounded-sm">
                  Exclusive
                </span>
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-sm border border-white/10">
                <button
                  onClick={() => notify("Galeria completa", "A galeria com 28 imagens estará disponível em breve.")}
                  className="text-[11px] font-bold tracking-widest uppercase hover:text-[#C2A063] transition-colors"
                >
                  View gallery
                </button>
                <div className="w-px h-3 bg-white/20"></div>
                <span className="text-xs font-medium tracking-widest">1 / 28</span>
              </div>
            </div>
            <div className="w-full lg:w-1/4 flex flex-row lg:flex-col gap-4 lg:h-full">
              {property.images.slice(1, 4).map((img, i) => (
                <div key={i} className="relative flex-1 h-24 sm:h-32 lg:h-1/3 rounded-sm overflow-hidden cursor-pointer group">
                  <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Thumb" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  {i === 2 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center border border-white/10">
                      <span className="text-2xl font-serif">+24</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Reveal>

          {/* Header Info */}
          <Reveal direction="left" distance={36} className="mb-10 border-b border-white/5 pb-10">
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#C2A063] uppercase mb-4">Featured Property</div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl mb-4">{property.name}</h1>
            <div className="flex items-center gap-2 text-[#9A938A] text-sm uppercase tracking-widest font-semibold">
              <MapPin className="w-4 h-4 text-[#C2A063]" />
              {property.location}, {property.state}
            </div>
          </Reveal>

          {/* Stats Bar */}
          <Reveal className="grid grid-cols-3 md:grid-cols-6 gap-6 mb-12 bg-[#161514] p-6 rounded-sm border border-white/5">
            <Stat icon={BedDouble} label="Bedrooms" value={`${property.suites} Suites`} />
            <Stat icon={Bath} label="Bathrooms" value={`${property.bathrooms} Baths`} />
            <Stat icon={Maximize} label="Area" value={`${property.area} m²`} />
            <Stat icon={CarFront} label="Parking" value={`${property.parking} Spaces`} />
            <Stat icon={Home} label="Property Type" value={property.type} />
            <Stat icon={Info} label="Status" value={property.status} />
          </Reveal>

          {/* Tabs */}
          <div className="flex gap-8 border-b border-white/10 mb-8 overflow-x-auto scrollbar-hide">
            {["Overview", "Details", "Amenities", "Location", "Market Intelligence™"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[11px] font-bold tracking-widest uppercase pb-3 relative whitespace-nowrap transition-colors ${
                  activeTab === tab ? "text-[#C2A063]" : "text-[#9A938A] hover:text-white"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="detailTab" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#C2A063]" />
                )}
              </button>
            ))}
          </div>

          {/* Overview Content */}
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="col-span-1">
              <h3 className="font-serif text-2xl mb-4">About this property</h3>
              <p className="text-[#9A938A] text-sm leading-relaxed mb-4">
                An architectural masterpiece located in the most prestigious area. This extraordinary residence offers panoramic views, unparalleled privacy, and bespoke finishes throughout. Designed for those who appreciate the finest things in life.
              </p>
              <button
                onClick={() => notify("Descrição completa", "O memorial descritivo completo estará disponível em breve.")}
                className="text-[#C2A063] text-[11px] font-bold tracking-widest uppercase hover:text-white transition-colors border-b border-[#C2A063] pb-1"
              >
                Show more
              </button>
            </div>
            <div className="col-span-1">
              <h3 className="font-serif text-2xl mb-4">Highlights</h3>
              <ul className="space-y-3 text-sm text-[#9A938A]">
                {["Panoramic skyline view", "Private elevator", "Smart home automation", "Wine cellar", "Infinity pool", "Private leisure area"].map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#C2A063] mt-0.5 flex-shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-1">
              <h3 className="font-serif text-2xl mb-4">Amenities</h3>
              <ul className="grid grid-cols-2 gap-3 text-sm text-[#9A938A] mb-6">
                {["Pool", "Spa", "Security 24h", "Fitness Center", "Private Lounge", "Concierge"].map((a, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#C2A063] rounded-full"></div>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => notify("Comodidades", "A lista completa de comodidades estará disponível em breve.")}
                className="text-[11px] font-bold tracking-widest uppercase border border-white/20 px-4 py-2 rounded-sm hover:border-[#C2A063] hover:text-[#C2A063] transition-colors w-full"
              >
                View all amenities
              </button>
            </div>
          </Reveal>

          {/* Bottom Strip Details */}
          <Reveal className="flex flex-wrap gap-x-12 gap-y-6 pt-8 border-t border-white/5 text-sm">
            <DetailItem label="YEAR BUILT" value="2022" />
            <DetailItem label="FLOORS" value="1" />
            <DetailItem label="UNIT PER FLOOR" value="1" />
            <DetailItem label="TOTAL UNITS" value="12" />
            <DetailItem label="ARCHITECTURE" value="Studio MK27" />
            <DetailItem label="INTERIOR DESIGN" value="Triplex Arquitetura" />
          </Reveal>

        </div>

        {/* RIGHT SIDEBAR */}
        <Reveal direction="right" distance={36} className="w-full lg:w-1/4">
          <div className="sticky top-24 bg-[#161514] border border-white/5 rounded-sm p-6">
            
            <div className="mb-6">
              <div className="text-[11px] font-bold tracking-widest text-[#9A938A] uppercase mb-2">Price</div>
              <div className="font-serif text-3xl sm:text-4xl mb-2">{formatPrice(property.price)}</div>
              <div className="text-xs text-[#9A938A]">Condominium: R$ 4.500 | IPTU: R$ 2.350 (monthly)</div>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <button
                onClick={() => notify("Visita agendada", "Nossa equipe entrará em contato para confirmar sua visita particular.")}
                className="bg-[#C2A063] text-black px-4 py-4 text-[11px] font-bold tracking-widest uppercase hover:bg-white transition-colors rounded-sm w-full"
              >
                Schedule a Private Visit
              </button>
              <button
                onClick={() => notify("Consultor a caminho", `${agent.name} entrará em contato com você em breve.`)}
                className="border border-white/20 text-white px-4 py-4 text-[11px] font-bold tracking-widest uppercase hover:border-[#C2A063] hover:text-[#C2A063] transition-colors rounded-sm w-full"
              >
                Contact an Advisor
              </button>
              <button
                onClick={() => notify("Imóvel salvo", "Este imóvel foi adicionado aos seus favoritos.")}
                className="flex justify-center items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-[#9A938A] hover:text-[#C2A063] py-2 transition-colors"
              >
                <Heart className="w-4 h-4" /> Save this property
              </button>
            </div>

            <div className="h-px w-full bg-white/5 mb-6"></div>

            {/* Intelligence Module */}
            <div className="mb-6">
              <IntelligenceSidebar />
            </div>

            {/* Share */}
            <div className="mb-6">
              <div className="text-[10px] font-bold tracking-widest text-[#9A938A] uppercase mb-3">Share this property</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => notify("Link copiado", "O link deste imóvel foi copiado para compartilhamento.")}
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#9A938A] hover:text-white hover:border-white transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Advisor */}
            <div>
              <div className="text-[10px] font-bold tracking-widest text-[#9A938A] uppercase mb-3">Work with an advisor</div>
              <div className="flex items-center gap-4">
                <img src={agent.image} alt={agent.name} className="w-14 h-14 rounded-full object-cover border border-[#C2A063]/30" />
                <div className="flex-1">
                  <div className="font-serif text-lg leading-none mb-1">{agent.name}</div>
                  <div className="text-[10px] tracking-widest text-[#C2A063] uppercase mb-1">{agent.role}</div>
                  <div className="text-xs text-[#9A938A]">{agent.phone}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => notify("Contato por telefone", `Ligue para ${agent.name}: ${agent.phone}`)}
                    className="w-8 h-8 rounded-full bg-[#C2A063]/10 border border-[#C2A063]/30 flex items-center justify-center text-[#C2A063] hover:bg-[#C2A063] hover:text-black transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => notify("Contato por e-mail", `Envie uma mensagem para ${agent.name}.`)}
                    className="w-8 h-8 rounded-full bg-[#C2A063]/10 border border-[#C2A063]/30 flex items-center justify-center text-[#C2A063] hover:bg-[#C2A063] hover:text-black transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </Reveal>
      </div>

      {/* Mobile sticky action bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 flex items-center justify-between gap-4 border-t border-white/10 bg-[#0B0B0B]/95 px-5 py-3 backdrop-blur-sm [transform:translateZ(0)]">
        <div className="min-w-0">
          <div className="text-[9px] font-bold uppercase tracking-widest text-[#9A938A]">Price</div>
          <div className="font-serif text-lg leading-tight truncate">{formatPrice(property.price)}</div>
        </div>
        <button
          onClick={() => notify("Visita agendada", "Nossa equipe entrará em contato para confirmar sua visita particular.")}
          className="shrink-0 rounded-sm bg-[#C2A063] px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-black transition-colors hover:bg-white"
        >
          Schedule Visit
        </button>
      </div>

      <Footer />
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 text-[#9A938A] mb-2">
        <Icon className="w-4 h-4 text-[#C2A063]" />
        <span className="text-[10px] font-bold tracking-widest uppercase">{label}</span>
      </div>
      <div className="text-white text-sm font-medium">{value}</div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold tracking-widest text-[#9A938A] uppercase mb-1">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
