import { useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PropertyCard } from "@/components/property/property-card";
import { Drawer } from "@/components/portal/drawer";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { properties } from "@/data/properties";
import {
  savedProperties,
  recommendedProperties,
  clientInquiries,
  clientViewings,
  clientMessages,
  clientPreferences,
  type Inquiry,
  type Viewing,
} from "@/data/portal";
import { agents } from "@/data/agents";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  Heart,
  CalendarDays,
  MessageSquare,
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  Mail,
  Bell,
  ChevronRight,
  Video,
  Star,
  Check,
  CheckCircle2,
} from "lucide-react";

const STATUS_STYLES: Record<Inquiry["status"], string> = {
  Confirmada: "text-[#C2A063] border-[#C2A063]/30 bg-[#C2A063]/10",
  "Em análise": "text-[#9A938A] border-white/10 bg-white/5",
  Aguardando: "text-[#9A938A] border-white/10 bg-white/5",
  Concluída: "text-emerald-300/80 border-emerald-400/20 bg-emerald-400/10",
};

const TABS = ["Visão Geral", "Salvos", "Agenda", "Mensagens"] as const;
type Tab = (typeof TABS)[number];

type DrawerState =
  | { type: "schedule"; viewing?: Viewing }
  | { type: "message"; to: string }
  | { type: "inquiry"; inquiry: Inquiry }
  | null;

const TIME_SLOTS = ["10:00", "11:30", "14:00", "15:30", "17:00"];

export default function ClientPortal() {
  const [activeTab, setActiveTab] = useState<Tab>("Visão Geral");
  const { toast } = useToast();
  const advisor = agents[0];

  // Saved properties — frontend-only local state.
  const [savedIds, setSavedIds] = useState<Set<string>>(
    new Set(savedProperties.map((p) => p.id)),
  );
  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      const wasSaved = next.has(id);
      if (wasSaved) next.delete(id);
      else next.add(id);
      const name = properties.find((p) => p.id === id)?.name ?? "Imóvel";
      toast({
        title: wasSaved ? "Removido dos salvos" : "Imóvel salvo",
        description: wasSaved
          ? `${name} foi removido da sua coleção.`
          : `${name} foi adicionado à sua coleção privada.`,
      });
      return next;
    });
  };
  const savedList = properties.filter((p) => savedIds.has(p.id));

  // Slide-over panel state.
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [submitted, setSubmitted] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState(TIME_SLOTS[0]);
  const [scheduleMode, setScheduleMode] = useState<"Presencial" | "Virtual">("Presencial");
  const [messageText, setMessageText] = useState("");

  const openDrawer = (d: DrawerState) => {
    setSubmitted(false);
    setMessageText("");
    setScheduleDate("");
    setScheduleTime(TIME_SLOTS[0]);
    setScheduleMode("Presencial");
    setDrawer(d);
  };
  const closeDrawer = () => setDrawer(null);

  return (
    <div className="relative min-h-screen bg-[#0B0B0B] text-white">
      <Navbar />

      {/* Welcome / Header */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          <Reveal direction="up" distance={28}>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-[#C2A063] uppercase mb-5">
                  <Sparkles className="w-3.5 h-3.5" /> Área do Cliente
                </div>
                <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] mb-4">
                  Bem-vindo de volta,
                  <br />
                  <span className="text-[#C2A063] italic">Eduardo</span>.
                </h1>
                <p className="text-[#9A938A] max-w-md text-sm leading-relaxed">
                  Sua curadoria pessoal, agendamentos e conversas com a consultoria
                  AURIXA — reunidos em um único espaço discreto.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#161514] p-5 min-w-[260px]">
                <div className="w-14 h-14 rounded-full bg-[#C2A063]/10 border border-[#C2A063]/30 flex items-center justify-center">
                  <Star className="w-6 h-6 text-[#C2A063]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-[#9A938A] uppercase mb-1">
                    Membro Pinnacle
                  </div>
                  <div className="font-serif text-xl">Acesso Privilégio</div>
                  <div className="text-xs text-[#9A938A] mt-0.5">Desde 2023</div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Quick stats */}
          <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {[
              { icon: Heart, label: "Imóveis salvos", value: String(savedIds.size) },
              { icon: CalendarDays, label: "Visitas agendadas", value: String(clientViewings.length) },
              { icon: MessageSquare, label: "Conversas ativas", value: String(clientMessages.length) },
              { icon: Bell, label: "Novas indicações", value: String(recommendedProperties.length) },
            ].map((s) => (
              <StaggerItem key={s.label}>
                <div className="rounded-2xl border border-white/5 bg-[#161514] p-6 h-full hover:border-[#C2A063]/30 transition-colors">
                  <s.icon className="w-5 h-5 text-[#C2A063] mb-6" />
                  <div className="font-serif text-3xl mb-1">{s.value}</div>
                  <div className="text-[10px] font-bold tracking-widest text-[#9A938A] uppercase">
                    {s.label}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-14 z-30 bg-[#0B0B0B]/90 backdrop-blur-md border-y border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 flex gap-8 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[11px] font-bold tracking-widest uppercase py-5 whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab
                  ? "text-[#C2A063] border-[#C2A063]"
                  : "text-[#9A938A] border-transparent hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-14">
        {/* OVERVIEW */}
        {activeTab === "Visão Geral" && (
          <div className="space-y-16">
            {/* Inquiries */}
            <section>
              <SectionHeader eyebrow="Solicitações" title="Status das suas consultas" />
              <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {clientInquiries.map((inq) => (
                  <StaggerItem key={inq.id}>
                    <div className="rounded-2xl border border-white/5 bg-[#161514] p-6 h-full hover:border-[#C2A063]/30 transition-colors">
                      <div className="flex items-center justify-between mb-5">
                        <span
                          className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${STATUS_STYLES[inq.status]}`}
                        >
                          {inq.status}
                        </span>
                        <span className="text-[10px] text-[#9A938A] tracking-widest uppercase">
                          {inq.date}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl mb-2">{inq.propertyName}</h3>
                      <div className="text-xs text-[#9A938A] mb-5">
                        Consultor: {inq.advisor}
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => openDrawer({ type: "inquiry", inquiry: inq })}
                          className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-[#C2A063] hover:text-white transition-colors"
                        >
                          Ver detalhes <ArrowRight className="w-3 h-3" />
                        </button>
                        <Link
                          href={`/property/${inq.propertyId}`}
                          className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-[#9A938A] hover:text-white transition-colors"
                        >
                          Ver imóvel
                        </Link>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </section>

            {/* Saved + Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SectionHeader eyebrow="Curadoria" title="Imóveis salvos" />
                {savedList.length === 0 ? (
                  <EmptyState
                    icon={Heart}
                    title="Sua coleção está vazia"
                    description="Salve imóveis para acompanhá-los aqui."
                    cta="Explorar imóveis"
                  />
                ) : (
                  <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
                    {savedList.slice(0, 2).map((p) => (
                      <StaggerItem key={p.id}>
                        <PropertyCard
                          property={p}
                          saved={savedIds.has(p.id)}
                          onToggleSave={toggleSave}
                        />
                      </StaggerItem>
                    ))}
                  </StaggerGroup>
                )}
              </div>

              <div>
                <SectionHeader eyebrow="Agenda" title="Próximas visitas" />
                <div className="space-y-4">
                  {clientViewings.map((v) => (
                    <Reveal key={v.id} direction="right" distance={24}>
                      <div className="rounded-2xl border border-white/5 bg-[#161514] p-5 hover:border-[#C2A063]/30 transition-colors">
                        <div className="flex items-center gap-2 text-[#C2A063] mb-3">
                          {v.mode === "Virtual" ? (
                            <Video className="w-4 h-4" />
                          ) : (
                            <MapPin className="w-4 h-4" />
                          )}
                          <span className="text-[10px] font-bold tracking-widest uppercase">
                            {v.mode}
                          </span>
                        </div>
                        <h4 className="font-serif text-lg mb-1">{v.propertyName}</h4>
                        <div className="text-xs text-[#9A938A] mb-4">{v.location}</div>
                        <div className="flex items-center gap-4 text-xs text-white border-t border-white/5 pt-4">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-[#C2A063]" />
                            {v.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#C2A063]" />
                            {v.time}
                          </span>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                  <Reveal direction="up">
                    <button
                      onClick={() => openDrawer({ type: "schedule" })}
                      className="w-full rounded-2xl border border-dashed border-white/10 p-5 text-[11px] font-bold tracking-widest uppercase text-[#9A938A] hover:border-[#C2A063] hover:text-[#C2A063] transition-colors"
                    >
                      + Agendar nova visita
                    </button>
                  </Reveal>
                </div>
              </div>
            </div>

            <PreferencesBlock />
            <RecommendedBlock savedIds={savedIds} onToggleSave={toggleSave} />
            <ConciergeBlock
              advisor={advisor}
              onMessage={() => openDrawer({ type: "message", to: advisor.name })}
              onCall={() =>
                toast({
                  title: "Conectando...",
                  description: `${advisor.name} • ${advisor.phone}`,
                })
              }
            />
          </div>
        )}

        {/* SAVED */}
        {activeTab === "Salvos" && (
          <div className="space-y-10">
            <SectionHeader eyebrow="Curadoria pessoal" title="Sua coleção privada" />
            {savedList.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="Nenhum imóvel salvo ainda"
                description="Explore a coleção AURIXA e salve as residências que despertam o seu interesse."
                cta="Explorar imóveis"
              />
            ) : (
              <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                <AnimatePresence mode="popLayout">
                  {savedList.map((p) => (
                    <motion.div
                      key={p.id}
                      layout
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PropertyCard
                        property={p}
                        saved={savedIds.has(p.id)}
                        onToggleSave={toggleSave}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </StaggerGroup>
            )}
          </div>
        )}

        {/* SCHEDULE */}
        {activeTab === "Agenda" && (
          <div className="space-y-10">
            <SectionHeader eyebrow="Agenda" title="Suas visitas" />
            <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clientViewings.map((v) => (
                <StaggerItem key={v.id}>
                  <div className="rounded-2xl border border-white/5 bg-[#161514] p-7 hover:border-[#C2A063]/30 transition-colors">
                    <div className="flex items-center justify-between mb-5">
                      <span className="flex items-center gap-2 text-[#C2A063] text-[10px] font-bold tracking-widest uppercase">
                        {v.mode === "Virtual" ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                        {v.mode}
                      </span>
                      <span className="text-xs text-[#9A938A]">
                        {v.date} • {v.time}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl mb-1">{v.propertyName}</h3>
                    <div className="text-xs text-[#9A938A] mb-6">{v.location}</div>
                    <div className="flex gap-3">
                      <Link
                        href={`/property/${v.propertyId}`}
                        className="flex-1 text-center rounded-xl bg-[#C2A063] text-black py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-white transition-colors"
                      >
                        Ver imóvel
                      </Link>
                      <button
                        onClick={() => openDrawer({ type: "schedule", viewing: v })}
                        className="flex-1 rounded-xl border border-white/15 py-3 text-[10px] font-bold tracking-widest uppercase text-white hover:border-[#C2A063] hover:text-[#C2A063] transition-colors"
                      >
                        Reagendar
                      </button>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        )}

        {/* MESSAGES */}
        {activeTab === "Mensagens" && (
          <div className="space-y-10">
            <SectionHeader eyebrow="Concierge" title="Suas conversas" />
            <div className="space-y-4">
              {clientMessages.map((m) => (
                <Reveal key={m.id} direction="up" distance={24}>
                  <button
                    onClick={() => openDrawer({ type: "message", to: m.from })}
                    className="w-full text-left rounded-2xl border border-white/5 bg-[#161514] p-6 flex items-start gap-5 hover:border-[#C2A063]/30 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#C2A063]/10 border border-[#C2A063]/30 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-[#C2A063]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-lg">{m.from}</span>
                          {m.unread && <span className="w-2 h-2 rounded-full bg-[#C2A063]" />}
                        </div>
                        <span className="text-[10px] text-[#9A938A] tracking-widest uppercase">
                          {m.time}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold tracking-widest text-[#C2A063] uppercase mb-2">
                        {m.role}
                      </div>
                      <p className="text-sm text-[#9A938A] leading-relaxed line-clamp-2">
                        {m.preview}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9A938A] flex-shrink-0 mt-1" />
                  </button>
                </Reveal>
              ))}
            </div>
            <ConciergeBlock
              advisor={advisor}
              onMessage={() => openDrawer({ type: "message", to: advisor.name })}
              onCall={() =>
                toast({
                  title: "Conectando...",
                  description: `${advisor.name} • ${advisor.phone}`,
                })
              }
            />
          </div>
        )}
      </div>

      {/* Drawer / slide-over panels */}
      <Drawer
        open={drawer?.type === "schedule"}
        onClose={closeDrawer}
        eyebrow={drawer?.type === "schedule" && drawer.viewing ? "Reagendar visita" : "Agendar visita"}
        title={
          drawer?.type === "schedule" && drawer.viewing
            ? drawer.viewing.propertyName
            : "Visita privativa"
        }
      >
        <AnimatePresence mode="wait">
          {submitted ? (
            <SuccessPanel
              key="ok"
              title="Visita solicitada"
              description="Nossa equipe confirmará o horário por e-mail em instantes. Você receberá os detalhes de acesso assim que aprovado."
              onClose={closeDrawer}
            />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <Field label="Modalidade">
                <div className="grid grid-cols-2 gap-3">
                  {(["Presencial", "Virtual"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setScheduleMode(mode)}
                      className={`rounded-xl border py-3 text-[10px] font-bold tracking-widest uppercase transition-colors ${
                        scheduleMode === mode
                          ? "bg-[#C2A063] text-black border-[#C2A063]"
                          : "border-white/15 text-[#9A938A] hover:border-[#C2A063] hover:text-[#C2A063]"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Data preferencial">
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full rounded-xl bg-[#161514] border border-white/10 px-4 py-3 text-sm text-white focus:border-[#C2A063] outline-none [color-scheme:dark]"
                />
              </Field>
              <Field label="Horário">
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setScheduleTime(slot)}
                      className={`rounded-lg border px-4 py-2 text-xs font-medium transition-colors ${
                        scheduleTime === slot
                          ? "bg-[#C2A063] text-black border-[#C2A063]"
                          : "border-white/15 text-[#9A938A] hover:border-[#C2A063] hover:text-[#C2A063]"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </Field>
              <button
                onClick={() => setSubmitted(true)}
                className="w-full rounded-xl bg-[#C2A063] text-black py-4 text-[11px] font-bold tracking-widest uppercase hover:bg-white transition-colors"
              >
                Confirmar solicitação
              </button>
              <p className="text-[11px] text-[#9A938A] text-center leading-relaxed">
                Sem compromisso. Um consultor confirma a disponibilidade antes da visita.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer>

      <Drawer
        open={drawer?.type === "message"}
        onClose={closeDrawer}
        eyebrow="Concierge AURIXA"
        title={drawer?.type === "message" ? drawer.to : "Mensagem"}
      >
        <AnimatePresence mode="wait">
          {submitted ? (
            <SuccessPanel
              key="ok"
              title="Mensagem enviada"
              description={`${drawer?.type === "message" ? drawer.to : "Seu consultor"} responderá em instantes. Acompanhe a conversa na aba Mensagens.`}
              onClose={closeDrawer}
            />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#161514] p-4">
                <img
                  src={advisor.image}
                  alt={advisor.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#C2A063]/30"
                />
                <div>
                  <div className="font-serif text-lg leading-none mb-1">{advisor.name}</div>
                  <div className="text-[10px] tracking-widest text-[#C2A063] uppercase">
                    {advisor.role}
                  </div>
                </div>
              </div>
              <Field label="Sua mensagem">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={5}
                  placeholder="Como podemos ajudar com a sua busca?"
                  className="w-full rounded-xl bg-[#161514] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-[#9A938A]/60 focus:border-[#C2A063] outline-none resize-none"
                />
              </Field>
              <button
                onClick={() => setSubmitted(true)}
                disabled={messageText.trim().length === 0}
                className="w-full rounded-xl bg-[#C2A063] text-black py-4 text-[11px] font-bold tracking-widest uppercase hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Enviar mensagem
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer>

      <Drawer
        open={drawer?.type === "inquiry"}
        onClose={closeDrawer}
        eyebrow="Detalhes da consulta"
        title={drawer?.type === "inquiry" ? drawer.inquiry.propertyName : "Consulta"}
      >
        {drawer?.type === "inquiry" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${STATUS_STYLES[drawer.inquiry.status]}`}
              >
                {drawer.inquiry.status}
              </span>
              <span className="text-[10px] text-[#9A938A] tracking-widest uppercase">
                {drawer.inquiry.date}
              </span>
            </div>

            <div>
              <div className="text-[10px] font-bold tracking-widest text-[#9A938A] uppercase mb-4">
                Linha do tempo
              </div>
              <ol className="space-y-5">
                {[
                  { label: "Consulta recebida", done: true },
                  { label: "Consultor designado", done: true },
                  {
                    label: "Visita confirmada",
                    done: drawer.inquiry.status === "Confirmada",
                  },
                  { label: "Proposta", done: false },
                ].map((step, i, arr) => (
                  <li key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                          step.done
                            ? "bg-[#C2A063] border-[#C2A063] text-black"
                            : "border-white/15 text-[#9A938A]"
                        }`}
                      >
                        {step.done ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        )}
                      </span>
                      {i < arr.length - 1 && (
                        <span className="w-px flex-1 min-h-[20px] bg-white/10 my-1" />
                      )}
                    </div>
                    <span
                      className={`text-sm pt-0.5 ${step.done ? "text-white" : "text-[#9A938A]"}`}
                    >
                      {step.label}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#161514] p-5">
              <div className="text-[10px] font-bold tracking-widest text-[#9A938A] uppercase mb-1">
                Consultor responsável
              </div>
              <div className="font-serif text-lg">{drawer.inquiry.advisor}</div>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/property/${drawer.inquiry.propertyId}`}
                className="flex-1 text-center rounded-xl bg-[#C2A063] text-black py-3.5 text-[10px] font-bold tracking-widest uppercase hover:bg-white transition-colors"
              >
                Ver imóvel
              </Link>
              <button
                onClick={() => {
                  const to = drawer.inquiry.advisor;
                  openDrawer({ type: "message", to });
                }}
                className="flex-1 rounded-xl border border-white/15 py-3.5 text-[10px] font-bold tracking-widest uppercase text-white hover:border-[#C2A063] hover:text-[#C2A063] transition-colors"
              >
                Falar com consultor
              </button>
            </div>
          </div>
        )}
      </Drawer>

      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold tracking-widest text-[#9A938A] uppercase mb-3">
        {label}
      </div>
      {children}
    </div>
  );
}

function SuccessPanel({
  title,
  description,
  onClose,
}: {
  title: string;
  description: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center text-center pt-8"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 200, damping: 16 }}
        className="w-16 h-16 rounded-full bg-[#C2A063]/10 border border-[#C2A063]/30 flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="w-8 h-8 text-[#C2A063]" />
      </motion.div>
      <h4 className="font-serif text-2xl mb-3">{title}</h4>
      <p className="text-sm text-[#9A938A] leading-relaxed max-w-xs mb-8">{description}</p>
      <button
        onClick={onClose}
        className="rounded-xl border border-white/15 px-8 py-3 text-[10px] font-bold tracking-widest uppercase text-white hover:border-[#C2A063] hover:text-[#C2A063] transition-colors"
      >
        Concluir
      </button>
    </motion.div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Reveal direction="up" distance={20} className="mb-7">
      <div className="text-[11px] font-bold tracking-[0.25em] text-[#C2A063] uppercase mb-3">
        {eyebrow}
      </div>
      <h2 className="font-serif text-3xl md:text-4xl">{title}</h2>
    </Reveal>
  );
}

function PreferencesBlock() {
  return (
    <section>
      <SectionHeader eyebrow="Perfil" title="Suas preferências" />
      <Reveal scale={0.98} blur={5}>
        <div className="rounded-2xl border border-white/5 bg-[#161514] p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
            {clientPreferences.map((pref) => (
              <div key={pref.label}>
                <div className="text-[10px] font-bold tracking-widest text-[#9A938A] uppercase mb-2">
                  {pref.label}
                </div>
                <div className="text-white font-serif text-lg">{pref.value}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function RecommendedBlock({
  savedIds,
  onToggleSave,
}: {
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
}) {
  return (
    <section>
      <SectionHeader eyebrow="Selecionados para você" title="Recomendações da curadoria" />
      <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        {recommendedProperties.map((p) => (
          <StaggerItem key={p.id}>
            <PropertyCard property={p} saved={savedIds.has(p.id)} onToggleSave={onToggleSave} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

function ConciergeBlock({
  advisor,
  onMessage,
  onCall,
}: {
  advisor: { name: string; role: string; phone: string; image: string };
  onMessage: () => void;
  onCall: () => void;
}) {
  return (
    <Reveal scale={0.98} blur={5}>
      <div className="rounded-2xl border border-[#C2A063]/20 bg-gradient-to-br from-[#161514] to-[#1c1813] p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex items-center gap-5">
          <img
            src={advisor.image}
            alt={advisor.name}
            className="w-16 h-16 rounded-full object-cover border border-[#C2A063]/40"
          />
          <div>
            <div className="text-[10px] font-bold tracking-widest text-[#C2A063] uppercase mb-1">
              Seu concierge dedicado
            </div>
            <div className="font-serif text-2xl">{advisor.name}</div>
            <div className="text-xs text-[#9A938A]">{advisor.role}</div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCall}
            className="flex items-center gap-2 rounded-xl bg-[#C2A063] text-black px-6 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-white transition-colors"
          >
            <Phone className="w-4 h-4" /> Ligar
          </button>
          <button
            onClick={onMessage}
            className="flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3 text-[10px] font-bold tracking-widest uppercase text-white hover:border-[#C2A063] hover:text-[#C2A063] transition-colors"
          >
            <Mail className="w-4 h-4" /> Mensagem
          </button>
        </div>
      </div>
    </Reveal>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
}: {
  icon: typeof Heart;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Reveal scale={0.98} blur={5}>
      <div className="rounded-2xl border border-dashed border-white/10 bg-[#161514]/50 p-16 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[#C2A063]/10 border border-[#C2A063]/30 flex items-center justify-center mb-6">
          <Icon className="w-7 h-7 text-[#C2A063]" />
        </div>
        <h3 className="font-serif text-2xl mb-3">{title}</h3>
        <p className="text-sm text-[#9A938A] max-w-sm mb-8 leading-relaxed">{description}</p>
        <Link
          href="/properties"
          className="rounded-xl bg-[#C2A063] text-black px-8 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-white transition-colors"
        >
          {cta}
        </Link>
      </div>
    </Reveal>
  );
}
