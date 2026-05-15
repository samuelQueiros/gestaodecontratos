import { createFileRoute } from "@tanstack/react-router";
import { SimpleList } from "@/components/simple-list";
import { categorias, brl } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/categorias")({ component: Page });

function Page() {
  const rows = categorias.map((c, i) => ({
    nome: c,
    tipo: i % 2 === 0 ? "Operacional" : "Administrativo",
    lancamentos: 8 + ((i * 3) % 22),
    total: brl(3500 + i * 2150),
    status: "Ativo",
  }));
  return (
    <SimpleList
      title="Categorias"
      description="Classifique seus lançamentos por categoria contábil."
      newLabel="Nova categoria"
      columns={[
        { key: "nome", label: "Categoria" },
        { key: "tipo", label: "Tipo" },
        { key: "lancamentos", label: "Lançamentos" },
        { key: "total", label: "Total mensal", align: "right" },
        { key: "status", label: "Status", badge: true },
      ]}
      rows={rows}
    />
  );
}
