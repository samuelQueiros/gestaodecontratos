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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    .replace(/[\u0300-\u036f]/g, "")
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

  return (
    <>
      <PageHeader
        title="Associados IRTDPJ"
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

          <div className="grid gap-4 lg:grid-cols-3 mt-6">
            <Card className="p-6 lg:col-span-2 border shadow-[var(--shadow-card)]">
              <div className="mb-5">
                <h3 className="font-semibold text-primary-dark">Arrecadacao por competencia</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Valores pagos e pendentes por mes.
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
                      stackId="a"
                      fill="oklch(0.62 0.16 155)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="pendente"
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

          <Card className="p-4 mt-6 border shadow-[var(--shadow-card)]">
            <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_150px_150px_180px_170px_170px_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por cartorio, CNPJ, CNS, email ou descricao"
                  className="pl-9"
                />
              </div>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="todos">Todos os status</option>
                <option value="PAGO">Pagas</option>
                <option value="PENDENTE">Pendentes</option>
              </select>
              <select
                value={situacao}
                onChange={(event) => setSituacao(event.target.value)}
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="todos">Ativos e inativos</option>
                <option value="ativos">Somente ativos</option>
                <option value="inativos">Somente inativos</option>
              </select>
              <select
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="todos">Todos os meses</option>
                {data.meses.map((mes) => (
                  <option key={mes} value={mes}>
                    {mes}
                  </option>
                ))}
              </select>
              <select
                value={tipo}
                onChange={(event) => setTipo(event.target.value)}
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="todos">Todos os tipos</option>
                {tipos.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                value={pendencias}
                onChange={(event) => setPendencias(event.target.value)}
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="todos">Todas as situacoes</option>
                <option value="pendentes">Com pendencia</option>
              </select>
              <Button type="button" variant="outline" className="gap-2" onClick={resetFilters}>
                <FilterX className="h-4 w-4" /> Limpar
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{filteredAssociados.length} associados</span>
              <span>{filteredRemessas.length} remessas</span>
              <span>{filteredCompetencias.length} competencias</span>
              <span>{filteredExtrato.length} linhas de extrato</span>
              <span>
                {summary.boletosPendentesIgnorados} boletos pendentes ignorados por competencia paga
              </span>
            </div>
          </Card>

          <Tabs
            value={activeTab}
            onValueChange={(tab) => navigate({ to: "/associados-irtdpj", search: { tab } })}
            className="mt-6"
          >
            <TabsList>
              <TabsTrigger value="visao">Dashboard</TabsTrigger>
              <TabsTrigger value="remessas">Remessas</TabsTrigger>
              <TabsTrigger value="competencias">Competencias</TabsTrigger>
              <TabsTrigger value="associados">Associados</TabsTrigger>
              <TabsTrigger value="extrato">Extrato mensal</TabsTrigger>
              <TabsTrigger value="pendencias">Pendencias</TabsTrigger>
              <TabsTrigger value="relatorios">Relatorios</TabsTrigger>
            </TabsList>

            <TabsContent value="visao">
              <div className="grid gap-4 lg:grid-cols-2">
                <DataTable
                  headers={["Fonte", "Conteudo", "Registros"]}
                  rows={[
                    ["associados.xlsx", "Cadastro completo dos associados", data.associados.length],
                    [
                      "detalhe_remessas.xlsx",
                      "Uma linha por mensalidade/remessa",
                      data.remessas.length,
                    ],
                    [
                      "extrato_por_cartorio.xlsx",
                      "Extrato mensal por cartorio",
                      data.extrato.length,
                    ],
                  ]}
                  footer="Resumo das tres planilhas usadas como origem da visao IRTDPJ."
                />
                <DataTable
                  headers={["Indicador", "Valor", "Detalhe"]}
                  rows={[
                    [
                      "Associados ativos",
                      summary.ativos,
                      `${data.associados.length} cadastros totais`,
                    ],
                    ["Competencias pagas", summary.pagos, brl(summary.totalPago)],
                    ["Competencias pendentes", summary.pendentes, brl(summary.totalPendente)],
                    [
                      "Boletos pendentes ignorados",
                      summary.boletosPendentesIgnorados,
                      "Ha pagamento na mesma competencia",
                    ],
                    ["Competencias", data.meses.length, `${data.meses[0]} a ${data.meses.at(-1)}`],
                  ]}
                  footer="Visao executiva consolidada a partir dos dados carregados."
                />
              </div>
            </TabsContent>

            <TabsContent value="remessas">
              <DataTable
                headers={[
                  "Cartorio",
                  "CNPJ",
                  "CNS",
                  "Descricao",
                  "Tipo",
                  "Competencia",
                  "Status competencia",
                  "Valor",
                  "Vencimento",
                  "Pagamento",
                  "Dias aberto",
                  "Regra aplicada",
                  "Status",
                ]}
                rows={filteredRemessas
                  .slice(0, 400)
                  .map((remessa) => [
                    remessa.cartorio,
                    remessa.cnpj,
                    remessa.cns,
                    remessa.descricao,
                    remessa.tipo,
                    getMonthLabel(remessa),
                    remessa.statusCompetencia || remessa.status,
                    brl(remessa.valor || 0),
                    remessa.vencimento || "-",
                    remessa.dataPagamento || "-",
                    remessa.diasEmAberto || 0,
                    remessa.pendenciaIgnoradaPorPagamentoNaCompetencia
                      ? "Ignorada: competencia paga"
                      : "-",
                    <StatusBadge
                      key="status"
                      status={remessa.status === "PAGO" ? "Pago" : "Pendente"}
                    />,
                  ])}
                footer={`${filteredRemessas.length} remessas encontradas. Exibindo as primeiras 400 para manter a tela rapida.`}
              />
            </TabsContent>

            <TabsContent value="competencias">
              <DataTable
                headers={[
                  "Cartorio",
                  "CNPJ",
                  "CNS",
                  "Competencia",
                  "Status competencia",
                  "Valor pago",
                  "Valor pendente",
                  "Remessas",
                  "Pagas",
                  "Pendentes",
                  "Pendencia ignorada",
                ]}
                rows={filteredCompetencias
                  .slice(0, 400)
                  .map((competencia) => [
                    competencia.cartorio,
                    competencia.cnpj,
                    competencia.cns || "-",
                    competencia.mes,
                    competencia.statusCompetencia,
                    brl(competencia.valorPago),
                    brl(competencia.valorPendente),
                    competencia.qtdRemessas,
                    competencia.qtdRemessasPagas,
                    competencia.qtdRemessasPendentes,
                    competencia.temBoletoPendenteIgnorado ? "Sim" : "Nao",
                  ])}
                footer={`${filteredCompetencias.length} competencias consolidadas encontradas.`}
              />
            </TabsContent>

            <TabsContent value="associados">
              <DataTable
                headers={[
                  "ID",
                  "Cartorio",
                  "Nome",
                  "CPF/CNPJ",
                  "CNPJ cartorio",
                  "CNS",
                  "Data associacao",
                  "Mensalidade",
                  "Email",
                  "Telefone",
                  "Status",
                ]}
                rows={filteredAssociados
                  .slice(0, 400)
                  .map((associado) => [
                    associado.associadoId,
                    associado.nomeCartorio,
                    associado.nome,
                    associado.cpfCnpjPessoa,
                    associado.cnpjCartorio,
                    associado.cns,
                    associado.dataAssociacao || "-",
                    brl(associado.valorMensalidade || 0),
                    associado.email || "-",
                    associado.telefone || "-",
                    <StatusBadge key="status" status={associado.ativo ? "Ativo" : "Inativo"} />,
                  ])}
                footer={`${filteredAssociados.length} associados encontrados.`}
              />
            </TabsContent>

            <TabsContent value="extrato">
              <DataTable
                headers={[
                  "Cartorio",
                  "CNPJ",
                  "CNS",
                  "Mensalidade",
                  "Pago",
                  "Pendente",
                  "Qtd paga",
                  "Qtd pendente",
                  ...data.meses,
                ]}
                rows={filteredExtrato
                  .slice(0, 250)
                  .map((linha) => [
                    linha.cartorio,
                    linha.cnpj,
                    linha.cns || "-",
                    brl(linha.mensalidade || 0),
                    brl(linha.totalPago),
                    brl(linha.totalPendente),
                    linha.qtdPaga,
                    linha.qtdPendente,
                    ...data.meses.map((mes) => linha.meses[mes] || "-"),
                  ])}
                footer={`${filteredExtrato.length} cartorios no extrato. A tabela mostra todas as competencias disponiveis.`}
              />
            </TabsContent>

            <TabsContent value="pendencias">
              <DataTable
                headers={[
                  "Cartorio",
                  "CNPJ",
                  "CNS",
                  "Total pendente",
                  "Qtd pendente",
                  "Mensalidade",
                ]}
                rows={topPendentes.map((linha) => [
                  linha.cartorio,
                  linha.cnpj,
                  linha.cns || "-",
                  brl(linha.totalPendente),
                  linha.qtdPendente,
                  brl(linha.mensalidade || 0),
                ])}
                footer="Maiores saldos pendentes dentro do filtro atual."
              />
            </TabsContent>

            <TabsContent value="relatorios">
              <div className="grid gap-4 lg:grid-cols-2">
                <DataTable
                  headers={["Competencia", "Pago", "Pendente", "Total"]}
                  rows={monthChart.map((linha) => [
                    linha.mes,
                    brl(linha.pago),
                    brl(linha.pendente),
                    brl(linha.pago + linha.pendente),
                  ])}
                  footer="Relatorio consolidado por competencia."
                />
                <DataTable
                  headers={["Cartorio", "CNPJ", "Total pendente", "Qtd pendente"]}
                  rows={topPendentes.map((linha) => [
                    linha.cartorio,
                    linha.cnpj,
                    brl(linha.totalPendente),
                    linha.qtdPendente,
                  ])}
                  footer="Ranking de pendencias conforme o filtro atual."
                />
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </>
  );
}

function DataTable({
  headers,
  rows,
  footer,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  footer: string;
}) {
  return (
    <Card className="border shadow-[var(--shadow-card)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase text-muted-foreground border-b bg-muted/30">
              {headers.map((header) => (
                <th key={header} className="px-4 py-2.5 font-semibold whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b last:border-0 hover:bg-muted/40">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 align-top max-w-[340px]">
                    <div className="line-clamp-2">{cell}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 text-xs text-muted-foreground bg-muted/20 border-t">{footer}</div>
    </Card>
  );
}
