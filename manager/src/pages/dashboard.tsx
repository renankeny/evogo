import React, { useState } from "react";
import { Smartphone, Activity, AlertTriangle, Percent, Plus, Send } from "lucide-react";
import { useInstances } from "@/hooks/useInstances";
import { useAuth } from "@/hooks/useAuth";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SystemStatusCard } from "@/components/dashboard/SystemStatusCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { InstanceOverviewTable } from "@/components/dashboard/InstanceOverviewTable";
import { CreateInstanceModal } from "@/components/instances/CreateInstanceModal";
import { QuickSendModal } from "@/components/dashboard/QuickSendModal";
import { useLiveLogs } from "@/contexts/LiveLogsContext";
import { Button } from "@/components/ui/Button";
import { instancesService } from "@/services/instancesService";
import type { CreateInstancePayload, InstanceDTO } from "@/types/InstanceDTO";

export default function DashboardPage() {
  const { instances, loading, fetchInstances, createInstance } = useInstances(10000);
  const { apiKey, apiUrl } = useAuth();
  const { openLogs } = useLiveLogs();

  // Modais
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isQuickSendOpen, setIsQuickSendOpen] = useState(false);
  const [quickSendPreselectedId, setQuickSendPreselectedId] = useState<string | undefined>(undefined);

  const totalInstances = instances.length;
  const connectedCount = instances.filter((i) => i.connected || i.status === "open").length;
  const disconnectedCount = totalInstances - connectedCount;
  const connectionRate =
    totalInstances > 0 ? Math.round((connectedCount / totalInstances) * 100) : 0;

  const handleOpenQuickSend = (instance?: InstanceDTO) => {
    setQuickSendPreselectedId(instance ? instance.id : undefined);
    setIsQuickSendOpen(true);
  };

  const handleOpenLogs = (instance: InstanceDTO) => {
    openLogs(instance);
  };

  const handleReconnectAll = async () => {
    const disconnected = instances.filter((i) => !i.connected && i.status !== "open");
    const tokens = disconnected.map((i) => i.apikey).filter(Boolean);
    if (tokens.length > 0) {
      await instancesService.reconnectAll(tokens);
      await fetchInstances();
    }
  };

  return (
    <PageContainer>
      {/* Standard Page Header */}
      <PageHeader
        title="Dashboard"
        description="Visão geral e métricas operacionais do seu servidor Evolution GO."
      >
        <Button
          variant="outline"
          onClick={() => handleOpenQuickSend()}
          className="gap-1.5 sm:gap-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer text-xs sm:text-sm h-8 sm:h-9"
        >
          <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Disparo de Teste</span>
        </Button>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-1.5 sm:gap-2 cursor-pointer text-xs sm:text-sm h-8 sm:h-9"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Nova Instância</span>
        </Button>
      </PageHeader>

      {/* KPI Metric Cards: 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
          subtitle="Requerem conexão"
          icon={AlertTriangle}
          iconColor={disconnectedCount > 0 ? "text-amber-500" : "text-muted-foreground"}
        />

        <MetricCard
          id="kpi-connection-rate"
          title="Taxa de Conectividade"
          value={`${connectionRate}%`}
          subtitle="Disponibilidade global"
          icon={Percent}
          iconColor="text-purple-500"
        />
      </div>

      {/* Grid: Server Status & Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <SystemStatusCard id="card-server-status" isOnline={true} />
        <QuickActionsCard
          id="card-quick-actions"
          apiKey={apiKey || ""}
          apiUrl={apiUrl || ""}
          onOpenCreateModal={() => setIsCreateOpen(true)}
          onOpenQuickSend={() => handleOpenQuickSend()}
        />
      </div>

      {/* Instance Overview Table */}
      <InstanceOverviewTable
        id="card-instance-overview"
        instances={instances}
        loading={loading}
        onRefresh={() => fetchInstances()}
        onQuickSend={(inst) => handleOpenQuickSend(inst)}
        onViewLogs={(inst) => handleOpenLogs(inst)}
        onReconnectAll={handleReconnectAll}
      />

      {/* Modal Nova Instância */}
      <CreateInstanceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (payload: CreateInstancePayload) => {
          await createInstance(payload);
        }}
      />

      {/* Modal Disparo Rápido de Teste */}
      <QuickSendModal
        isOpen={isQuickSendOpen}
        onClose={() => setIsQuickSendOpen(false)}
        instances={instances}
        preselectedInstanceId={quickSendPreselectedId}
      />
    </PageContainer>
  );
}

