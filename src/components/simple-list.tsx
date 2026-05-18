import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, StatusBadge } from "@/components/page-header";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface ListColumn {
  key: string;
  label: string;
  align?: "left" | "right";
  badge?: boolean;
  mono?: boolean;
}

type SimpleListRow = Record<string, string | number | boolean | null | undefined>;

export function SimpleList({
  title,
  description,
  newLabel,
  columns,
  rows,
}: {
  title: string;
  description: string;
  newLabel: string;
  columns: ListColumn[];
  rows: SimpleListRow[];
}) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <Button variant="outline">Importar</Button>
            <Button className="gap-2" onClick={() => toast.info("Cadastro em modo demonstração.")}>
              <Plus className="h-4 w-4" /> {newLabel}
            </Button>
          </>
        }
      />
      <Card className="border shadow-[var(--shadow-card)]">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." className="pl-9 h-10" />
          </div>
          <span className="text-xs text-muted-foreground">{rows.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/40 border-b">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={`px-5 py-3 font-semibold ${c.align === "right" ? "text-right" : ""}`}
                  >
                    {c.label}
                  </th>
                ))}
                <th className="px-5 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-5 py-3 ${c.align === "right" ? "text-right" : ""} ${c.mono ? "font-mono text-xs text-muted-foreground" : ""}`}
                    >
                      {c.badge ? (
                        <StatusBadge status={String(r[c.key])} />
                      ) : (
                        <span
                          className={
                            c.key === columns[0].key
                              ? "font-medium text-primary-dark"
                              : "text-muted-foreground"
                          }
                        >
                          {r[c.key]}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-5 py-3 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toast.info("Edição em demonstração.")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toast.error("Exclusão bloqueada.")}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
