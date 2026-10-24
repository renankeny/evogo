import React, { useState } from "react";
import { Smartphone, Activity, AlertTriangle, Percent } from "lucide-react";
import { useInstances } from "@/hooks/useInstances";
import { useAuth } from "@/hooks/useAuth";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SystemStatusCard } from "@/components/dashboard/SystemStatusCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { InstanceOverviewTable } from "@/components/dashboard/InstanceOverviewTable";
import { CreateInstanceModal } from "@/components/instances/CreateInstanceModal";
import type { CreateInstancePayload } from "@/types/InstanceDTO";

export default function DashboardPage() {
  const { instances, loading, fetchInstances, createInstance } = useInstances(10000);
  const { apiKey, apiUrl } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const totalInstances = instances.length;
  const connectedCount = instances.filter((i) => i.connected || i.status === "open").length;
  const disconnectedCount = totalInstances - connectedCount;
  const connectionRate =
    totalInstances > 0 ? Math.round((connectedCount / totalInstances) * 100) : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral e métricas operacionais do seu servidor Evolution GO.
        </p>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          id="kpi-total-instances"
          title="Total de Instâncias"
          value={totalInstances}
          subtitle="Instâncias cadastradas"
          icon={Smartphone}
          iconColor="text-blue-500"
        />

        <MetricCard
          id="kpi-connected-instances"
          title="Instâncias Online"
          value={connectedCount}
          subtitle="Sessões ativas no WhatsApp"
          icon={Activity}
          iconColor="text-emerald-500"
          pulse={connectedCount > 0}
        />

        <MetricCard
          id="kpi-disconnected-instances"
          title="Desconectadas"
          value={disconnectedCount}
          subtitle="Requerem conexão ou QR Code"
          icon={AlertTriangle}
          iconColor={disconnectedCount > 0 ? "text-amber-500" : "text-muted-foreground"}
        />

        <MetricCard
          id="kpi-connection-rate"
          title="Taxa de Conectividade"
          value={`${connectionRate}%`}
          subtitle="Disponibilidade global da frota"
          icon={Percent}
          iconColor="text-purple-500"
        />
      </div>

      {/* Grid: Server Status & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SystemStatusCard id="card-server-status" isOnline={true} />
        <QuickActionsCard
          id="card-quick-actions"
          apiKey={apiKey || ""}
          apiUrl={apiUrl || ""}
          onOpenCreateModal={() => setIsCreateOpen(true)}
        />
      </div>

      {/* Instance Overview Table */}
      <InstanceOverviewTable
        id="card-instance-overview"
        instances={instances}
        loading={loading}
        onRefresh={() => fetchInstances()}
      />

      {/* Modal Nova Instância */}
      <CreateInstanceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (payload: CreateInstancePayload) => {
          await createInstance(payload);
        }}
      />
    </div>
  );
}
