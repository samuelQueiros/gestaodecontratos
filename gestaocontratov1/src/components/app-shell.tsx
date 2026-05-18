import * as React from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Tag,
  Building,
  Wallet,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronRight,
  LogOut,
  Building2,
  HelpCircle,
  Plus,
  IdCard,
  Check,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  search?: Record<string, string>;
};

const ONR_NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contas-a-pagar", label: "Contas a Pagar", icon: Receipt },
  { to: "/fornecedores", label: "Fornecedores", icon: Users },
  { to: "/categorias", label: "Categorias", icon: Tag },
  { to: "/centros-de-custo", label: "Centros de Custo", icon: Building },
  { to: "/contas-bancarias", label: "Contas Bancárias", icon: Wallet },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

const IRTDPJ_NAV: NavItem[] = [
  { to: "/associados-irtdpj", label: "Dashboard", icon: LayoutDashboard, search: { tab: "visao" } },
  { to: "/associados-irtdpj", label: "Remessas", icon: Receipt, search: { tab: "remessas" } },
  {
    to: "/associados-irtdpj",
    label: "Competencias",
    icon: Check,
    search: { tab: "competencias" },
  },
  { to: "/associados-irtdpj", label: "Associados", icon: IdCard, search: { tab: "associados" } },
  { to: "/associados-irtdpj", label: "Extrato mensal", icon: Wallet, search: { tab: "extrato" } },
  {
    to: "/associados-irtdpj",
    label: "Pendencias",
    icon: AlertTriangle,
    search: { tab: "pendencias" },
  },
  { to: "/associados-irtdpj", label: "Relatorios", icon: BarChart3, search: { tab: "relatorios" } },
  { to: "/configuracoes", label: "Configuracoes", icon: Settings },
];

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  "contas-a-pagar": "Contas a Pagar",
  "associados-irtdpj": "Associados IRTDPJ",
  fornecedores: "Fornecedores",
  categorias: "Categorias",
  "centros-de-custo": "Centros de Custo",
  "contas-bancarias": "Contas Bancárias",
  relatorios: "Relatórios",
  configuracoes: "Configurações",
  nova: "Nova Despesa",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useRouterState({ select: (s) => s.location });
  const pathname = location.pathname;
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = React.useState<"ONRTDPJ" | "IRTDPJ">(() => {
    if (typeof window === "undefined") return "ONRTDPJ";
    if (window.location.pathname.includes("associados-irtdpj")) return "IRTDPJ";
    return localStorage.getItem("erp-profile") === "IRTDPJ" ? "IRTDPJ" : "ONRTDPJ";
  });

  const activeTab =
    typeof location.search === "object" && location.search
      ? String((location.search as Record<string, unknown>).tab ?? "visao")
      : "visao";
  const nav = profile === "IRTDPJ" ? IRTDPJ_NAV : ONR_NAV;
  const profileLabel = profile === "IRTDPJ" ? "IRTDPJ" : "ONRTDPJ";
  const profileMode = profile === "IRTDPJ" ? "Associados" : "Corporativo";

  function changeProfile(nextProfile: "ONRTDPJ" | "IRTDPJ") {
    setProfile(nextProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem("erp-profile", nextProfile);
    }
    if (nextProfile === "IRTDPJ") {
      navigate({ to: "/associados-irtdpj", search: { tab: "visao" } });
    } else {
      navigate({ to: "/dashboard" });
    }
  }

  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="min-h-screen flex bg-muted/40">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded bg-primary flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-white">{profileLabel}</div>
            <div className="text-[10.5px] uppercase tracking-wider text-sidebar-foreground/60">
              {profile === "IRTDPJ" ? "Associados IRTDPJ" : "Gestao de Contratos"}
            </div>
          </div>
        </div>

        <div className="px-3 py-4">
          <Button
            onClick={() =>
              profile === "IRTDPJ"
                ? navigate({ to: "/associados-irtdpj", search: { tab: "remessas" } })
                : navigate({ to: "/contas-a-pagar/nova" })
            }
            className="w-full justify-start gap-2 h-10 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {profile === "IRTDPJ" ? "Ver remessas" : "Nova despesa"}
          </Button>
        </div>

        <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
          <div className="px-3 pt-2 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Menu principal
          </div>
          {nav.map((item) => {
            const active =
              pathname === item.to &&
              (!item.search?.tab || activeTab === item.search.tab || pathname === "/configuracoes");
            const Icon = item.icon;
            return (
              <Link
                key={`${item.to}-${item.label}`}
                to={item.to}
                search={item.search}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-white",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-9 w-9 ring-2 ring-sidebar-accent">
              <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                {user?.name?.[0] ?? "A"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-white truncate">{user?.name}</div>
              <div className="text-[11px] text-sidebar-foreground/60 truncate">{user?.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b flex items-center gap-4 px-6 sticky top-0 z-30">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar lançamentos, fornecedores, contratos..."
                className="pl-9 h-10 bg-muted/50 border-transparent focus-visible:bg-background"
              />
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/60 hover:bg-muted transition-colors">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary-dark">{profileLabel}</span>
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                  {profileMode}
                </Badge>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Perfil de visao</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["ONRTDPJ", "IRTDPJ"] as const).map((item) => (
                <DropdownMenuItem
                  key={item}
                  onSelect={() => changeProfile(item)}
                  className="flex items-center justify-between"
                >
                  <span>{item}</span>
                  {profile === item && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="p-4 border-b">
                <div className="font-semibold text-sm">Notificações</div>
                <div className="text-xs text-muted-foreground">3 não lidas</div>
              </div>
              <ul className="divide-y max-h-80 overflow-auto">
                {[
                  { t: "5 contas vencem amanhã", d: "Total: R$ 18.420,00", time: "agora" },
                  {
                    t: "Pagamento confirmado",
                    d: "ONR Tecnologia Registral LTDA - R$ 4.200,00",
                    time: "2h",
                  },
                  {
                    t: "Novo fornecedor cadastrado",
                    d: "Logística Documental Integrada LTDA",
                    time: "1d",
                  },
                ].map((n) => (
                  <li key={n.t} className="p-4 hover:bg-muted/50 cursor-pointer">
                    <div className="text-sm font-medium">{n.t}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{n.d}</div>
                    <div className="text-[11px] text-primary mt-1">{n.time}</div>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg pl-1 pr-2 py-1 hover:bg-muted transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary-dark text-white text-xs font-semibold">
                    {user?.name?.[0] ?? "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-xs font-semibold text-primary-dark">{user?.name}</div>
                  <div className="text-[10.5px] text-muted-foreground">{user?.role}</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate({ to: "/configuracoes" })}>
                <Settings className="h-4 w-4 mr-2" /> Preferências
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  logout();
                  navigate({ to: "/login" });
                }}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="px-6 lg:px-8 pt-5">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() =>
                profile === "IRTDPJ"
                  ? navigate({ to: "/associados-irtdpj", search: { tab: "visao" } })
                  : navigate({ to: "/dashboard" })
              }
              className="hover:text-primary transition-colors"
            >
              Início
            </button>
            {segments.map((s, i) => (
              <React.Fragment key={i}>
                <ChevronRight className="h-3 w-3" />
                <span className={cn(i === segments.length - 1 && "text-primary-dark font-medium")}>
                  {ROUTE_LABELS[s] ?? s}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        <main className="flex-1 px-6 lg:px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
