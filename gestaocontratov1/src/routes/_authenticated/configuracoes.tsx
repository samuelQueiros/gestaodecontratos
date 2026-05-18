import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/configuracoes")({ component: Page });

function Page() {
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Personalize a operação do sistema e preferências da empresa."
      />

      <Tabs defaultValue="empresa" className="space-y-5">
        <TabsList className="bg-muted/60 p-1 h-auto">
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="preferencias">Preferências</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa">
          <Card className="p-6 border shadow-[var(--shadow-card)] max-w-3xl">
            <h3 className="font-semibold text-primary-dark mb-1">Dados da empresa</h3>
            <p className="text-xs text-muted-foreground mb-5">
              Informações fiscais utilizadas em relatórios.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Razão Social" value="ONRTDPJ - Operador Nacional do Registro" />
              <Field label="Nome Fantasia" value="ONRTDPJ" />
              <Field label="CNPJ" value="42.000.000/0001-75" />
              <Field label="Inscrição Estadual" value="Isento" />
              <Field label="E-mail financeiro" value="financeiro@onrtdpj.org.br" />
              <Field label="Telefone" value="(61) 3030-7000" />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={() => toast.success("Alterações salvas.")}>Salvar alterações</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preferencias">
          <Card className="p-6 border shadow-[var(--shadow-card)] max-w-3xl space-y-1">
            <Toggle
              label="Confirmação ao excluir lançamentos"
              desc="Solicita confirmação extra para evitar exclusões acidentais."
              defaultChecked
            />
            <Toggle
              label="Numeração automática de títulos"
              desc="Gera identificador sequencial automático para novos lançamentos."
              defaultChecked
            />
            <Toggle
              label="Aprovação em duas etapas"
              desc="Pagamentos acima de R$ 10.000 exigem aprovação adicional."
            />
            <Toggle label="Modo escuro (em breve)" desc="Habilite o tema escuro do sistema." />
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card className="p-6 border shadow-[var(--shadow-card)] max-w-3xl space-y-1">
            <Toggle
              label="Alertas de vencimento"
              desc="Receba e-mails sobre títulos próximos do vencimento."
              defaultChecked
            />
            <Toggle
              label="Resumo semanal"
              desc="Relatório consolidado toda segunda-feira pela manhã."
              defaultChecked
            />
            <Toggle
              label="Notificações no navegador"
              desc="Mostrar alertas push enquanto estiver no sistema."
            />
          </Card>
        </TabsContent>

        <TabsContent value="usuarios">
          <Card className="p-6 border shadow-[var(--shadow-card)] max-w-3xl">
            <h3 className="font-semibold text-primary-dark mb-1">Usuários</h3>
            <p className="text-xs text-muted-foreground mb-5">
              Gestão de acessos e permissões do sistema.
            </p>
            <div className="border rounded-lg divide-y">
              {[
                { n: "Administração ONRTDPJ", e: "admin@onrtdpj.org.br", r: "Administrador" },
                { n: "Carla Menezes", e: "carla.menezes@onrtdpj.org.br", r: "Financeiro" },
                { n: "Ricardo Almeida", e: "ricardo.almeida@onrtdpj.org.br", r: "Aprovador" },
              ].map((u) => (
                <div key={u.e} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-primary-dark">{u.n}</div>
                    <div className="text-xs text-muted-foreground">{u.e}</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {u.r}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input defaultValue={value} className="h-10" />
    </div>
  );
}

function Toggle({
  label,
  desc,
  defaultChecked,
}: {
  label: string;
  desc: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b last:border-0">
      <div>
        <div className="text-sm font-medium text-primary-dark">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
