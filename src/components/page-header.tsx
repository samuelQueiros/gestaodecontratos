import * as React from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mt-2 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary-dark">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pago: "bg-success/10 text-success border-success/20",
    Pendente: "bg-warning/15 text-warning-foreground border-warning/30",
    Vencido: "bg-destructive/10 text-destructive border-destructive/20",
    Parcial: "bg-primary/10 text-primary border-primary/20",
    Ativo: "bg-success/10 text-success border-success/20",
    Inativo: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
