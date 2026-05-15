import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wallet,
  Plus,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { contas, brl, fmtDate, fluxoPagamentos, despesasPorCategoria } from "@/lib/mock-data";
import { PageHeader, StatusBadge } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const PIE_COLORS = [
  "oklch(0.55 0.22 264)",
  "oklch(0.7 0.16 200)",
  "oklch(0.62 0.16 155)",
  "oklch(0.78 0.16 75)",
  "oklch(0.62 0.21 25)",
  "oklch(0.5 0.05 260)",
];

function DashboardPage() {
  const total = contas.reduce((s, c) => s + c.valor, 0);
  const vencidas = contas.filter((c) => c.status === "Vencido");
  const pagas = contas.filter((c) => c.status === "Pago");
  const aVencer = contas.filter((c) => c.status === "Pendente" || c.status === "Parcial");
  const recentes = [...contas].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 6);

  const cards = [
    {
      label: "Total a pagar",
      value: brl(aVencer.reduce((s, c) => s + c.valor, 0)),
      delta: "+12,4%",
      trend: "up" as const,
      icon: Wallet,
      tone: "primary",
    },
    {
      label: "Contas vencidas",
      value: brl(vencidas.reduce((s, c) => s + c.valor, 0)),
      delta: `${vencidas.length} títulos`,
      trend: "down" as const,
      icon: AlertTriangle,
      tone: "destructive",
    },
    {
      label: "Contas pagas (mês)",
      value: brl(pagas.reduce((s, c) => s + c.valor, 0)),
      delta: "+8,1%",
      trend: "up" as const,
      icon: CheckCircle2,
      tone: "success",
    },
    {
      label: "A vencer (7 dias)",
      value: brl(aVencer.slice(0, 8).reduce((s, c) => s + c.valor, 0)),
      delta: `${aVencer.length} títulos`,
      trend: "up" as const,
      icon: Clock,
      tone: "warning",
    },
  ];

  return (
    <>
      <PageHeader
        title="Visão geral financeira"
        description="Indicadores consolidados do módulo de Contas a Pagar."
        actions={
          <>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Exportar
            </Button>
            <Link to="/contas-a-pagar/nova">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Nova despesa
              </Button>
            </Link>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          const toneBg: Record<string, string> = {
            primary: "bg-primary/10 text-primary",
            destructive: "bg-destructive/10 text-destructive",
            success: "bg-success/10 text-success",
            warning: "bg-warning/15 text-warning-foreground",
          };
          return (
            <Card key={c.label} className="p-5 border shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between">
                <div
                  className={`h-11 w-11 rounded flex items-center justify-center ${toneBg[c.tone]}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${
                    c.trend === "up" ? "text-success" : "text-destructive"
                  }`}
                >
                  {c.trend === "up" ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {c.delta}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-xs text-muted-foreground font-medium">{c.label}</div>
                <div className="text-2xl font-bold text-primary-dark mt-1 tracking-tight">
                  {c.value}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <Card className="p-6 lg:col-span-2 border shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-semibold text-primary-dark">Fluxo de pagamentos</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Entradas vs. saídas — últimos 8 meses
              </p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" /> Entradas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-destructive" /> Saídas
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fluxoPagamentos}>
                <defs>
                  <linearGradient id="cIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.43 0.12 255)" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="oklch(0.43 0.12 255)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.56 0.12 28)" stopOpacity={0.14} />
                    <stop offset="100%" stopColor="oklch(0.56 0.12 28)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.91 0.015 250)"
                  vertical={false}
                />
                <XAxis
                  dataKey="mes"
                  stroke="oklch(0.5 0.025 256)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="oklch(0.5 0.025 256)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid oklch(0.91 0.015 250)",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => brl(v)}
                />
                <Area
                  type="monotone"
                  dataKey="entrada"
                  stroke="oklch(0.55 0.22 264)"
                  strokeWidth={2.5}
                  fill="url(#cIn)"
                />
                <Area
                  type="monotone"
                  dataKey="saida"
                  stroke="oklch(0.62 0.21 25)"
                  strokeWidth={2.5}
                  fill="url(#cOut)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border shadow-[var(--shadow-card)]">
          <div className="mb-2">
            <h3 className="font-semibold text-primary-dark">Despesas por categoria</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Distribuição mensal</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={despesasPorCategoria}
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={2}
                  stroke="white"
                  strokeWidth={2}
                >
                  {despesasPorCategoria.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => brl(v)}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <Card className="p-6 lg:col-span-1 border shadow-[var(--shadow-card)]">
          <h3 className="font-semibold text-primary-dark mb-4">Evolução mensal</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fluxoPagamentos.slice(-6)}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.91 0.015 250)"
                  vertical={false}
                />
                <XAxis
                  dataKey="mes"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  stroke="oklch(0.5 0.025 256)"
                />
                <YAxis hide />
                <Tooltip
                  formatter={(v: number) => brl(v)}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="saida" fill="oklch(0.55 0.22 264)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2 border shadow-[var(--shadow-card)] overflow-hidden">
          <div className="p-6 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary-dark">Títulos recentes</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Últimos lançamentos no sistema</p>
            </div>
            <Link to="/contas-a-pagar" className="text-xs text-primary hover:underline font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-y bg-muted/30">
                  <th className="px-6 py-2.5 font-semibold">Fornecedor</th>
                  <th className="px-6 py-2.5 font-semibold">Vencimento</th>
                  <th className="px-6 py-2.5 font-semibold text-right">Valor</th>
                  <th className="px-6 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentes.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <div className="font-medium text-primary-dark">{c.fornecedor}</div>
                      <div className="text-xs text-muted-foreground">{c.categoria}</div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{fmtDate(c.vencimento)}</td>
                    <td className="px-6 py-3 text-right font-semibold text-primary-dark">
                      {brl(c.valor)}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
