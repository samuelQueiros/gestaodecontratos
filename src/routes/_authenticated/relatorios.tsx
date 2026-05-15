import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import {
  FileBarChart,
  FileSpreadsheet,
  PieChart,
  FileText,
  Download,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { fluxoPagamentos, brl } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/relatorios")({ component: Page });

const REPORTS = [
  {
    icon: FileBarChart,
    title: "Contas a pagar por período",
    desc: "Análise consolidada por intervalo de datas.",
  },
  {
    icon: PieChart,
    title: "Despesas por categoria",
    desc: "Distribuição percentual das despesas.",
  },
  {
    icon: FileSpreadsheet,
    title: "Fluxo de caixa projetado",
    desc: "Projeção de saldos para os próximos 90 dias.",
  },
  {
    icon: FileText,
    title: "Razão de fornecedores",
    desc: "Movimentação detalhada por fornecedor.",
  },
  {
    icon: TrendingUp,
    title: "Análise orçamentária",
    desc: "Comparativo orçado x realizado por centro de custo.",
  },
  { icon: FileBarChart, title: "Inadimplência", desc: "Lista de títulos vencidos e tempo médio." },
];

function Page() {
  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Exporte e analise informações estratégicas do seu financeiro."
      />

      <Card className="p-6 border shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-semibold text-primary-dark">Saídas projetadas</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Evolução de pagamentos — últimos 8 meses
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Exportar PDF
          </Button>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fluxoPagamentos}>
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
                formatter={(v: number) => brl(v)}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="saida"
                stroke="oklch(0.55 0.22 264)"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          return (
            <Card
              key={r.title}
              className="p-5 border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] hover:border-primary/40 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-primary-dark text-sm leading-snug">
                      {r.title}
                    </h4>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
