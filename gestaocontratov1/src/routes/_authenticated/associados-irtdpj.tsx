import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FilterX,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, StatusBadge } from "@/components/page-header";
import { brl } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/associados-irtdpj")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : "visao",
  }),
  component: AssociadosIrtdpjPage,
});

type Associado = {
  associadoId: number;
  nome: string;
  cpfCnpjPessoa: string;
  nomeCartorio: string;
  cnpjCartorio: string;
  documentoBusca?: string;
  cns: string | null;
  dataAssociacao: string;
  dataAssociacaoIso?: string | null;
  valorMensalidade: number | null;
  email: string | null;
  telefone: string | null;
  ativo: boolean;
  statusAssociado?: string;
};

type Remessa = {
  cartorio: string;
  cnpj: string;
  cns: string | null;
  descricao: string;
  tipo: string;
  valor: number | null;
  vencimento: string | null;
  vencimentoIso?: string | null;
  dataPagamento: string | null;
  dataPagamentoIso?: string | null;
  status: "PAGO" | "PENDENTE";
  pago?: boolean;
  mes?: string;
  mesKey?: string;
  diasEmAberto?: number;
  statusCompetencia?: "PAGO" | "PENDENTE" | "SEM_REMESSA";
  competenciaConsolidadaPaga?: boolean;
  pendenciaIgnoradaPorPagamentoNaCompetencia?: boolean;
};

type Competencia = {
  cartorio: string;
  cnpj: string;
  cns: string | null;
  mes: string;
  mesKey: string;
  qtdRemessas: number;
  qtdRemessasPagas: number;
  qtdRemessasPendentes: number;
  valorPagoRemessas: number;
  valorPendenteRemessas: number;
  statusCompetencia: "PAGO" | "PENDENTE" | "SEM_REMESSA";
  valorPago: number;
  valorPendente: number;
  temBoletoPendenteIgnorado: boolean;
};

type Extrato = {
  cartorio: string;
  cnpj: string;
  cns: string | null;
  mensalidade: number | null;
  totalPago: number;
  totalPendente: number;
  qtdPaga: number;
  qtdPendente: number;
  meses: Record<string, string>;
  mesesDetalhados?: Record<string, { texto: string; status: "PAGO" | "PENDENTE" | "VAZIO" }>;
  temPendencia?: boolean;
};

type IrtdpjData = {
  generatedAt: string;
  sources: string[];
  meta?: {
    tipos?: string[];
    cartorios?: string[];
  };
  meses: string[];
  associados: Associado[];
  remessas: Remessa[];
  competencias?: Competencia[];
  extrato: Extrato[];
};

const COLORS = ["oklch(0.62 0.16 155)", "oklch(0.62 0.21 25)", "oklch(0.43 0.12 255)"];

function normalizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function getMonthLabel(remessa: Remessa) {
  if (remessa.mes) return remessa.mes;
  const fromDescription = remessa.descricao?.match(/(\d{2})\/(\d{4})/);
  if (fromDescription) return fromDescription[0];
  const fromDate = remessa.vencimento?.match(/^\d{2}\/(\d{2})\/(\d{4})$/);
  return fromDate ? `${fromDate[1]}/${fromDate[2]}` : "Sem mes";
}

function formatGeneratedAt(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleString("pt-BR");
}

function AssociadosIrtdpjPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [data, setData] = React.useState<IrtdpjData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("todos");
  const [month, setMonth] = React.useState("todos");
  const [tipo, setTipo] = React.useState("todos");
  const [situacao, setSituacao] = React.useState("todos");
  const [pendencias, setPendencias] = React.useState("todos");
  const activeTab = search.tab || "visao";

  React.useEffect(() => {
    fetch("/data/irtdpj.json")
      .then((response) => {
        if (!response.ok) throw new Error("Arquivo /data/irtdpj.json nao encontrado.");
        return response.json();
      })
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, []);

  const tipos = React.useMemo(() => {
    if (!data) return [];
    return data.meta?.tipos?.length
      ? data.meta.tipos
      : [...new Set(data.remessas.map((remessa) => remessa.tipo).filter(Boolean))].sort();
  }, [data]);

  const associadosByDocumento = React.useMemo(() => {
    const map = new Map<string, Associado>();
    data?.associados.forEach((associado) => {
      const key = associado.documentoBusca || associado.cnpjCartorio || associado.cpfCnpjPessoa;
      if (key) map.set(key, associado);
    });
    return map;
  }, [data]);

  const filteredRemessas = React.useMemo(() => {
    if (!data) return [];
    const needle = normalizeText(query);
    return data.remessas.filter((remessa) => {
      const associado = associadosByDocumento.get(remessa.cnpj);
      const matchesText = [
        remessa.cartorio,
        remessa.cnpj,
        remessa.cns,
        remessa.descricao,
        remessa.tipo,
        remessa.status,
        associado?.nome,
        associado?.email,
      ]
        .map(normalizeText)
        .some((field) => field.includes(needle));
      const matchesStatus = status === "todos" || remessa.status === status;
      const matchesMonth = month === "todos" || getMonthLabel(remessa) === month;
      const matchesTipo = tipo === "todos" || remessa.tipo === tipo;
      const matchesSituacao =
        situacao === "todos" ||
        (situacao === "ativos" && associado?.ativo !== false) ||
        (situacao === "inativos" && associado?.ativo === false);
      const matchesPendencias = pendencias === "todos" || remessa.status === "PENDENTE";

      return (
        matchesText &&
        matchesStatus &&
        matchesMonth &&
        matchesTipo &&
        matchesSituacao &&
        matchesPendencias
      );
    });
  }, [associadosByDocumento, data, month, pendencias, query, situacao, status, tipo]);

  const filteredCnpjs = React.useMemo(
    () => new Set(filteredRemessas.map((remessa) => remessa.cnpj).filter(Boolean)),
    [filteredRemessas],
  );

  const filteredCompetencias = React.useMemo(() => {
    if (!data) return [];
    const competencias =
      data.competencias ??
      data.remessas.map((remessa) => ({
        cartorio: remessa.cartorio,
        cnpj: remessa.cnpj,
        cns: remessa.cns,
        mes: getMonthLabel(remessa),
        mesKey: remessa.mesKey || getMonthLabel(remessa),
        qtdRemessas: 1,
        qtdRemessasPagas: remessa.status === "PAGO" ? 1 : 0,
        qtdRemessasPendentes: remessa.status === "PENDENTE" ? 1 : 0,
        valorPagoRemessas: remessa.status === "PAGO" ? remessa.valor || 0 : 0,
        valorPendenteRemessas: remessa.status === "PENDENTE" ? remessa.valor || 0 : 0,
        statusCompetencia: remessa.status,
        valorPago: remessa.status === "PAGO" ? remessa.valor || 0 : 0,
        valorPendente: remessa.status === "PENDENTE" ? remessa.valor || 0 : 0,
        temBoletoPendenteIgnorado: false,
      }));
    const needle = normalizeText(query);

    return competencias.filter((competencia) => {
      const associado = associadosByDocumento.get(competencia.cnpj);
      const matchesText = [
        competencia.cartorio,
        competencia.cnpj,
        competencia.cns,
        competencia.mes,
        competencia.statusCompetencia,
        associado?.nome,
        associado?.email,
      ]
        .map(normalizeText)
        .some((field) => field.includes(needle));
      const matchesStatus =
        status === "todos" ||
        (status === "PAGO" && competencia.statusCompetencia === "PAGO") ||
        (status === "PENDENTE" && competencia.statusCompetencia === "PENDENTE");
      const matchesMonth = month === "todos" || competencia.mes === month;
      const matchesSituacao =
        situacao === "todos" ||
        (situacao === "ativos" && associado?.ativo !== false) ||
        (situacao === "inativos" && associado?.ativo === false);
      const matchesPendencias =
        pendencias === "todos" || competencia.statusCompetencia === "PENDENTE";
      const matchesTipo = tipo === "todos" || filteredCnpjs.has(competencia.cnpj);

      return (
        matchesText &&
        matchesStatus &&
        matchesMonth &&
        matchesSituacao &&
        matchesPendencias &&
        matchesTipo
      );
    });
  }, [
    associadosByDocumento,
    data,
    filteredCnpjs,
    month,
    pendencias,
    query,
    situacao,
    status,
    tipo,
  ]);

  const filteredAssociados = React.useMemo(() => {
    if (!data) return [];
    const needle = normalizeText(query);
    return data.associados.filter((associado) => {
      const key = associado.documentoBusca || associado.cnpjCartorio || associado.cpfCnpjPessoa;
      const matchesText = [
        associado.nome,
        associado.nomeCartorio,
        associado.cpfCnpjPessoa,
        associado.cnpjCartorio,
        associado.cns,
        associado.email,
        associado.telefone,
      ]
        .map(normalizeText)
        .some((field) => field.includes(needle));
      const matchesSituacao =
        situacao === "todos" ||
        (situacao === "ativos" && associado.ativo) ||
        (situacao === "inativos" && !associado.ativo);
      const matchesLinkedFilters =
        status === "todos" && month === "todos" && tipo === "todos" && pendencias === "todos"
          ? true
          : filteredCnpjs.has(key);

      return matchesText && matchesSituacao && matchesLinkedFilters;
    });
  }, [data, filteredCnpjs, month, pendencias, query, situacao, status, tipo]);

  const filteredExtrato = React.useMemo(() => {
    if (!data) return [];
    const needle = normalizeText(query);
    return data.extrato.filter((linha) => {
      const associado = associadosByDocumento.get(linha.cnpj);
      const matchesText = [linha.cartorio, linha.cnpj, linha.cns, associado?.nome, associado?.email]
        .map(normalizeText)
        .some((field) => field.includes(needle));
      const matchesSituacao =
        situacao === "todos" ||
        (situacao === "ativos" && associado?.ativo !== false) ||
        (situacao === "inativos" && associado?.ativo === false);
      const matchesPendencias =
        pendencias === "todos" || linha.temPendencia || linha.qtdPendente > 0;
      const matchesMonth =
        month === "todos" ||
        linha.mesesDetalhados?.[month]?.status === status ||
        (status === "todos" && Boolean(linha.meses[month]));
      const matchesLinkedFilters =
        status === "todos" && month === "todos" && tipo === "todos"
          ? true
          : filteredCnpjs.has(linha.cnpj);

      return (
        matchesText && matchesSituacao && matchesPendencias && matchesMonth && matchesLinkedFilters
      );
    });
  }, [
    associadosByDocumento,
    data,
    filteredCnpjs,
    month,
    pendencias,
    query,
    situacao,
    status,
    tipo,
  ]);

  const summary = React.useMemo(() => {
    if (!data) return null;
    const totalPago = filteredCompetencias.reduce(
      (sum, competencia) => sum + competencia.valorPago,
      0,
    );
    const totalPendente = filteredCompetencias.reduce(
      (sum, competencia) => sum + competencia.valorPendente,
      0,
    );
    const pagos = filteredCompetencias.filter(
      (competencia) => competencia.statusCompetencia === "PAGO",
    ).length;
    const pendentes = filteredCompetencias.filter(
      (competencia) => competencia.statusCompetencia === "PENDENTE",
    ).length;
    const boletosPendentesIgnorados = filteredCompetencias.reduce(
      (sum, competencia) =>
        sum + (competencia.statusCompetencia === "PAGO" ? competencia.qtdRemessasPendentes : 0),
      0,
    );
    const ativos = filteredAssociados.filter((associado) => associado.ativo).length;

    return { totalPago, totalPendente, pagos, pendentes, ativos, boletosPendentesIgnorados };
  }, [data, filteredAssociados, filteredCompetencias]);

  const monthChart = React.useMemo(() => {
    if (!data) return [];
    return data.meses.map((mes) => {
      const competencias = filteredCompetencias.filter((competencia) => competencia.mes === mes);
      return {
        mes,
        pago: competencias.reduce((sum, competencia) => sum + competencia.valorPago, 0),
        pendente: competencias.reduce((sum, competencia) => sum + competencia.valorPendente, 0),
      };
    });
  }, [data, filteredCompetencias]);

  const statusChart = summary
    ? [
        { name: "Pagas", value: summary.pagos },
        { name: "Pendentes", value: summary.pendentes },
      ]
    : [];

  const topPendentes = React.useMemo(
    () => [...filteredExtrato].sort((a, b) => b.totalPendente - a.totalPendente).slice(0, 8),
    [filteredExtrato],
  );

  function resetFilters() {
    setQuery("");
    setStatus("todos");
    setMonth("todos");
    setTipo("todos");
    setSituacao("todos");
    setPendencias("todos");
  }

  const hasFilters =
    query !== "" ||
    status !== "todos" ||
    month !== "todos" ||
    tipo !== "todos" ||
    situacao !== "todos" ||
    pendencias !== "todos";

  const TAB_TITLES: Record<string, string> = {
    visao: "Dashboard",
    remessas: "Remessas",
    competencias: "Competências",
    associados: "Associados",
    extrato: "Extrato mensal",
    pendencias: "Pendências",
    relatorios: "Relatórios",
  };

  return (
    <>
      <PageHeader
        title={`Associados IRTDPJ — ${TAB_TITLES[activeTab] ?? activeTab}`}
        description="Painel alimentado pelas planilhas geradas pelo sync_irtdpj.py."
        actions={
          <a href="/data/irtdpj.json" target="_blank" rel="noreferrer">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> JSON
            </Button>
          </a>
        }
      />

      {error && (
        <Card className="p-5 border-destructive/30 bg-destructive/5 text-sm text-destructive">
          {error}
        </Card>
      )}

      {!data || !summary ? (
        <Card className="p-6 border shadow-[var(--shadow-card)] text-sm text-muted-foreground">
          Carregando dados dos associados...
        </Card>
      ) : (
        <>
          {/* Summary cards — always visible */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Associados ativos",
                value: summary.ativos,
                detail: `${data.associados.length} no cadastro`,
                icon: Users,
              },
              {
                label: "Total pago",
                value: brl(summary.totalPago),
                detail: `${summary.pagos} competencias pagas`,
                icon: CheckCircle2,
              },
              {
                label: "Total pendente",
                value: brl(summary.totalPendente),
                detail: `${summary.pendentes} competencias pendentes`,
                icon: AlertTriangle,
              },
              {
                label: "Mensalidades",
                value: data.remessas.length,
                detail: `${data.meses[0]} a ${data.meses.at(-1)}`,
                icon: Wallet,
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.label} className="p-5 border shadow-[var(--shadow-card)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-11 w-11 rounded bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-4">
                    <div className="text-xs text-muted-foreground font-medium">{card.label}</div>
                    <div className="text-2xl font-bold text-primary-dark mt-1 tracking-tight">
                      {card.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{card.detail}</div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Charts — only on dashboard tab */}
          {activeTab === "visao" && (
            <div className="grid gap-4 lg:grid-cols-3 mt-6">
              <Card className="p-6 lg:col-span-2 border shadow-[var(--shadow-card)]">
                <div className="mb-5">
                  <h3 className="font-semibold text-primary-dark">Arrecadação por competência</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Valores pagos e pendentes por mês.
                  </p>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthChart}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="oklch(0.91 0.015 250)"
                      />
                      <XAxis dataKey="mes" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `R$ ${Number(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(value: number) => brl(value)}
                        contentStyle={{ borderRadius: 8, fontSize: 12 }}
                      />
                      <Bar
                        dataKey="pago"
                        name="Pago"
                        stackId="a"
                        fill="oklch(0.62 0.16 155)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="pendente"
                        name="Pendente"
                        stackId="a"
                        fill="oklch(0.62 0.21 25)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6 border shadow-[var(--shadow-card)]">
                <div className="mb-2">
                  <h3 className="font-semibold text-primary-dark">Status das remessas</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Base atualizada em {formatGeneratedAt(data.generatedAt)}.
                  </p>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChart}
                        innerRadius={55}
                        outerRadius={90}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {statusChart.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {/* Filters bar — visible on all detail tabs */}
          {activeTab !== "visao" && (
            <Card className="p-4 mt-6 border shadow-[var(--shadow-card)]">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative min-w-[260px] flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar por cartório, CNPJ, CNS, e-mail..."
                    className="pl-9 h-10"
                  />
                </div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[160px] h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="PAGO">Pagas</SelectItem>
                    <SelectItem value="PENDENTE">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={situacao} onValueChange={setSituacao}>
                  <SelectTrigger className="w-[160px] h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Ativos e inativos</SelectItem>
                    <SelectItem value="ativos">Somente ativos</SelectItem>
                    <SelectItem value="inativos">Somente inativos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="w-[170px] h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os meses</SelectItem>
                    {data.meses.map((mes) => (
                      <SelectItem key={mes} value={mes}>
                        {mes}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="w-[160px] h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    {tipos.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={pendencias} onValueChange={setPendencias}>
                  <SelectTrigger className="w-[160px] h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Com e sem pendência</SelectItem>
                    <SelectItem value="pendentes">Com pendência</SelectItem>
                  </SelectContent>
                </Select>
                {hasFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="gap-2 h-10 text-muted-foreground"
                    onClick={resetFilters}
                  >
                    <FilterX className="h-4 w-4" /> Limpar
                  </Button>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground border-t pt-3">
                <span>
                  <span className="font-semibold text-foreground">{filteredAssociados.length}</span>{" "}
                  associados
                </span>
                <span>
                  <span className="font-semibold text-foreground">{filteredRemessas.length}</span>{" "}
                  remessas
                </span>
                <span>
                  <span className="font-semibold text-foreground">
                    {filteredCompetencias.length}
                  </span>{" "}
                  competências
                </span>
                <span>
                  <span className="font-semibold text-foreground">{filteredExtrato.length}</span>{" "}
                  extratos
                </span>
                {summary.boletosPendentesIgnorados > 0 && (
                  <span className="text-amber-600">
                    <span className="font-semibold">{summary.boletosPendentesIgnorados}</span>{" "}
                    boletos pendentes ignorados (competência paga)
                  </span>
                )}
              </div>
            </Card>
          )}

          {/* Tab content — switched by sidebar navigation */}
          <div className="mt-6">
            {activeTab === "visao" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <DataTable
                  title="Fontes de dados"
                  headers={["Arquivo", "Conteúdo", "Registros"]}
                  rows={[
                    ["associados.xlsx", "Cadastro completo dos associados", data.associados.length],
                    [
                      "detalhe_remessas.xlsx",
                      "Uma linha por mensalidade/remessa",
                      data.remessas.length,
                    ],
                    [
                      "extrato_por_cartorio.xlsx",
                      "Extrato mensal por cartório",
                      data.extrato.length,
                    ],
                  ]}
                  footer="Resumo das três planilhas usadas como origem da visão IRTDPJ."
                />
                <DataTable
                  title="Indicadores"
                  headers={["Indicador", "Valor", "Detalhe"]}
                  rows={[
                    [
                      "Associados ativos",
                      summary.ativos,
                      `${data.associados.length} cadastros totais`,
                    ],
                    ["Competências pagas", summary.pagos, brl(summary.totalPago)],
                    ["Competências pendentes", summary.pendentes, brl(summary.totalPendente)],
                    [
                      "Boletos pendentes ignorados",
                      summary.boletosPendentesIgnorados,
                      "Há pagamento na mesma competência",
                    ],
                    ["Competências", data.meses.length, `${data.meses[0]} a ${data.meses.at(-1)}`],
                  ]}
                  footer="Visão executiva consolidada a partir dos dados carregados."
                />
              </div>
            )}

            {activeTab === "remessas" && (
              <DataTable
                title={`Remessas (${filteredRemessas.length})`}
                headers={[
                  "Cartório",
                  "CNPJ",
                  "CNS",
                  "Descrição",
                  "Tipo",
                  "Competência",
                  "Status comp.",
                  "Valor",
                  "Vencimento",
                  "Pagamento",
                  "Dias em aberto",
                  "Status",
                ]}
                rows={filteredRemessas.map((remessa) => [
                  remessa.cartorio,
                  <span key="cnpj" className="font-mono text-xs">
                    {remessa.cnpj}
                  </span>,
                  remessa.cns || "-",
                  remessa.descricao,
                  remessa.tipo,
                  getMonthLabel(remessa),
                  remessa.statusCompetencia || remessa.status,
                  <span key="valor" className="font-semibold tabular-nums">
                    {brl(remessa.valor || 0)}
                  </span>,
                  remessa.vencimento || "-",
                  remessa.dataPagamento || "-",
                  remessa.diasEmAberto || 0,
                  <StatusBadge
                    key="status"
                    status={remessa.status === "PAGO" ? "Pago" : "Pendente"}
                  />,
                ])}
                footer={`${filteredRemessas.length} remessas encontradas.`}
              />
            )}

            {activeTab === "competencias" && (
              <DataTable
                title={`Competências (${filteredCompetencias.length})`}
                headers={[
                  "Cartório",
                  "CNPJ",
                  "CNS",
                  "Competência",
                  "Status",
                  "Valor pago",
                  "Valor pendente",
                  "Remessas",
                  "Pagas",
                  "Pendentes",
                  "Pendência ignorada",
                ]}
                rows={filteredCompetencias.map((competencia) => [
                  competencia.cartorio,
                  <span key="cnpj" className="font-mono text-xs">
                    {competencia.cnpj}
                  </span>,
                  competencia.cns || "-",
                  competencia.mes,
                  <StatusBadge
                    key="status"
                    status={competencia.statusCompetencia === "PAGO" ? "Pago" : "Pendente"}
                  />,
                  <span key="pago" className="font-semibold tabular-nums text-green-700">
                    {brl(competencia.valorPago)}
                  </span>,
                  <span
                    key="pendente"
                    className={`font-semibold tabular-nums ${competencia.valorPendente > 0 ? "text-red-600" : "text-muted-foreground"}`}
                  >
                    {brl(competencia.valorPendente)}
                  </span>,
                  competencia.qtdRemessas,
                  competencia.qtdRemessasPagas,
                  competencia.qtdRemessasPendentes,
                  competencia.temBoletoPendenteIgnorado ? (
                    <span key="ig" className="text-amber-600 font-medium">
                      Sim
                    </span>
                  ) : (
                    "Não"
                  ),
                ])}
                footer={`${filteredCompetencias.length} competências encontradas.`}
              />
            )}

            {activeTab === "associados" && (
              <DataTable
                title={`Associados (${filteredAssociados.length})`}
                headers={[
                  "ID",
                  "Cartório",
                  "Nome",
                  "CPF/CNPJ",
                  "CNPJ cartório",
                  "CNS",
                  "Associação",
                  "Mensalidade",
                  "E-mail",
                  "Telefone",
                  "Status",
                ]}
                rows={filteredAssociados.map((associado) => [
                  associado.associadoId,
                  associado.nomeCartorio,
                  associado.nome,
                  <span key="cpf" className="font-mono text-xs">
                    {associado.cpfCnpjPessoa}
                  </span>,
                  <span key="cnpj" className="font-mono text-xs">
                    {associado.cnpjCartorio}
                  </span>,
                  associado.cns || "-",
                  associado.dataAssociacao || "-",
                  <span key="mens" className="font-semibold tabular-nums">
                    {brl(associado.valorMensalidade || 0)}
                  </span>,
                  associado.email || "-",
                  associado.telefone || "-",
                  <StatusBadge key="status" status={associado.ativo ? "Ativo" : "Inativo"} />,
                ])}
                footer={`${filteredAssociados.length} associados encontrados.`}
              />
            )}

            {activeTab === "extrato" && (
              <DataTable
                title={`Extrato mensal (${filteredExtrato.length})`}
                headers={[
                  "Cartório",
                  "CNPJ",
                  "CNS",
                  "Mensalidade",
                  "Total pago",
                  "Total pendente",
                  "Qtd paga",
                  "Qtd pendente",
                  ...data.meses,
                ]}
                rows={filteredExtrato.map((linha) => [
                  linha.cartorio,
                  <span key="cnpj" className="font-mono text-xs">
                    {linha.cnpj}
                  </span>,
                  linha.cns || "-",
                  <span key="mens" className="tabular-nums">
                    {brl(linha.mensalidade || 0)}
                  </span>,
                  <span key="pago" className="font-semibold tabular-nums text-green-700">
                    {brl(linha.totalPago)}
                  </span>,
                  <span
                    key="pend"
                    className={`font-semibold tabular-nums ${linha.totalPendente > 0 ? "text-red-600" : "text-muted-foreground"}`}
                  >
                    {brl(linha.totalPendente)}
                  </span>,
                  linha.qtdPaga,
                  linha.qtdPendente,
                  ...data.meses.map((mes) => linha.meses[mes] || "-"),
                ])}
                footer={`${filteredExtrato.length} cartórios no extrato.`}
              />
            )}

            {activeTab === "pendencias" && (
              <DataTable
                title="Maiores pendências"
                headers={[
                  "Cartório",
                  "CNPJ",
                  "CNS",
                  "Total pendente",
                  "Qtd pendente",
                  "Mensalidade",
                ]}
                rows={topPendentes.map((linha) => [
                  linha.cartorio,
                  <span key="cnpj" className="font-mono text-xs">
                    {linha.cnpj}
                  </span>,
                  linha.cns || "-",
                  <span key="pend" className="font-semibold tabular-nums text-red-600">
                    {brl(linha.totalPendente)}
                  </span>,
                  linha.qtdPendente,
                  <span key="mens" className="tabular-nums">
                    {brl(linha.mensalidade || 0)}
                  </span>,
                ])}
                footer="Maiores saldos pendentes dentro do filtro atual."
              />
            )}

            {activeTab === "relatorios" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <DataTable
                  title="Arrecadação por competência"
                  headers={["Competência", "Pago", "Pendente", "Total"]}
                  rows={monthChart.map((linha) => [
                    linha.mes,
                    <span key="pago" className="font-semibold tabular-nums text-green-700">
                      {brl(linha.pago)}
                    </span>,
                    <span
                      key="pend"
                      className={`font-semibold tabular-nums ${linha.pendente > 0 ? "text-red-600" : "text-muted-foreground"}`}
                    >
                      {brl(linha.pendente)}
                    </span>,
                    <span key="total" className="font-semibold tabular-nums">
                      {brl(linha.pago + linha.pendente)}
                    </span>,
                  ])}
                  footer="Relatório consolidado por competência."
                />
                <DataTable
                  title="Ranking de pendências"
                  headers={["Cartório", "CNPJ", "Total pendente", "Qtd pendente"]}
                  rows={topPendentes.map((linha) => [
                    linha.cartorio,
                    <span key="cnpj" className="font-mono text-xs">
                      {linha.cnpj}
                    </span>,
                    <span key="pend" className="font-semibold tabular-nums text-red-600">
                      {brl(linha.totalPendente)}
                    </span>,
                    linha.qtdPendente,
                  ])}
                  footer="Ranking de pendências conforme o filtro atual."
                />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

const PAGE_SIZE = 10;

function DataTable({
  title,
  headers,
  rows,
  footer,
}: {
  title?: string;
  headers: string[];
  rows: React.ReactNode[][];
  footer: string;
}) {
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setPage(1);
  }, [rows.length]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageData = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const from = rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, rows.length);

  const pageNumbers = React.useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const delta = 2;
    const range: (number | "...")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }
    return range;
  }, [totalPages, page]);

  return (
    <Card className="border shadow-[var(--shadow-card)] overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b bg-muted/20">
          <h3 className="text-sm font-semibold text-primary-dark">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b bg-muted/40">
              {headers.map((header) => (
                <th key={header} className="px-4 py-2.5 font-semibold whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum registro encontrado para os filtros aplicados.
                </td>
              </tr>
            ) : (
              pageData.map((row, index) => (
                <tr
                  key={index}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-2.5 align-middle max-w-[260px] truncate"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t bg-muted/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
        <div>
          {rows.length === 0 ? (
            footer
          ) : (
            <>
              Exibindo{" "}
              <span className="font-semibold text-primary-dark">
                {from}–{to}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-primary-dark">{rows.length}</span> registros
              {" · "}
              {footer}
            </>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-1">
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  size="sm"
                  variant={page === p ? "default" : "outline"}
                  className="h-7 w-7 p-0 text-xs"
                  onClick={() => setPage(p as number)}
                >
                  {p}
                </Button>
              ),
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
