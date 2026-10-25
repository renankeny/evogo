import React from "react";
import { NavLink } from "react-router-dom";
import { Terminal, BookOpen, Sun, Moon, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDarkMode } from "@/hooks/useDarkMode";
import { APP_VERSION } from "@/config/version";

export interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const { logout, apiUrl } = useAuth();
  const { theme, toggleTheme } = useDarkMode();

  const handleLogout = () => {
    logout();
  };

  const swaggerUrl = apiUrl
    ? `${apiUrl.replace(/\/$/, "")}/swagger/index.html`
    : "/swagger/index.html";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6 shadow-xs shrink-0">
      {/* Left: Mobile Menu Trigger + Brand (Mobile only) */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 rounded-md text-foreground hover:bg-muted cursor-pointer transition-colors"
          title="Abrir menu de navegação"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-bold text-base text-primary">Evolution GO</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {APP_VERSION}
          </span>
        </div>
      </div>

      {/* Left: Desktop Breadcrumb / Section */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">Painel Gerenciador</span>
      </div>

      {/* Right: Quick Tools, Theme Toggle & Logout */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <NavLink
          to="/manager/api-tester"
          className={({ isActive }) =>
            `flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/15 text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`
          }
          title="Testar endpoints da API interativamente"
        >
          <Terminal className="h-4 w-4" />
          <span className="hidden sm:inline">API Tester</span>
        </NavLink>

        <a
          href={swaggerUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Abrir Swagger em nova aba"
        >
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Swagger</span>
        </a>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          title={theme === "dark" ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
          aria-label="Alternar tema"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          title="Encerrar sessão"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
