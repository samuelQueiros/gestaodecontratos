export type Status = "Pago" | "Pendente" | "Vencido" | "Parcial";

export interface Conta {
  id: string;
  fornecedor: string;
  categoria: string;
  centroCusto: string;
  vencimento: string; // ISO
  competencia: string;
  valor: number;
  contaBancaria: string;
  formaPagamento: string;
  status: Status;
  descricao: string;
}

export const fornecedores = [
  "ONR Tecnologia Registral LTDA",
  "Companhia Paulista de Energia S.A.",
  "Rede Corporativa Telecom LTDA",
  "Patrimônio Institucional Imóveis S.A.",
  "Suprimentos Cartorários Brasil LTDA",
  "Auditoria Fiscal Prime LTDA",
  "Plataforma Jurídica Cloud S.A.",
  "Logística Documental Integrada LTDA",
  "Seguradora Institucional Brasil S.A.",
  "Comunicação Corporativa Nacional LTDA",
];

export const categorias = [
  "Energia Elétrica",
  "Telecomunicações",
  "Aluguel",
  "Material de Escritório",
  "Serviços Contábeis",
  "Software / SaaS",
  "Frete e Logística",
  "Seguros",
  "Marketing",
  "Manutenção",
];

export const centrosCusto = [
  "Administrativo",
  "Comercial",
  "Operacional",
  "Tecnologia",
  "Financeiro",
  "Marketing",
];

export const contasBancarias = [
  "Banco do Brasil - Conta Institucional 11122-9",
  "Caixa Econômica Federal - Convênios 22334-5",
  "Itaú - Operações Corporativas 12345-6",
  "Bradesco - Pagamentos ONRTDPJ 98765-4",
];

export const formasPagamento = [
  "Boleto",
  "PIX",
  "Transferência (TED)",
  "Cartão de Crédito",
  "Débito Automático",
];

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function rnd(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const contas: Conta[] = (() => {
  const r = rnd(42);
  const today = new Date();
  const list: Conta[] = [];
  for (let i = 0; i < 38; i++) {
    const offset = Math.floor(r() * 60) - 25;
    const v = new Date(today);
    v.setDate(today.getDate() + offset);
    const valor = Math.round((300 + r() * 18000) * 100) / 100;
    let status: Status;
    const k = r();
    if (offset < -2) status = k < 0.78 ? "Pago" : "Vencido";
    else if (offset < 1) status = k < 0.5 ? "Vencido" : "Pendente";
    else status = k < 0.15 ? "Parcial" : "Pendente";
    list.push({
      id: `DSP-${String(1000 + i)}`,
      fornecedor: fornecedores[Math.floor(r() * fornecedores.length)],
      categoria: categorias[Math.floor(r() * categorias.length)],
      centroCusto: centrosCusto[Math.floor(r() * centrosCusto.length)],
      vencimento: iso(v),
      competencia: iso(new Date(v.getFullYear(), v.getMonth(), 1)),
      valor,
      contaBancaria: contasBancarias[Math.floor(r() * contasBancarias.length)],
      formaPagamento: formasPagamento[Math.floor(r() * formasPagamento.length)],
      status,
      descricao: "Lançamento referente a serviço/produto contratado conforme contrato vigente.",
    });
  }
  return list.sort((a, b) => a.vencimento.localeCompare(b.vencimento));
})();

export function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function getConta(id: string) {
  return contas.find((c) => c.id === id);
}

export const fluxoPagamentos = [
  { mes: "Jan", entrada: 145000, saida: 98000 },
  { mes: "Fev", entrada: 162000, saida: 110000 },
  { mes: "Mar", entrada: 158000, saida: 124000 },
  { mes: "Abr", entrada: 178000, saida: 132000 },
  { mes: "Mai", entrada: 195000, saida: 141000 },
  { mes: "Jun", entrada: 210000, saida: 156000 },
  { mes: "Jul", entrada: 225000, saida: 168000 },
  { mes: "Ago", entrada: 232000, saida: 172000 },
];

export const despesasPorCategoria = [
  { name: "Energia", value: 28400 },
  { name: "Aluguel", value: 42000 },
  { name: "Software", value: 18900 },
  { name: "Telecom", value: 9500 },
  { name: "Marketing", value: 22300 },
  { name: "Outros", value: 14800 },
];
