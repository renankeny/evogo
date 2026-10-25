import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/layouts/Sidebar";
import { Header } from "@/layouts/Header";
import { LiveLogsProvider } from "@/contexts/LiveLogsContext";
import { FloatingLiveLogs } from "@/components/dashboard/FloatingLiveLogs";

export function DefaultLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <LiveLogsProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        {/* Sidebar (Desktop pinned + Mobile slide-over) */}
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <Header onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)} />
          <main className="flex-1 overflow-y-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Floating non-blocking live logs widget */}
      <FloatingLiveLogs />
    </LiveLogsProvider>
  );
}

