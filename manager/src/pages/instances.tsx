import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Smartphone } from "lucide-react";
import { useInstances } from "@/hooks/useInstances";
import { useLiveLogs } from "@/contexts/LiveLogsContext";
import { Button } from "@/components/ui/Button";
import { InstanceCard } from "@/components/instances/InstanceCard";
import { CreateInstanceModal } from "@/components/instances/CreateInstanceModal";
import { QrCodeModal } from "@/components/instances/QrCodeModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { InstanceDTO, CreateInstancePayload } from "@/types/InstanceDTO";

export default function InstancesPage() {
  const navigate = useNavigate();
  const {
    instances,
    loading,
    fetchInstances,
    createInstance,
    connectInstance,
    disconnectInstance,
    deleteInstance,
    getQrCode,
  } = useInstances(3000);

  const { openLogs } = useLiveLogs();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<InstanceDTO | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | undefined>(undefined);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);

  // Estados para modais de confirmação
  const [instanceToDelete, setInstanceToDelete] = useState<InstanceDTO | null>(null);
  const [instanceToDisconnect, setInstanceToDisconnect] = useState<InstanceDTO | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Monitora em tempo real se a instância selecionada no modal conectou
  const activeSelectedInstance = selectedInstance
    ? instances.find((i) => i.id === selectedInstance.id || i.name === selectedInstance.name)
    : null;

  const isModalConnected = Boolean(
    activeSelectedInstance?.connected || activeSelectedInstance?.status === "open"
  );

  // Polling rápido (1.5s) enquanto o modal do QR code estiver aberto aguardando conexão
  useEffect(() => {
    if (!isQrModalOpen || isModalConnected) return;

    const timer = setInterval(() => {
      fetchInstances(true);
    }, 1500);

    return () => clearInterval(timer);
  }, [isQrModalOpen, isModalConnected, fetchInstances]);

  // Quando detectar que conectou com sucesso, exibe a tela de sucesso e fecha após 1.8s
  useEffect(() => {
    if (isQrModalOpen && isModalConnected) {
      const closeTimer = setTimeout(() => {
        setIsQrModalOpen(false);
        setSelectedInstance(null);
        setQrCodeBase64(undefined);
      }, 1800);
      return () => clearTimeout(closeTimer);
    }
  }, [isQrModalOpen, isModalConnected]);

  const filteredInstances = instances.filter((inst) =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inst.owner && inst.owner.includes(searchTerm))
  );

  const handleConnect = async (instance: InstanceDTO) => {
    setSelectedInstance(instance);
    setIsQrModalOpen(true);
    setQrLoading(true);
    try {
      await connectInstance(instance.apikey);
      const qr = await getQrCode(instance.apikey);
      setQrCodeBase64(qr);
    } catch (e) {
      console.error("Erro ao conectar instância:", e);
    } finally {
      setQrLoading(false);
    }
  };

  const handleRefreshQr = async () => {
    if (!selectedInstance) return;
    setQrLoading(true);
    try {
      const qr = await getQrCode(selectedInstance.apikey);
      setQrCodeBase64(qr);
    } catch (e) {
      console.error("Erro ao atualizar QR Code:", e);
    } finally {
      setQrLoading(false);
    }
  };

  const handleConfirmDisconnect = async () => {
    if (!instanceToDisconnect) return;
    setActionLoading(true);
    try {
      await disconnectInstance(instanceToDisconnect.apikey);
      setInstanceToDisconnect(null);
    } catch (e) {
      console.error("Erro ao desconectar instância:", e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!instanceToDelete) return;
    setActionLoading(true);
    try {
      await deleteInstance(instanceToDelete.id);
      setInstanceToDelete(null);
    } catch (e) {
      console.error("Erro ao excluir instância:", e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Page Header */}
      <div className="space-y-6 mb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-sidebar-foreground mb-2 dark:text-gray-200">
              Instâncias
            </h1>
            <p className="text-sm text-sidebar-foreground/70 dark:text-gray-400">
              Gerencie suas instâncias WhatsApp do Evolution GO
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Nova Instância
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/60 dark:text-gray-200 pointer-events-none" />
              <input
                type="search"
                placeholder="Buscar instâncias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md pl-9 pr-4 py-2 text-sm bg-sidebar border border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary dark:text-gray-400 dark:placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid or Empty State */}
      <div className="flex-1 overflow-auto">
        {filteredInstances.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center border border-dashed border-sidebar-border rounded-lg min-h-[300px]">
            <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Nenhuma instância encontrada
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm
                ? "Nenhuma instância corresponde ao filtro."
                : "Crie sua primeira instância para começar a usar o Evolution GO"}
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>Nova Instância</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredInstances.map((instance) => (
              <InstanceCard
                key={instance.id || instance.name}
                instance={instance}
                onConnect={handleConnect}
                onDisconnect={(inst) => setInstanceToDisconnect(inst)}
                onDelete={(inst) => setInstanceToDelete(inst)}
                onSettings={(inst) => navigate(`/manager/instances/${inst.id}/settings`)}
                loadingAction={loading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Criar Instância */}
      <CreateInstanceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (payload: CreateInstancePayload) => {
          await createInstance(payload);
        }}
      />

      {/* Modal QR Code */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => {
          setIsQrModalOpen(false);
          setSelectedInstance(null);
          setQrCodeBase64(undefined);
        }}
        instanceName={selectedInstance?.name || "Instância"}
        qrCodeBase64={qrCodeBase64 || selectedInstance?.qrcode?.base64}
        onRefreshQr={handleRefreshQr}
        loading={qrLoading}
        isConnected={isModalConnected}
      />

      {/* Modal Confirmar Desconexão */}
      <ConfirmModal
        isOpen={Boolean(instanceToDisconnect)}
        onClose={() => setInstanceToDisconnect(null)}
        onConfirm={handleConfirmDisconnect}
        title="Desconectar Instância"
        description={
          <>
            Você está prestes a desconectar a sessão do WhatsApp da instância{" "}
            <strong className="text-foreground font-semibold">
              {instanceToDisconnect?.name}
            </strong>
            .
          </>
        }
        confirmText="Desconectar"
        cancelText="Cancelar"
        variant="warning"
        loading={actionLoading}
      />

      {/* Modal Confirmar Exclusão com Digitação de Nome */}
      <ConfirmModal
        isOpen={Boolean(instanceToDelete)}
        onClose={() => setInstanceToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Remover Instância"
        description={
          <>
            Você está prestes a remover a instância{" "}
            <strong className="text-red-500 font-semibold">
              {instanceToDelete?.name}
            </strong>
            . Esta ação é irreversível e excluirá todos os dados e credenciais associadas.
          </>
        }
        requireTextMatch={instanceToDelete?.name || ""}
        confirmText="Remover Instância"
        cancelText="Cancelar"
        variant="destructive"
        loading={actionLoading}
      />
    </div>
  );
}
