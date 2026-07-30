import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PinnacleTile } from "@/components/property/pinnacle-tile";
import { FeaturedArrival } from "@/components/property/featured-arrival";
import { CinematicGallery } from "@/components/gallery/cinematic-gallery";
import { Reveal, StaggerGroup, StaggerItem, ParallaxImage } from "@/components/motion/reveal";
import { PremiumVideoHero } from "@/components/hero/PremiumVideoHero";
import { properties } from "@/data/properties";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Globe, Sparkles, BellRing, Diamond, Activity, Clock, BadgeCheck, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ctaBg from "@/assets/images/cta-bg.png";

export default function Home() {
  const pinnacleSelection = [
    ...properties.filter(p => p.isPinnacle),
    ...properties.filter(p => !p.isPinnacle),
  ].slice(0, 3);
  const pinnacleIds = new Set(pinnacleSelection.map(p => p.id));
  const latestArrivals = properties.filter(p => !pinnacleIds.has(p.id));

  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [arrivalIndex, setArrivalIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Feature strip reveals the instant the user begins scrolling.
  const [hasScrolled, setHasScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 0) {
        setHasScrolled(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Preload all arrival images so cycling between cards is instant.
  useEffect(() => {
    latestArrivals.forEach((p) => {
      const img = new Image();
      img.src = p.image;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paginate = (dir: number) => {
    if (latestArrivals.length === 0) return;
    setDirection(dir);
    setArrivalIndex(prev => (prev + dir + latestArrivals.length) % latestArrivals.length);
  };

  const currentArrival = latestArrivals[arrivalIndex];

  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroContentY = useTransform(heroProgress, [0, 1], [0, 90]);
  const heroContentOpacity = useTransform(heroProgress, [0, 0.75], [1, 0]);

  const handleSearch = () => setLocation("/properties");

  const handleAlerts = () =>
    toast({
      title: "Alertas personalizados ativados",
      description: "Você será o primeiro a saber sobre novas oportunidades exclusivas AURIXA.",
    });

  return (
    <div className="relative min-h-screen bg-[#0B0B0B] text-white overflow-x-clip">
      <Navbar />

      {/* Hero Section — compact, bespoke split layout */}
      <section ref={heroRef} className="relative bg-[#0B0B0B] pt-14 overflow-hidden">
        {/* Cinematic cross-fading video background with a heavy charcoal overlay */}
        <PremiumVideoHero />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12">
          <motion.div
            style={reduce ? undefined : { y: heroContentY, opacity: heroContentOpacity }}
            className="flex items-center min-h-[580px] lg:min-h-[680px] py-20 lg:py-28"
          >
            <div className="flex flex-col gap-8 w-full lg:w-[60%] max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-[10px] font-bold tracking-[0.32em] text-[#C2A063] uppercase"
              >
                Plataforma Global de Inteligência Imobiliária
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] leading-tight"
              >
                Inteligência que <span className="text-[#C2A063] italic">ilumina</span> decisões.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-[#C2A063] text-xl leading-relaxed"
              >
                Inteligência imobiliária baseada em IA que transforma dados em clareza, confiança e melhores decisões.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="w-full max-w-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-[#161514]/70 backdrop-blur-md p-2 sm:py-1.5 sm:pl-5 sm:pr-1.5 rounded-2xl sm:rounded-full border border-white/12">
                  <div className="flex items-center gap-2 flex-1 min-w-0 px-3 sm:px-0">
                    <Sparkles className="w-4 h-4 text-[#C2A063] shrink-0" />
                    <input
                      type="text"
                      placeholder="Conte-nos o estilo de vida que você busca"
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-[#9A938A] text-sm py-2 min-w-0"
                      data-testid="input-hero-search"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    data-testid="button-hero-analyze"
                    className="shrink-0 w-full sm:w-auto justify-center flex items-center gap-2 bg-white/5 border border-white/20 text-white px-5 py-3 sm:py-2.5 text-[10px] font-bold tracking-[0.18em] uppercase rounded-xl sm:rounded-full hover:bg-[#C2A063] hover:text-black hover:border-[#C2A063] transition-colors"
                  >
                    Explorar com Aurixa
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[10px] tracking-[0.18em] text-[#6f6962] uppercase mt-4 ml-1">
                  Com tecnologia Aurixa Intelligence™
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Feature Strip */}
        <div className="relative z-10 border-t border-white/8 bg-[#0B0B0B]/50 backdrop-blur-sm">
          <StaggerGroup
            stagger={0.08}
            active={hasScrolled}
            className="max-w-[1440px] mx-auto px-6 lg:px-10 py-5 flex flex-wrap items-center justify-center md:justify-between gap-x-6 gap-y-3"
          >
            <StaggerItem><FeatureItem icon={Sparkles} text="Curadoria Humana + IA" /></StaggerItem>
            <StaggerItem><FeatureItem icon={Diamond} text="Oportunidades Exclusivas" /></StaggerItem>
            <StaggerItem><FeatureItem icon={Activity} text="Inteligência de Mercado" /></StaggerItem>
            <StaggerItem><FeatureItem icon={Clock} text="Disponibilidade Limitada" /></StaggerItem>
            <StaggerItem><FeatureItem icon={Globe} text="Alcance Global" last /></StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      {/* Decorative divider — centered AURIXA star mark (animates on load) */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="flex justify-center pt-2.5 lg:pt-3"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#C2A063]">
          <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="currentColor"/>
        </svg>
      </motion.div>

      {/* Pinnacle Collection — editorial layout */}
      <section className="pt-12 pb-20 md:pb-32 px-6">
        <div className="max-w-[1440px] mx-auto">
          <Reveal direction="left" distance={40} blur={6}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-8">
              <div className="max-w-xl">
                <div className="text-[11px] font-bold tracking-[0.2em] text-[#C2A063] uppercase mb-4">Coleções Selecionadas</div>
                <h2 className="font-serif text-4xl md:text-5xl mb-6">A Edição <span className="text-[#C2A063] italic">Pinnacle</span></h2>
                <p className="text-[#9A938A] leading-relaxed">
                  Nossa seleção das propriedades mais extraordinárias e cobiçadas, meticulosamente curadas para os padrões mais exigentes de luxo e sofisticação.
                </p>
              </div>
              <Link href="/properties">
                <button className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase border border-white/20 px-6 py-3 rounded-sm hover:border-[#C2A063] hover:text-[#C2A063] transition-colors">
                  Ver Toda a Coleção
                </button>
              </Link>
            </div>
          </Reveal>

          <div className="space-y-6">
            {/* Tall feature left, two stacked right */}
            {pinnacleSelection[0] && (
              <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[280px_280px] gap-6">
                <PinnacleTile property={pinnacleSelection[0]} tall />
                {pinnacleSelection[1] && <PinnacleTile property={pinnacleSelection[1]} delay={0.1} />}
                {pinnacleSelection[2] && <PinnacleTile property={pinnacleSelection[2]} delay={0.2} />}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Latest Arrivals — editorial composition with cyclable featured property */}
      <section className="py-28 lg:py-32 px-6 bg-[#161514]">
        <div className="max-w-[1440px] mx-auto">
          {/* Header */}
          <Reveal>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-14">
              <div className="max-w-xl">
                <div className="text-[11px] font-bold tracking-[0.2em] text-[#C2A063] uppercase mb-4">Chegadas Exclusivas</div>
                <h2 className="font-serif text-4xl md:text-5xl mb-5">Últimas <span className="text-[#C2A063] italic">Chegadas</span></h2>
                <p className="text-[#9A938A] leading-relaxed">
                  Imóveis recém-selecionados pela curadoria AURIXA. Oportunidades únicas, disponíveis por tempo limitado.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/properties">
                  <button className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase border border-white/20 px-5 py-3.5 rounded-sm hover:border-[#C2A063] hover:text-[#C2A063] transition-colors">
                    Ver Todos os Imóveis <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate(-1)}
                    aria-label="Imóvel anterior"
                    data-testid="button-arrival-prev"
                    className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white hover:border-[#C2A063] hover:text-[#C2A063] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => paginate(1)}
                    aria-label="Próximo imóvel"
                    data-testid="button-arrival-next"
                    className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white hover:border-[#C2A063] hover:text-[#C2A063] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Featured + feature list */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
            <Reveal className="lg:col-span-8" scale={0.96} blur={6} distance={36}>
              {currentArrival && (
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentArrival.id}
                    custom={direction}
                    variants={{
                      enter: (d: number) => ({ opacity: 0, x: d > 0 ? 64 : -64 }),
                      center: { opacity: 1, x: 0 },
                      exit: (d: number) => ({ opacity: 0, x: d > 0 ? -64 : 64 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <FeaturedArrival property={currentArrival} />
                  </motion.div>
                </AnimatePresence>
              )}
            </Reveal>

            <StaggerGroup className="lg:col-span-4 flex flex-col justify-center">
              <StaggerItem>
                <ArrivalFeature
                  icon={Sparkles}
                  title="Curadoria Humana + IA"
                  desc="Cada imóvel é analisado com inteligência e curadoria especializada."
                />
              </StaggerItem>
              <div className="h-px bg-white/8 my-6"></div>
              <StaggerItem>
                <ArrivalFeature
                  icon={Clock}
                  title="Oportunidades Exclusivas"
                  desc="Acesso antecipado a imóveis extraordinários antes de chegarem ao mercado."
                />
              </StaggerItem>
              <div className="h-px bg-white/8 my-6"></div>
              <StaggerItem>
                <ArrivalFeature
                  icon={BadgeCheck}
                  title="Disponibilidade Limitada"
                  desc="Imóveis selecionados com exclusividade para nossos clientes."
                />
              </StaggerItem>
            </StaggerGroup>
          </div>

          {/* Anticipation CTA bar */}
          <Reveal delay={0.1}>
            <div className="mt-12 bg-[#0B0B0B] border border-white/8 rounded-lg p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-full bg-[#C2A063]/10 border border-[#C2A063]/25 flex items-center justify-center text-[#C2A063]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-[0.2em] text-[#C2A063] uppercase mb-1">Inteligência que Antecipa</div>
                  <p className="text-[#cfc9c0] text-sm">AURIXA identifica oportunidades únicas antes que elas cheguem até você.</p>
                </div>
              </div>
              <button
                onClick={handleAlerts}
                data-testid="button-activate-alerts"
                className="shrink-0 flex items-center gap-2 bg-transparent border border-[#C2A063] text-[#C2A063] px-6 py-3.5 text-[11px] font-bold tracking-widest uppercase hover:bg-[#C2A063] hover:text-black transition-colors rounded-sm"
              >
                <BellRing className="w-4 h-4" />
                Ativar Alertas Personalizados
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Cinematic Gallery — interactive hover/center-to-play video carousel */}
      <CinematicGallery />

      {/* CTA — the private invitation: closing call framed as exclusive concierge access */}
      <section className="relative py-40 md:py-52 px-6 flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ParallaxImage src={ctaBg} alt="" strength={110} />
          {/* Cinematic grade: darken for legibility, focus the center, and melt the
              banner edges into the page so it reads as one continuous scene. */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B] via-black/55 to-[#0B0B0B]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(11,11,11,0.5)_62%,#0B0B0B_100%)]" />
          <div className="absolute inset-0 bg-black/25" />
          {/* Warm gold bloom behind the headline for depth. */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[55%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C2A063]/10 blur-[130px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl">
          <StaggerGroup className="flex flex-col items-center" stagger={0.14} margin="-120px">
            <StaggerItem>
              <div className="mb-7 flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#C2A063]/60" />
                <Diamond className="h-3 w-3 text-[#C2A063]" />
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#C2A063]/60" />
              </div>
            </StaggerItem>

            <StaggerItem>
              <p className="mb-7 text-[11px] font-bold uppercase tracking-[0.3em] text-[#C2A063]">
                Atendimento Exclusivo
              </p>
            </StaggerItem>

            <StaggerItem>
              <h2 className="mb-7 font-serif text-4xl leading-[1.08] md:text-6xl">
                Pronto para adquirir o seu próximo{" "}
                <span className="italic text-[#C2A063]">imóvel extraordinário?</span>
              </h2>
            </StaggerItem>

            <StaggerItem>
              <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-[#9A938A] md:text-lg">
                Converse com um de nossos consultores particulares e tenha acesso a oportunidades
                reservadas, negócios off-market e a uma curadoria sob medida para o seu padrão.
              </p>
            </StaggerItem>

            <StaggerItem>
              <div className="flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-7">
                <button
                  onClick={() =>
                    toast({
                      title: "Solicitação recebida",
                      description:
                        "Um de nossos consultores particulares entrará em contato com você em breve.",
                    })
                  }
                  data-testid="button-private-office"
                  className="group inline-flex items-center gap-3 rounded-sm bg-[#C2A063] px-9 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black shadow-[0_20px_60px_-15px_rgba(194,160,99,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_26px_72px_-12px_rgba(194,160,99,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2A063] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0B]"
                >
                  Falar com um Escritório Particular
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <Link
                  href="/properties"
                  data-testid="link-explore-collection"
                  className="group inline-flex items-center gap-2 rounded-sm text-[11px] font-bold uppercase tracking-[0.18em] text-[#E7E1D6] transition-colors hover:text-[#C2A063] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2A063] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0B0B0B]"
                >
                  Explorar a Coleção
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="mt-14 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A938A]">
                <span className="flex items-center gap-2">
                  <BadgeCheck className="h-3.5 w-3.5 text-[#C2A063]" />
                  Confidencialidade Absoluta
                </span>
                <span className="hidden h-3 w-px bg-white/15 sm:inline-block" />
                <span className="flex items-center gap-2">
                  <Diamond className="h-3 w-3 text-[#C2A063]" />
                  Acesso Off-Market
                </span>
                <span className="hidden h-3 w-px bg-white/15 sm:inline-block" />
                <span className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#C2A063]" />
                  Consultoria Dedicada
                </span>
              </div>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureItem({ icon: Icon, text, last }: { icon: any, text: string, last?: boolean }) {
  return (
    <div className="flex items-center gap-4 md:gap-6">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-[#C2A063] shrink-0" />
        <span className="text-[10px] font-bold tracking-[0.18em] text-[#9A938A] uppercase whitespace-nowrap">{text}</span>
      </div>
      {!last && <span className="hidden md:inline-block h-4 w-px bg-white/10"></span>}
    </div>
  );
}

function ArrivalFeature({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 shrink-0 rounded-full bg-[#C2A063]/10 border border-[#C2A063]/25 flex items-center justify-center text-[#C2A063]">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h4 className="text-[11px] font-bold tracking-[0.2em] text-white uppercase mb-2">{title}</h4>
        <p className="text-[#9A938A] text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
