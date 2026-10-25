import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Smartphone, Terminal, BookOpen, ExternalLink, X } from "lucide-react";
import { APP_VERSION } from "@/config/version";

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const currentYear = new Date().getFullYear();

  const navItems = [
    { to: "/manager", label: "Dashboard", icon: LayoutDashboard },
    { to: "/manager/instances", label: "Instâncias", icon: Smartphone },
    { to: "/manager/api-tester", label: "API Tester", icon: Terminal },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const renderNavContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-card text-card-foreground">
      {/* Sidebar Header / Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm">
            EG
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground leading-tight">Evolution GO</h2>
            <span className="text-[10px] text-muted-foreground block">Painel Gerenciador</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {APP_VERSION}
          </span>
          {/* Close button ONLY for mobile drawer */}
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              title="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Nav items */}
      <nav className="space-y-1 flex-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/manager"}
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/15 text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`flex-shrink-0 h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-2 mt-2 border-t border-border/60">
          <a
            href="/swagger/index.html"
            target="_blank"
            rel="noreferrer noopener"
            onClick={handleLinkClick}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-sm font-medium"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="flex-shrink-0 h-4 w-4 text-primary" />
              <span>Documentação</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </a>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border mt-auto bg-muted/20">
        <div className="text-xs text-foreground font-medium flex items-center justify-between">
          <span>Servidor Ativo</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">© {currentYear} Evolution GO</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card shrink-0">
        {renderNavContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-50"
            onClick={onClose}
          />
          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-64 max-w-[85vw] bg-card border-r border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-200">
            {renderNavContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
