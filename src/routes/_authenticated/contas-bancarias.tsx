import { createFileRoute } from "@tanstack/react-router";
import { SimpleList } from "@/components/simple-list";
import { contasBancarias, brl } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/contas-bancarias")({ component: Page });

function Page() {
  const rows = contasBancarias.map((c, i) => {
    const [banco, conta] = c.split(" — ");
    return {
      banco,
      agencia: `${1234 + i * 11}`,
      conta,
      saldo: brl(58400 + i * 17320.45),
      titulos: 6 + i * 2,
      status: i === 3 ? "Inativo" : "Ativo",
    };
  });
  return (
    <SimpleList
      title="Contas Bancárias"
      description="Gerencie suas contas para débito e conciliação."
      newLabel="Nova conta"
      columns={[
        { key: "banco", label: "Banco" },
        { key: "agencia", label: "Agência", mono: true },
        { key: "conta", label: "Conta" },
        { key: "saldo", label: "Saldo atual", align: "right" },
        { key: "titulos", label: "Títulos vinculados" },
        { key: "status", label: "Status", badge: true },
      ]}
      rows={rows}
    />
  );
}
