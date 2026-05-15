import { createFileRoute } from "@tanstack/react-router";
import { SimpleList } from "@/components/simple-list";
import { centrosCusto, brl } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/centros-de-custo")({ component: Page });

function Page() {
  const rows = centrosCusto.map((c, i) => ({
    codigo: `CC-${String(100 + i).padStart(4, "0")}`,
    nome: c,
    responsavel: ["M. Andrade", "J. Pereira", "C. Souza", "R. Lima", "F. Martins", "P. Rocha"][
      i % 6
    ],
    orcamento: brl(15000 + i * 4500),
    realizado: brl(9800 + i * 3120),
    status: "Ativo",
  }));
  return (
    <SimpleList
      title="Centros de Custo"
      description="Acompanhe o orçamento por departamento ou unidade."
      newLabel="Novo centro de custo"
      columns={[
        { key: "codigo", label: "Código", mono: true },
        { key: "nome", label: "Nome" },
        { key: "responsavel", label: "Responsável" },
        { key: "orcamento", label: "Orçamento", align: "right" },
        { key: "realizado", label: "Realizado", align: "right" },
        { key: "status", label: "Status", badge: true },
      ]}
      rows={rows}
    />
  );
}
