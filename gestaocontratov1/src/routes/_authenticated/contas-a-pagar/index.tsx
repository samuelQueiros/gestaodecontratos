import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, FilterX, Eye, Pencil, Trash2, Download, MoreHorizontal } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { contas, brl, fmtDate, type Status } from "@/lib/mock-data";
import { PageHeader, StatusBadge } from "@/components/page-header";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/contas-a-pagar/")({
  component: ListPage,
});

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ["todos", "Pago", "Pendente", "Vencido", "Parcial"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

function isStatusFilter(value: string): value is StatusFilter {
  return STATUS_OPTIONS.includes(value as StatusFilter);
}

function ListPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [periodo, setPeriodo] = useState<string>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return contas.filter((c) => {
      if (status !== "todos" && c.status !== status) return false;
      if (q && !`${c.fornecedor} ${c.categoria} ${c.id}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      if (periodo !== "all") {
        const days = parseInt(periodo);
        const today = new Date().toISOString().split("T")[0];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + days);
        const cutoff = cutoffDate.toISOString().split("T")[0];
        if (c.vencimento < today || c.vencimento > cutoff) return false;
      }
      return true;
    });
  }, [q, status, periodo]);

  const hasFilters = q !== "" || status !== "todos" || periodo !== "all";

  function clearFilters() {
    setQ("");
    setStatus("todos");
    setPeriodo("all");
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalValor = filtered.reduce((s, c) => s + c.valor, 0);

  return (
    <>
      <PageHeader
        title="Contas a Pagar"
        description={`${filtered.length} lançamentos · ${brl(totalValor)} em títulos`}
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

      <Card className="border shadow-[var(--shadow-card)]">
        {/* Filters */}
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por fornecedor, categoria, ID..."
              className="pl-9 h-10"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              if (isStatusFilter(v)) setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[170px] h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Pago">Pago</SelectItem>
              <SelectItem value="Vencido">Vencido</SelectItem>
              <SelectItem value="Parcial">Parcial</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={periodo}
            onValueChange={(v) => {
              setPeriodo(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[170px] h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o período</SelectItem>
              <SelectItem value="7">Vence em até 7 dias</SelectItem>
              <SelectItem value="30">Vence em até 30 dias</SelectItem>
              <SelectItem value="90">Vence em até 90 dias</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={clearFilters}>
              <FilterX className="h-4 w-4" /> Limpar
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/40 border-b">
                <th className="px-5 py-3 font-semibold">ID</th>
                <th className="px-5 py-3 font-semibold">Fornecedor</th>
                <th className="px-5 py-3 font-semibold">Categoria</th>
                <th className="px-5 py-3 font-semibold">Vencimento</th>
                <th className="px-5 py-3 font-semibold text-right">Valor</th>
                <th className="px-5 py-3 font-semibold">Conta bancária</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-muted-foreground">
                    <div className="text-sm font-medium">Nenhum lançamento encontrado</div>
                    <div className="text-xs mt-1">
                      Ajuste os filtros ou cadastre uma nova despesa.
                    </div>
                  </td>
                </tr>
              ) : (
                pageData.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{c.id}</td>
                    <td className="px-5 py-3 font-medium text-primary-dark">{c.fornecedor}</td>
                    <td className="px-5 py-3 text-muted-foreground">{c.categoria}</td>
                    <td className="px-5 py-3 text-muted-foreground">{fmtDate(c.vencimento)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-primary-dark">
                      {brl(c.valor)}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">
                      {c.contaBancaria.split(" — ")[0]}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-0.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            navigate({ to: "/contas-a-pagar/$id", params: { id: c.id } })
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toast.info("Edição em modo demonstração.")}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => toast.success(`${c.id} marcado como pago`)}
                            >
                              Marcar como pago
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => toast.info("Boleto duplicado.")}>
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={() => toast.error("Exclusão bloqueada na demonstração.")}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
          <div>
            Exibindo <span className="font-semibold text-primary-dark">{pageData.length}</span> de{" "}
            <span className="font-semibold text-primary-dark">{filtered.length}</span> lançamentos
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages })
              .slice(0, 5)
              .map((_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={page === i + 1 ? "default" : "outline"}
                  onClick={() => setPage(i + 1)}
                  className="w-8"
                >
                  {i + 1}
                </Button>
              ))}
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
