import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  fornecedores,
  categorias,
  centrosCusto,
  contasBancarias,
  formasPagamento,
} from "@/lib/mock-data";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/contas-a-pagar/nova")({
  component: NovaDespesa,
});

function NovaDespesa() {
  const navigate = useNavigate();
  const [competencia, setCompetencia] = useState<Date>();
  const [vencimento, setVencimento] = useState<Date>();
  const [repetir, setRepetir] = useState(false);
  const [rateio, setRateio] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Despesa cadastrada com sucesso!", {
      description: "O lançamento foi adicionado ao módulo Contas a Pagar.",
    });
    navigate({ to: "/contas-a-pagar" });
  }

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
            title="Nova despesa"
            description="Cadastre um novo lançamento no contas a pagar."
          />
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <Card className="border shadow-[var(--shadow-card)]">
            <SectionHeader title="Informações do lançamento" subtitle="Dados básicos da despesa" />
            <div className="p-6 pt-0 grid sm:grid-cols-2 gap-5">
              <Field label="Fornecedor" required>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Categoria" required>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Centro de custo">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {centrosCusto.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Valor (R$)" required>
                <Input type="text" inputMode="decimal" placeholder="0,00" required />
              </Field>
              <Field label="Data de competência">
                <DatePick date={competencia} setDate={setCompetencia} />
              </Field>
              <Field label="Data de vencimento" required>
                <DatePick date={vencimento} setDate={setVencimento} />
              </Field>
              <Field label="Descrição" className="sm:col-span-2">
                <Textarea
                  rows={3}
                  placeholder="Descreva o lançamento, número da nota fiscal, observações..."
                />
              </Field>
            </div>
          </Card>

          <Card className="border shadow-[var(--shadow-card)]">
            <SectionHeader title="Condição de pagamento" subtitle="Defina forma e parcelamento" />
            <div className="p-6 pt-0 grid sm:grid-cols-2 gap-5">
              <Field label="Forma de pagamento" required>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {formasPagamento.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Parcelamento">
                <Select defaultValue="1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">À vista</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                    <SelectItem value="3">3x</SelectItem>
                    <SelectItem value="6">6x</SelectItem>
                    <SelectItem value="12">12x</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Conta bancária" required className="sm:col-span-2">
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta de débito" />
                  </SelectTrigger>
                  <SelectContent>
                    {contasBancarias.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="sm:col-span-2 grid sm:grid-cols-2 gap-3 pt-2">
                <ToggleRow
                  label="Repetir lançamento"
                  desc="Cria recorrência mensal automática"
                  checked={repetir}
                  onChange={setRepetir}
                />
                <ToggleRow
                  label="Habilitar rateio"
                  desc="Distribui o valor entre centros de custo"
                  checked={rateio}
                  onChange={setRateio}
                />
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          <Card className="p-5 border shadow-[var(--shadow-card)]">
            <h4 className="font-semibold text-primary-dark text-sm">Resumo do lançamento</h4>
            <p className="text-xs text-muted-foreground mt-1">Confira os dados antes de salvar.</p>
            <dl className="mt-4 space-y-3 text-sm">
              <Row k="Tipo" v="Despesa" />
              <Row k="Status" v="A vencer" />
              <Row k="Empresa" v="ONRTDPJ" />
              <Row k="Usuário" v="Administração ONRTDPJ" />
            </dl>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit" className="gap-2 h-11">
              <Save className="h-4 w-4" /> Salvar lançamento
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2 h-11"
              onClick={() => navigate({ to: "/contas-a-pagar" })}
            >
              <X className="h-4 w-4" /> Cancelar
            </Button>
          </div>
        </aside>
      </form>
    </>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="p-6 pb-4">
      <h3 className="font-semibold text-primary-dark">{title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function DatePick({ date, setDate }: { date?: Date; setDate: (d?: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("justify-start font-normal h-10", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          {date ? format(date, "dd/MM/yyyy") : "Selecione a data"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer hover:bg-muted/40 transition-colors">
      <Switch checked={checked} onCheckedChange={onChange} className="mt-0.5" />
      <div className="flex-1">
        <div className="text-sm font-medium text-primary-dark">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-primary-dark">{v}</dd>
    </div>
  );
}
