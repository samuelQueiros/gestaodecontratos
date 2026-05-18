import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Building2, Lock, Mail, ShieldCheck, TrendingUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      toast.success("Acesso autorizado", { description: "Bem-vindo ao sistema." });
      navigate({ to: "/dashboard" });
    } else {
      toast.error("Credenciais inválidas", { description: "Verifique seu e-mail e senha." });
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-background">
      <div
        className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden"
        style={{ background: "var(--gradient-brand)" }}
      >
        <div className="relative flex items-center gap-3">
          <div className="h-11 w-11 rounded bg-white/10 flex items-center justify-center ring-1 ring-white/20">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">ONRTDPJ</div>
            <div className="text-xs text-white/70">Gestão de Contratos</div>
          </div>
        </div>

        <div className="relative space-y-8 max-w-lg">
          <div>
            <h1 className="text-4xl font-bold tracking-tight leading-tight">
              Sistema Corporativo de Gestão Financeira
            </h1>
            <p className="mt-4 text-white/80 leading-relaxed">
              Centralize contratos, lançamentos, fornecedores e centros de custo em uma solução
              institucional para controle financeiro e rastreabilidade operacional.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, label: "Fluxo em tempo real" },
              { icon: ShieldCheck, label: "Auditoria completa" },
              { icon: FileText, label: "Conformidade fiscal" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded bg-white/10 ring-1 ring-white/15 p-4">
                <Icon className="h-5 w-5 mb-2" />
                <div className="text-xs font-medium text-white/90">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-white/60">
          © {new Date().getFullYear()} ONRTDPJ - Gestão de Contratos · Todos os direitos reservados
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded bg-primary-dark flex items-center justify-center text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-base text-primary-dark">ONRTDPJ</div>
              <div className="text-xs text-muted-foreground">Gestão de Contratos</div>
            </div>
          </div>

          <div className="bg-card border rounded p-8 shadow-[var(--shadow-card)]">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-primary-dark">Bem-vindo de volta</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Acesse sua conta institucional para gerenciar contratos e pagamentos.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail ou usuário</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin"
                    className="pl-9 h-11"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline font-medium"
                    onClick={() => toast.info("Entre em contato com o administrador do sistema.")}
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 h-11"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                Lembrar acesso neste dispositivo
              </label>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-semibold text-sm"
              >
                {loading ? "Autenticando..." : "Entrar no sistema"}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t text-xs text-muted-foreground text-center">
              Credenciais de demonstração:{" "}
              <span className="font-mono text-primary-dark">admin / admin123</span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Protegido por criptografia SSL · Conformidade LGPD
          </p>
        </div>
      </div>
    </div>
  );
}
