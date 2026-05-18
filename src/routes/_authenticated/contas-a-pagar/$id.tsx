import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Download,
  Printer,
  CheckCircle2,
  FileText,
  Paperclip,
  Upload,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getConta, brl, fmtDate } from "@/lib/mock-data";
import { PageHeader, StatusBadge } from "@/components/page-header";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/contas-a-pagar/$id")({
  component: DetailPage,
});

function DetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const conta = getConta(id);

  if (!conta) {
    return (
      <Card className="p-12 text-center border">
        <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
        <h2 className="mt-4 font-semibold">Lançamento não encontrado</h2>
        <Link to="/contas-a-pagar">
          <Button className="mt-4" variant="outline">
            Voltar à listagem
          </Button>
        </Link>
      </Card>
    );
  }

  const parcelas = Array.from({ length: 3 }).map((_, i) => ({
    n: i + 1,
    venc: conta.vencimento,
    valor: conta.valor / 3,
    status: i === 0 ? "Pago" : i === 1 ? "Pendente" : "Pendente",
  }));

  const timeline = [
    { t: "Lançamento criado", date: "14/05/2026 09:12", by: "Administrador" },
    { t: "Aprovado pela gerência financeira", date: "14/05/2026 14:33", by: "M. Andrade" },
    { t: "Boleto registrado no banco", date: "15/05/2026 08:01", by: "Sistema" },
    { t: "Aguardando pagamento", date: "—", by: "—" },
  ];

  return (
    <>
      <div className="flex items-center gap-3 mt-2">
        <Link to="/contas-a-pagar">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <PageHeader
            title={conta.fornecedor}
            description={`Lançamento ${conta.id} · ${conta.categoria}`}
            actions={
              <>
                <Button variant="outline" className="gap-2">
                  <Printer className="h-4 w-4" /> Imprimir
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" /> Boleto
                </Button>
                <Button
                  className="gap-2"
                  onClick={() => {
                    toast.success("Pagamento confirmado.");
                    navigate({ to: "/contas-a-pagar" });
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" /> Confirmar pagamento
                </Button>
              </>
            }
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-5">
          {/* Resumo */}
          <Card className="p-6 border shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-primary-dark">Resumo financeiro</h3>
              <StatusBadge status={conta.status} />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Stat label="Valor total" value={brl(conta.valor)} highlight />
              <Stat label="Vencimento" value={fmtDate(conta.vencimento)} />
              <Stat label="Competência" value={fmtDate(conta.competencia)} />
              <Stat label="Forma de pagamento" value={conta.formaPagamento} />
              <Stat label="Conta bancária" value={conta.contaBancaria.split(" — ")[0]} />
              <Stat label="Centro de custo" value={conta.centroCusto} />
            </div>
            <div className="mt-5 pt-5 border-t">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Descrição
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{conta.descricao}</p>
            </div>
          </Card>

          {/* Parcelas */}
          <Card className="border shadow-[var(--shadow-card)]">
            <div className="p-6 pb-3">
              <h3 className="font-semibold text-primary-dark">Parcelas</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Detalhamento de pagamentos</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/40 border-y">
                    <th className="px-6 py-2.5 font-semibold">Parcela</th>
                    <th className="px-6 py-2.5 font-semibold">Vencimento</th>
                    <th className="px-6 py-2.5 font-semibold text-right">Valor</th>
                    <th className="px-6 py-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parcelas.map((p) => (
                    <tr key={p.n} className="border-b last:border-0">
                      <td className="px-6 py-3 font-medium">{p.n}/3</td>
                      <td className="px-6 py-3 text-muted-foreground">{fmtDate(p.venc)}</td>
                      <td className="px-6 py-3 text-right font-semibold text-primary-dark">
                        {brl(p.valor)}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Anexos */}
          <Card className="p-6 border shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-primary-dark">Anexos</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Documentos vinculados ao lançamento
                </p>
              </div>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" /> Enviar arquivo
              </Button>
            </div>
            <div className="space-y-2">
              {[
                { name: "Nota Fiscal 4521.pdf", size: "238 KB" },
                { name: "Contrato_v2.pdf", size: "1.2 MB" },
              ].map((f) => (
                <div
                  key={f.name}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <Paperclip className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{f.size}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Timeline */}
        <Card className="p-6 border shadow-[var(--shadow-card)] self-start">
          <h3 className="font-semibold text-primary-dark mb-1">Histórico</h3>
          <p className="text-xs text-muted-foreground mb-5">Linha do tempo do lançamento</p>
          <ol className="relative border-l border-border ml-2 space-y-5">
            {timeline.map((t, i) => (
              <li key={i} className="ml-5">
                <span
                  className={`absolute -left-1.5 mt-1 h-3 w-3 rounded-full ring-4 ring-card ${i < 3 ? "bg-primary" : "bg-muted-foreground/40"}`}
                />
                <div className="text-sm font-medium text-primary-dark">{t.t}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {t.date} · {t.by}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>
      <div
        className={`mt-1 font-semibold ${highlight ? "text-primary text-xl" : "text-primary-dark text-sm"}`}
      >
        {value}
      </div>
    </div>
  );
}
