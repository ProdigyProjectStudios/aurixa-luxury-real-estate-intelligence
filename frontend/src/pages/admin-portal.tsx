import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Drawer } from "@/components/portal/drawer";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { properties, formatPrice } from "@/data/properties";
import {
  adminStats,
  adminPipeline,
  adminActivity,
  adminRequests,
  type AdminRequest,
} from "@/data/portal";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  Star,
  Plus,
  BarChart3,
  FileText,
  Settings2,
  ArrowUpRight,
  Eye,
  Activity,
  Pencil,
  Archive,
  Check,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

const REQUEST_STATUS: Record<AdminRequest["status"], string> = {
  Novo: "text-[#C2A063] border-[#C2A063]/30 bg-[#C2A063]/10",
  "Em andamento": "text-sky-300/80 border-sky-400/20 bg-sky-400/10",
  Fechado: "text-emerald-300/80 border-emerald-400/20 bg-emerald-400/10",
};

type AdminDrawer =
  | { type: "request"; id: string }
  | { type: "edit"; id: string }
  | null;

interface Override {
  name: string;
  price: number;
}

export default function AdminPortal() {
  const { toast } = useToast();
  const notify = (title: string, description: string) => toast({ title, description });

  // Featured controls — frontend-only.
  const [featured, setFeatured] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(properties.map((p) => [p.id, !!p.isPinnacle])),
  );
  const toggleFeatured = (id: string, name: string) => {
    setFeatured((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      notify(
        next[id] ? "Imóvel destacado" : "Destaque removido",
        next[id]
          ? `${name} agora aparece na vitrine Pinnacle.`
          : `${name} foi removido da vitrine Pinnacle.`,
      );
      return next;
    });
  };

  // Archived + edited property overrides — frontend-only.
  const [archived, setArchived] = useState<Set<string>>(new Set());
  const toggleArchive = (id: string, name: string) => {
    setArchived((prev) => {
      const next = new Set(prev);
      const wasArchived = next.has(id);
      if (wasArchived) next.delete(id);
      else next.add(id);
      notify(
        wasArchived ? "Imóvel reativado" : "Imóvel arquivado",
        wasArchived
          ? `${name} voltou ao portfólio ativo.`
          : `${name} foi movido para o arquivo.`,
      );
      return next;
    });
  };
  const [overrides, setOverrides] = useState<Record<string, Override>>({});

  // Requests pipeline — local mutable copy.
  const [requests, setRequests] = useState<AdminRequest[]>(adminRequests);
  const approveRequest = (id: string) => {
    const r = requests.find((x) => x.id === id);
    setRequests((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "Fechado" } : x)),
    );
    notify("Solicitação aprovada", `${r?.client ?? "Cliente"} — ${r?.property ?? ""}.`);
  };
  const archiveRequest = (id: string) => {
    const r = requests.find((x) => x.id === id);
    setRequests((prev) => prev.filter((x) => x.id !== id));
    setDrawer(null);
    notify("Solicitação arquivada", `${r?.client ?? "Cliente"} foi removido da lista.`);
  };

  const [drawer, setDrawer] = useState<AdminDrawer>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editSaved, setEditSaved] = useState(false);

  const openEdit = (id: string) => {
    const base = properties.find((p) => p.id === id);
    if (!base) return;
    const ov = overrides[id];
    setEditName(ov?.name ?? base.name);
    setEditPrice(String(ov?.price ?? base.price));
    setEditSaved(false);
    setDrawer({ type: "edit", id });
  };
  const saveEdit = () => {
    if (drawer?.type !== "edit") return;
    const price = Number(editPrice) || 0;
    setOverrides((prev) => ({ ...prev, [drawer.id]: { name: editName.trim(), price } }));
    setEditSaved(true);
    notify("Imóvel atualizado", `${editName.trim()} foi salvo.`);
  };

  const displayName = (id: string, fallback: string) => overrides[id]?.name ?? fallback;
  const displayPrice = (id: string, fallback: number) => overrides[id]?.price ?? fallback;

  const featuredCount = Object.values(featured).filter(Boolean).length;
  const activeRequest =
    drawer?.type === "request" ? requests.find((r) => r.id === drawer.id) : undefined;

  return (
    <div className="relative min-h-screen bg-[#0B0B0B] text-white">
      <Navbar />

      {/* Overview header */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-[1280px] mx-auto">
          <Reveal direction="up" distance={28}>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-[#C2A063] uppercase mb-5">
                  <Sparkles className="w-3.5 h-3.5" /> Painel do Administrador
                </div>
                <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] mb-4">
                  Visão geral da
                  <br />
                  <span className="text-[#C2A063] italic">operação</span>.
                </h1>
                <p className="text-[#9A938A] max-w-md text-sm leading-relaxed">
                  Acompanhe o portfólio, o pipeline de clientes e a performance da
                  curadoria AURIXA em tempo real.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    notify("Novo imóvel", "O cadastro de imóveis estará disponível em breve.")
                  }
                  className="flex items-center gap-2 rounded-xl bg-[#C2A063] text-black px-6 py-3.5 text-[10px] font-bold tracking-widest uppercase hover:bg-white transition-colors"
                >
                  <Plus className="w-4 h-4" /> Novo imóvel
                </button>
                <button
                  onClick={() =>
                    notify("Relatório", "O relatório completo estará disponível em breve.")
                  }
                  className="flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 text-[10px] font-bold tracking-widest uppercase text-white hover:border-[#C2A063] hover:text-[#C2A063] transition-colors"
                >
                  <FileText className="w-4 h-4" /> Relatório
                </button>
              </div>
            </div>
          </Reveal>

          {/* Stat cards */}
          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {adminStats.map((s) => (
              <StaggerItem key={s.label}>
                <div className="rounded-2xl border border-white/5 bg-[#161514] p-6 h-full hover:border-[#C2A063]/30 transition-colors">
                  <div className="text-[10px] font-bold tracking-widest text-[#9A938A] uppercase mb-4">
                    {s.label}
                  </div>
                  <div className="font-serif text-3xl mb-3">{s.value}</div>
                  <div
                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                      s.positive ? "text-emerald-300/80" : "text-rose-300/80"
                    }`}
                  >
                    {s.positive ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {s.delta}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-6 pb-16 space-y-16">
        {/* Pipeline */}
        <section>
          <SectionHeader eyebrow="Pipeline" title="Funil de clientes" />
          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminPipeline.map((stage, i) => (
              <StaggerItem key={stage.label}>
                <div className="relative rounded-2xl border border-white/5 bg-[#161514] p-6 h-full hover:border-[#C2A063]/30 transition-colors">
                  <div className="text-[10px] font-bold tracking-widest text-[#9A938A] uppercase mb-5">
                    Etapa {i + 1}
                  </div>
                  <div className="font-serif text-4xl text-[#C2A063] mb-3">{stage.count}</div>
                  <div className="text-sm text-white mb-1">{stage.label}</div>
                  <div className="text-xs text-[#9A938A]">{stage.hint}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>

        {/* Property management + activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property controls */}
          <div className="lg:col-span-2">
            <SectionHeader
              eyebrow="Gestão de portfólio"
              title="Controle de imóveis"
              meta={`${featuredCount} em destaque`}
            />
            <Reveal scale={0.98} blur={5}>
              <div className="rounded-2xl border border-white/5 bg-[#161514] overflow-hidden">
                {properties.slice(0, 6).map((p, i) => {
                  const isArchived = archived.has(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-4 p-4 transition-colors ${
                        i !== 0 ? "border-t border-white/5" : ""
                      } ${isArchived ? "opacity-40" : "hover:bg-white/[0.02]"}`}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-serif text-lg truncate flex items-center gap-2">
                          {displayName(p.id, p.name)}
                          {isArchived && (
                            <span className="text-[9px] font-bold tracking-widest uppercase text-[#9A938A] border border-white/10 rounded-full px-2 py-0.5">
                              Arquivado
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-bold tracking-widest text-[#9A938A] uppercase">
                          {p.location} • {p.state}
                        </div>
                      </div>
                      <div className="hidden lg:block text-sm text-[#C2A063] font-serif whitespace-nowrap">
                        {formatPrice(displayPrice(p.id, p.price))}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleFeatured(p.id, displayName(p.id, p.name))}
                          aria-pressed={featured[p.id]}
                          aria-label="Destacar imóvel"
                          title={featured[p.id] ? "Remover destaque" : "Destacar"}
                          className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${
                            featured[p.id]
                              ? "bg-[#C2A063] text-black border-[#C2A063]"
                              : "text-[#9A938A] border-white/15 hover:border-[#C2A063] hover:text-[#C2A063]"
                          }`}
                        >
                          <Star className={`w-4 h-4 ${featured[p.id] ? "fill-black" : ""}`} />
                        </button>
                        <button
                          onClick={() => openEdit(p.id)}
                          aria-label="Editar imóvel"
                          title="Editar"
                          className="w-9 h-9 rounded-full flex items-center justify-center border text-[#9A938A] border-white/15 hover:border-[#C2A063] hover:text-[#C2A063] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleArchive(p.id, displayName(p.id, p.name))}
                          aria-label={isArchived ? "Reativar imóvel" : "Arquivar imóvel"}
                          title={isArchived ? "Reativar" : "Arquivar"}
                          className="w-9 h-9 rounded-full flex items-center justify-center border text-[#9A938A] border-white/15 hover:border-[#C2A063] hover:text-[#C2A063] transition-colors"
                        >
                          {isArchived ? (
                            <RotateCcw className="w-4 h-4" />
                          ) : (
                            <Archive className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>

          {/* Client activity */}
          <div>
            <SectionHeader eyebrow="Tempo real" title="Atividade recente" />
            <div className="space-y-3">
              {adminActivity.map((a) => (
                <Reveal key={a.id} direction="right" distance={22}>
                  <div className="rounded-2xl border border-white/5 bg-[#161514] p-4 flex items-start gap-3 hover:border-[#C2A063]/30 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-[#C2A063]/10 border border-[#C2A063]/30 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4 text-[#C2A063]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">
                        <span className="text-white font-medium">{a.name}</span>{" "}
                        <span className="text-[#9A938A]">{a.action}</span>{" "}
                        <span className="text-[#C2A063]">{a.property}</span>
                      </p>
                      <span className="text-[10px] text-[#9A938A] tracking-widest uppercase">
                        {a.time}
                      </span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <section>
          <SectionHeader eyebrow="Atalhos" title="Ações rápidas" />
          <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Building2, label: "Gerenciar imóveis", desc: "Editar portfólio" },
              { icon: Users, label: "Clientes", desc: "Base de leads" },
              { icon: BarChart3, label: "Analytics", desc: "Desempenho" },
              { icon: Settings2, label: "Configurações", desc: "Preferências" },
            ].map((q) => (
              <StaggerItem key={q.label}>
                <button
                  onClick={() => notify(q.label, "Esta seção estará disponível em breve.")}
                  className="group w-full text-left rounded-2xl border border-white/5 bg-[#161514] p-6 h-full hover:border-[#C2A063]/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-6">
                    <q.icon className="w-5 h-5 text-[#C2A063]" />
                    <ArrowUpRight className="w-4 h-4 text-[#9A938A] group-hover:text-[#C2A063] transition-colors" />
                  </div>
                  <div className="font-serif text-lg mb-1">{q.label}</div>
                  <div className="text-xs text-[#9A938A]">{q.desc}</div>
                </button>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>

        {/* Recent requests table */}
        <section>
          <SectionHeader eyebrow="Solicitações" title="Pedidos recentes" />
          <Reveal scale={0.98} blur={5}>
            <div className="rounded-2xl border border-white/5 bg-[#161514] overflow-hidden">
              <div className="hidden md:grid grid-cols-[1.4fr_1.6fr_0.9fr_1.1fr_0.9fr_auto] gap-4 px-6 py-4 border-b border-white/5 text-[10px] font-bold tracking-widest text-[#9A938A] uppercase">
                <span>Cliente</span>
                <span>Imóvel</span>
                <span>Tipo</span>
                <span>Valor</span>
                <span>Status</span>
                <span className="text-right">Ação</span>
              </div>
              {requests.length === 0 ? (
                <div className="px-6 py-16 text-center text-sm text-[#9A938A]">
                  Nenhuma solicitação pendente.
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {requests.map((r) => (
                    <motion.div
                      key={r.id}
                      layout
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 md:grid-cols-[1.4fr_1.6fr_0.9fr_1.1fr_0.9fr_auto] gap-2 md:gap-4 px-6 py-5 border-b border-white/5 last:border-0 md:items-center hover:bg-white/[0.02] transition-colors overflow-hidden"
                    >
                      <div className="font-medium text-white">{r.client}</div>
                      <div className="text-sm text-[#9A938A] truncate">{r.property}</div>
                      <div className="text-xs text-[#9A938A]">
                        <span className="md:hidden text-[#C2A063] mr-2">Tipo:</span>
                        {r.type}
                      </div>
                      <div className="text-sm font-serif text-[#C2A063]">{r.value}</div>
                      <div>
                        <span
                          className={`inline-block text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${REQUEST_STATUS[r.status]}`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <div className="md:text-right">
                        <button
                          onClick={() => setDrawer({ type: "request", id: r.id })}
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[#C2A063] hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </Reveal>
        </section>
      </div>

      {/* Request detail drawer */}
      <Drawer
        open={drawer?.type === "request" && !!activeRequest}
        onClose={() => setDrawer(null)}
        eyebrow="Solicitação"
        title={activeRequest ? activeRequest.client : "Solicitação"}
      >
        {activeRequest && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${REQUEST_STATUS[activeRequest.status]}`}
              >
                {activeRequest.status}
              </span>
              <span className="text-[10px] text-[#9A938A] tracking-widest uppercase">
                {activeRequest.date}
              </span>
            </div>

            <div className="space-y-4">
              <DetailRow label="Imóvel" value={activeRequest.property} />
              <DetailRow label="Tipo de solicitação" value={activeRequest.type} />
              <DetailRow label="Valor de referência" value={activeRequest.value} accent />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => approveRequest(activeRequest.id)}
                disabled={activeRequest.status === "Fechado"}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#C2A063] text-black py-3.5 text-[10px] font-bold tracking-widest uppercase hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                {activeRequest.status === "Fechado" ? "Aprovada" : "Aprovar solicitação"}
              </button>
              <button
                onClick={() => archiveRequest(activeRequest.id)}
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/15 py-3.5 text-[10px] font-bold tracking-widest uppercase text-white hover:border-rose-400/40 hover:text-rose-300/80 transition-colors"
              >
                <Archive className="w-4 h-4" /> Arquivar
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Edit property drawer */}
      <Drawer
        open={drawer?.type === "edit"}
        onClose={() => setDrawer(null)}
        eyebrow="Editar imóvel"
        title={drawer?.type === "edit" ? displayName(drawer.id, "") : "Editar"}
      >
        <AnimatePresence mode="wait">
          {editSaved ? (
            <motion.div
              key="ok"
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
              <h4 className="font-serif text-2xl mb-3">Alterações salvas</h4>
              <p className="text-sm text-[#9A938A] leading-relaxed max-w-xs mb-8">
                As informações do imóvel foram atualizadas no painel.
              </p>
              <button
                onClick={() => setDrawer(null)}
                className="rounded-xl border border-white/15 px-8 py-3 text-[10px] font-bold tracking-widest uppercase text-white hover:border-[#C2A063] hover:text-[#C2A063] transition-colors"
              >
                Concluir
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <div className="text-[10px] font-bold tracking-widest text-[#9A938A] uppercase mb-3">
                  Nome do imóvel
                </div>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl bg-[#161514] border border-white/10 px-4 py-3 text-sm text-white focus:border-[#C2A063] outline-none"
                />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-widest text-[#9A938A] uppercase mb-3">
                  Valor (R$)
                </div>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full rounded-xl bg-[#161514] border border-white/10 px-4 py-3 text-sm text-white focus:border-[#C2A063] outline-none"
                />
                {Number(editPrice) > 0 && (
                  <div className="text-xs text-[#C2A063] mt-2 font-serif">
                    {formatPrice(Number(editPrice))}
                  </div>
                )}
              </div>
              <button
                onClick={saveEdit}
                disabled={editName.trim().length === 0}
                className="w-full rounded-xl bg-[#C2A063] text-black py-4 text-[11px] font-bold tracking-widest uppercase hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Salvar alterações
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer>

      <Footer />
    </div>
  );
}

function DetailRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#161514] px-5 py-4">
      <span className="text-[10px] font-bold tracking-widest text-[#9A938A] uppercase">
        {label}
      </span>
      <span className={`text-sm ${accent ? "font-serif text-[#C2A063] text-lg" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  meta,
}: {
  eyebrow: string;
  title: string;
  meta?: string;
}) {
  return (
    <Reveal direction="up" distance={20} className="mb-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-[0.25em] text-[#C2A063] uppercase mb-3">
            {eyebrow}
          </div>
          <h2 className="font-serif text-3xl md:text-4xl">{title}</h2>
        </div>
        {meta && (
          <span className="text-[10px] font-bold tracking-widest text-[#9A938A] uppercase whitespace-nowrap pb-1">
            {meta}
          </span>
        )}
      </div>
    </Reveal>
  );
}
