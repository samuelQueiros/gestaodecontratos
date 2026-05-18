import * as React from "react";

type AuthUser = { name: string; email: string; role: string };
type AuthCtx = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const Ctx = React.createContext<AuthCtx | null>(null);
const KEY = "onrtdpj_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      setUser(null);
    }
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 450));
    if (email.trim().toLowerCase() === "admin" && password === "admin123") {
      const u: AuthUser = {
        name: "Administração ONRTDPJ",
        email: "admin@onrtdpj.org.br",
        role: "Administrador",
      };
      localStorage.setItem(KEY, JSON.stringify(u));
      setUser(u);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, isAuthenticated: !!user, login, logout }}>{children}</Ctx.Provider>
  );
}

export function useAuth() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
