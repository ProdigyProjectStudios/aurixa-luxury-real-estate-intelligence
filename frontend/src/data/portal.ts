import { properties } from "./properties";

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyName: string;
  date: string;
  status: "Em análise" | "Confirmada" | "Aguardando" | "Concluída";
  advisor: string;
}

export interface Viewing {
  id: string;
  propertyId: string;
  propertyName: string;
  location: string;
  date: string;
  time: string;
  mode: "Presencial" | "Virtual";
}

export interface PortalMessage {
  id: string;
  from: string;
  role: string;
  preview: string;
  time: string;
  unread: boolean;
}

export interface Preference {
  label: string;
  value: string;
}

/** Curated/saved selection for the client portal — drawn from the catalog. */
export const savedProperties = properties.filter((p) =>
  ["1", "3", "6"].includes(p.id),
);

export const recommendedProperties = properties.filter((p) =>
  ["9", "5", "7"].includes(p.id),
);

export const clientInquiries: Inquiry[] = [
  {
    id: "inq-1",
    propertyId: "1",
    propertyName: "Iconic Residence",
    date: "12 Jun 2026",
    status: "Confirmada",
    advisor: "Isabella Mendes",
  },
  {
    id: "inq-2",
    propertyId: "6",
    propertyName: "Villa Esmeralda",
    date: "09 Jun 2026",
    status: "Em análise",
    advisor: "Isabella Mendes",
  },
  {
    id: "inq-3",
    propertyId: "3",
    propertyName: "Reserva à Beira-Mar Lumina",
    date: "04 Jun 2026",
    status: "Aguardando",
    advisor: "Isabella Mendes",
  },
];

export const clientViewings: Viewing[] = [
  {
    id: "v-1",
    propertyId: "1",
    propertyName: "Iconic Residence",
    location: "Jardins, SP",
    date: "Sex, 12 Jun",
    time: "15:00",
    mode: "Presencial",
  },
  {
    id: "v-2",
    propertyId: "9",
    propertyName: "Penthouse Diamond",
    location: "Ipanema, SP",
    date: "Ter, 16 Jun",
    time: "11:30",
    mode: "Virtual",
  },
];

export const clientMessages: PortalMessage[] = [
  {
    id: "m-1",
    from: "Isabella Mendes",
    role: "Consultora de Luxo",
    preview:
      "Reservei uma visita privativa ao Iconic Residence. Confirmo os detalhes em breve.",
    time: "08:42",
    unread: true,
  },
  {
    id: "m-2",
    from: "Concierge AURIXA",
    role: "Atendimento Exclusivo",
    preview:
      "Selecionamos três novas oportunidades alinhadas ao seu perfil de investimento.",
    time: "Ontem",
    unread: false,
  },
];

export const clientPreferences: Preference[] = [
  { label: "Localização", value: "Jardins • Ipanema • Trancoso" },
  { label: "Tipologia", value: "Cobertura • Casa de Praia" },
  { label: "Faixa de valor", value: "R$ 6M – R$ 30M" },
  { label: "Suítes mínimas", value: "4+" },
  { label: "Diferenciais", value: "Vista mar • Automação • Spa" },
  { label: "Perfil", value: "Investimento & Moradia" },
];

export interface AdminStat {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}

export interface PipelineStage {
  label: string;
  count: number;
  hint: string;
}

export interface ClientActivity {
  id: string;
  name: string;
  action: string;
  property: string;
  time: string;
}

export interface AdminRequest {
  id: string;
  client: string;
  property: string;
  type: "Visita" | "Proposta" | "Avaliação" | "Contato";
  value: string;
  status: "Novo" | "Em andamento" | "Fechado";
  date: string;
}

export const adminStats: AdminStat[] = [
  { label: "Portfólio ativo", value: "9 imóveis", delta: "+2 este mês", positive: true },
  { label: "VGV em carteira", value: "R$ 177,7M", delta: "+8,4%", positive: true },
  { label: "Leads qualificados", value: "48", delta: "+12", positive: true },
  { label: "Taxa de conversão", value: "23%", delta: "-1,2%", positive: false },
];

export const adminPipeline: PipelineStage[] = [
  { label: "Novos contatos", count: 14, hint: "Aguardando triagem" },
  { label: "Em qualificação", count: 9, hint: "Consultor designado" },
  { label: "Visitas agendadas", count: 6, hint: "Próximos 7 dias" },
  { label: "Propostas ativas", count: 3, hint: "Em negociação" },
];

export const adminActivity: ClientActivity[] = [
  {
    id: "a-1",
    name: "Eduardo Tavares",
    action: "solicitou visita",
    property: "Iconic Residence",
    time: "há 12 min",
  },
  {
    id: "a-2",
    name: "Marina Costa",
    action: "salvou",
    property: "Penthouse Diamond",
    time: "há 1 h",
  },
  {
    id: "a-3",
    name: "Henrique Lopes",
    action: "enviou proposta para",
    property: "Residencial Executivo Skyline",
    time: "há 3 h",
  },
  {
    id: "a-4",
    name: "Camila Reis",
    action: "pediu avaliação de",
    property: "Villa Esmeralda",
    time: "há 5 h",
  },
];

export const adminRequests: AdminRequest[] = [
  {
    id: "r-1",
    client: "Eduardo Tavares",
    property: "Iconic Residence",
    type: "Visita",
    value: "R$ 28.000.000",
    status: "Novo",
    date: "12 Jun",
  },
  {
    id: "r-2",
    client: "Henrique Lopes",
    property: "Residencial Executivo Skyline",
    type: "Proposta",
    value: "R$ 45.000.000",
    status: "Em andamento",
    date: "11 Jun",
  },
  {
    id: "r-3",
    client: "Camila Reis",
    property: "Villa Esmeralda",
    type: "Avaliação",
    value: "R$ 12.500.000",
    status: "Em andamento",
    date: "10 Jun",
  },
  {
    id: "r-4",
    client: "Marina Costa",
    property: "Penthouse Diamond",
    type: "Contato",
    value: "R$ 22.000.000",
    status: "Fechado",
    date: "08 Jun",
  },
];
