import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Smartphone } from "lucide-react";
import { APP_VERSION } from "@/config/version";

export function Sidebar() {
  const currentYear = new Date().getFullYear();

  const navItems = [
    { to: "/manager", label: "Dashboard", icon: LayoutDashboard },
    { to: "/manager/instances", label: "Instâncias", icon: Smartphone },
  ];

  return (
    <div className="hidden md:flex bg-sidebar text-sidebar-foreground flex-col w-56 border-r border-sidebar-border">
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <h2 className="text-lg font-bold text-primary">Evolution GO</h2>
        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
          {APP_VERSION}
        </span>
      </div>
      <nav className="space-y-1.5 flex-1 px-2 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/manager"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`flex-shrink-0 h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                <span className="font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className="text-sm text-primary font-medium flex items-center justify-between">
          <span>Evolution GO</span>
          <span className="text-xs text-muted-foreground font-mono">{APP_VERSION}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">© {currentYear} All rights reserved</div>
      </div>
    </div>
  );
}
