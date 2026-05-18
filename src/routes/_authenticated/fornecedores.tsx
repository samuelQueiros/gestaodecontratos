import { createFileRoute } from "@tanstack/react-router";
import { SimpleList } from "@/components/simple-list";
import { fornecedores, brl } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/fornecedores")({ component: Page });

function Page() {
  const rows = fornecedores.map((f, i) => ({
    nome: f,
    cnpj: `${10 + i}.${String(123 + i).padStart(3, "0")}.456/0001-${String(10 + i).padStart(2, "0")}`,
    contato: `contato@${f
      .toLowerCase()
      .split(" ")[0]
      .replace(/[^a-z]/g, "")}.com.br`,
    titulos: 3 + (i % 6),
    saldo: brl(2400 + i * 1320.55),
    status: i % 7 === 0 ? "Inativo" : "Ativo",
  }));
  return (
    <SimpleList
      title="Fornecedores"
      description="Gerencie os fornecedores cadastrados no sistema."
      newLabel="Novo fornecedor"
      columns={[
        { key: "nome", label: "Razão Social" },
        { key: "cnpj", label: "CNPJ", mono: true },
        { key: "contato", label: "Contato" },
        { key: "titulos", label: "Títulos abertos" },
        { key: "saldo", label: "Saldo devedor", align: "right" },
        { key: "status", label: "Status", badge: true },
      ]}
      rows={rows}
    />
  );
}
