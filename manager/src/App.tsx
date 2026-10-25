import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DefaultLayout } from "@/layouts/DefaultLayout";
import { AuthGuard } from "@/guards/AuthGuard";
import { LiveLogsProvider } from "@/contexts/LiveLogsContext";
import { FloatingLiveLogs } from "@/components/dashboard/FloatingLiveLogs";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import InstancesPage from "@/pages/instances";
import InstanceSettingsPage from "@/pages/instanceSettings";
import ApiTesterPage from "@/pages/apiTester";

export function App() {
  return (
    <BrowserRouter>
      <LiveLogsProvider>
        <Routes>
          {/* Rota pública de login */}
          <Route path="/manager/login" element={<LoginPage />} />

          {/* Rotas protegidas dentro do DefaultLayout */}
          <Route
            path="/manager"
            element={
              <AuthGuard>
                <DefaultLayout />
              </AuthGuard>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="instances" element={<InstancesPage />} />
            <Route
              path="instances/:instanceId/settings"
              element={<InstanceSettingsPage />}
            />
            <Route path="api-tester" element={<ApiTesterPage />} />
            <Route path="*" element={<Navigate to="/manager" replace />} />
          </Route>

          {/* Fallback global */}
          <Route path="*" element={<Navigate to="/manager" replace />} />
        </Routes>

        {/* Global Floating Live Logs Console */}
        <FloatingLiveLogs />
      </LiveLogsProvider>
    </BrowserRouter>
  );
}

export default App;
