import React from "react";
import { NavLink } from "react-router-dom";
import { FlaskConical, BookOpen, Sun, Moon, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDarkMode } from "@/hooks/useDarkMode";
import { APP_VERSION } from "@/config/version";

export function Header() {
  const { logout, apiUrl } = useAuth();
  const { theme, toggleTheme } = useDarkMode();

  const handleLogout = () => {
    logout();
  };

  const swaggerUrl = apiUrl
    ? `${apiUrl.replace(/\/$/, "")}/swagger/index.html`
    : "/swagger/index.html";

  return (
    <header className="flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar px-0 py-3 shadow-sm">
      <div className="flex items-center gap-2 px-4 md:hidden">
        <span className="font-bold text-primary">Evolution GO</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/25">
          {APP_VERSION}
        </span>
      </div>
      <div className="hidden md:block w-56 px-4"></div>
      <div className="flex items-center gap-2 px-4">
        <NavLink
          to="/manager/api-tester"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-purple-500/15 text-purple-400"
                : "text-sidebar-foreground hover:bg-sidebar-accent dark:text-gray-200 dark:hover:bg-sidebar-accent"
            }`
          }
          title="Testar endpoints da API interativamente"
        >
          <FlaskConical className="h-4 w-4" />
          <span className="hidden sm:inline">API Tester</span>
        </NavLink>
        <a
          href={swaggerUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent dark:text-gray-200 dark:hover:bg-sidebar-accent"
          title="Abrir Swagger em nova aba"
        >
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Swagger</span>
        </a>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent dark:text-gray-200 dark:hover:bg-sidebar-accent cursor-pointer"
          title={theme === "dark" ? "Modo claro" : "Modo escuro"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent dark:text-gray-200 dark:hover:bg-sidebar-accent cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
}
