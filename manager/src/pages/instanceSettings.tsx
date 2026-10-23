import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Power,
  Trash2,
  Check,
} from "lucide-react";
import { instancesService } from "@/services/instancesService";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { InstanceDTO } from "@/types/InstanceDTO";

const WEBHOOK_EVENTS = [
  "ALL",
  "MESSAGE",
  "READ_RECEIPT",
  "PRESENCE",
  "HISTORY_SYNC",
  "CHAT_PRESENCE",
  "CALL",
  "CONNECTION",
  "QRCODE",
  "LABEL",
  "CONTACT",
  "GROUP",
  "NEWSLETTER",
];

export default function InstanceSettingsPage() {
  const { instanceId } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();

  const [instance, setInstance] = useState<InstanceDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [savingAdvanced, setSavingAdvanced] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Estados para modais de confirmação
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Webhook form state
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [rabbitmqEnable, setRabbitmqEnable] = useState("");
  const [websocketEnable, setWebsocketEnable] = useState("");
  const [natsEnable, setNatsEnable] = useState("");

  // Advanced settings state
  const [alwaysOnline, setAlwaysOnline] = useState(false);
  const [rejectCall, setRejectCall] = useState(false);
  const [readMessages, setReadMessages] = useState(false);
  const [ignoreGroups, setIgnoreGroups] = useState(false);
  const [ignoreStatus, setIgnoreStatus] = useState(false);

  const loadData = useCallback(async () => {
    if (!instanceId) return;
    try {
      setLoading(true);
      const data = await instancesService.getInfo(instanceId);
      setInstance(data);

      setWebhookUrl(data.webhook || "");
      setRabbitmqEnable(data.rabbitmqEnable || "");
      setWebsocketEnable(data.websocketEnable || "");
      setNatsEnable(data.natsEnable || "");

      if (data.events) {
        setSelectedEvents(
          data.events.split(",").map((e) => e.trim()).filter(Boolean)
        );
      } else {
        setSelectedEvents([]);
      }

      setAlwaysOnline(Boolean(data.alwaysOnline));
      setRejectCall(Boolean(data.rejectCall));
      setReadMessages(Boolean(data.readMessages));
      setIgnoreGroups(Boolean(data.ignoreGroups));
      setIgnoreStatus(Boolean(data.ignoreStatus));
    } catch (err: any) {
      console.error("Erro ao carregar instância:", err);
      setFeedback("Erro ao carregar dados da instância.");
    } finally {
      setLoading(false);
    }
  }, [instanceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEventToggle = (event: string) => {
    setSelectedEvents((prev) => {
      if (event === "ALL") {
        return prev.includes("ALL") ? [] : ["ALL"];
      }
      if (prev.includes("ALL")) {
        return [event];
      }
      return prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event];
    });
  };

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instance) return;
    setSavingWebhook(true);
    setFeedback(null);
    try {
      await instancesService.updateWebhook(instance.apikey, {
        webhookUrl,
        subscribe: selectedEvents,
        rabbitmqEnable,
        websocketEnable,
        natsEnable,
      });
      setFeedback("Configurações de Webhook atualizadas com sucesso!");
      await loadData();
    } catch (err: any) {
      console.error("Erro ao salvar webhook:", err);
      setFeedback(err?.response?.data?.error || "Erro ao salvar webhook.");
    } finally {
      setSavingWebhook(false);
    }
  };

  const handleSaveAdvanced = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instance) return;
    setSavingAdvanced(true);
    setFeedback(null);
    try {
      await instancesService.updateAdvancedSettings(
        instance.id,
        instance.apikey,
        {
          alwaysOnline,
          rejectCall,
          readMessages,
          ignoreGroups,
          ignoreStatus,
        }
      );
      setFeedback("Configurações avançadas atualizadas com sucesso!");
      await loadData();
    } catch (err: any) {
      console.error("Erro ao salvar configurações avançadas:", err);
      setFeedback(
        err?.response?.data?.error || "Erro ao salvar configurações avançadas."
      );
    } finally {
      setSavingAdvanced(false);
    }
  };

  const handleConfirmDisconnect = async () => {
    if (!instance) return;
    setActionLoading(true);
    try {
      await instancesService.disconnect(instance.apikey);
      setFeedback("Instância desconectada com sucesso!");
      setIsDisconnectModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error("Erro ao desconectar:", err);
      setFeedback("Erro ao desconectar instância.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!instance) return;
    setActionLoading(true);
    try {
      await instancesService.delete(instance.id);
      setIsDeleteModalOpen(false);
      navigate("/manager/instances");
    } catch (err: any) {
      console.error("Erro ao deletar:", err);
      setFeedback("Erro ao deletar instância.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground text-sm">Carregando configurações...</p>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground text-sm mb-4">Instância não encontrada.</p>
        <Button onClick={() => navigate("/manager/instances")}>
          Voltar para Instâncias
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="border-b border-sidebar-border bg-sidebar p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/manager/instances")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer transition-colors"
              title="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
              <p className="text-sm text-muted-foreground">{instance.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {feedback && (
            <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary flex items-center justify-between">
              <span>{feedback}</span>
              <button
                onClick={() => setFeedback(null)}
                className="text-primary hover:opacity-80 text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          )}

          {/* Card 1: Informações da Instância */}
          <div className="rounded-lg border border-sidebar-border bg-card p-6 shadow-xs">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Informações da Instância
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Nome da Instância
                </label>
                <p className="mt-1 text-sm text-muted-foreground font-medium">
                  {instance.name}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Token da Instância
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-sm text-muted-foreground font-mono">
                    {showToken
                      ? instance.apikey
                      : "•".repeat(Math.min(instance.apikey?.length || 16, 24))}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title={showToken ? "Ocultar token" : "Mostrar token"}
                  >
                    {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Status</label>
                <p className="mt-1 text-sm text-muted-foreground">
                  {instance.connected ? (
                    <span className="text-green-500 font-semibold">Conectado</span>
                  ) : (
                    <span className="text-red-500 font-semibold">Desconectado</span>
                  )}
                </p>
              </div>

              {instance.owner && (
                <div>
                  <label className="text-sm font-medium text-foreground">Número / JID</label>
                  <p className="mt-1 text-sm text-muted-foreground font-mono">
                    +{instance.owner}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Configurações de Webhook */}
          <form onSubmit={handleSaveWebhook}>
            <div className="rounded-lg border border-sidebar-border bg-card p-6 shadow-xs">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Configurações de Webhook
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="webhookUrl"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    URL do Webhook
                  </label>
                  <input
                    id="webhookUrl"
                    type="url"
                    placeholder="https://seu-servidor.com/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    URL que receberá os eventos do WhatsApp em tempo real.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Eventos para Webhook
                  </label>
                  <div className="space-y-2 rounded-md border border-input p-3 max-h-60 overflow-y-auto">
                    <div className="p-2 rounded-md bg-primary/10 border border-primary/20">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes("ALL")}
                          onChange={() => handleEventToggle("ALL")}
                          className="rounded border-input w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-primary">
                          ALL (Todos os Eventos)
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {WEBHOOK_EVENTS.filter((e) => e !== "ALL").map((evt) => {
                        const isChecked =
                          selectedEvents.includes(evt) || selectedEvents.includes("ALL");
                        return (
                          <label
                            key={evt}
                            className="flex items-center gap-2 text-xs cursor-pointer hover:bg-accent p-2 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleEventToggle(evt)}
                              disabled={selectedEvents.includes("ALL")}
                              className="rounded border-input cursor-pointer"
                            />
                            <span
                              className={
                                selectedEvents.includes("ALL")
                                  ? "text-muted-foreground"
                                  : "text-foreground font-mono"
                              }
                            >
                              {evt}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="rabbitmqEnable"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      RabbitMQ
                    </label>
                    <select
                      id="rabbitmqEnable"
                      value={rabbitmqEnable}
                      onChange={(e) => setRabbitmqEnable(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="">Padrão</option>
                      <option value="enabled">Habilitado</option>
                      <option value="disabled">Desabilitado</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="websocketEnable"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      WebSocket
                    </label>
                    <select
                      id="websocketEnable"
                      value={websocketEnable}
                      onChange={(e) => setWebsocketEnable(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="">Padrão</option>
                      <option value="enabled">Habilitado</option>
                      <option value="disabled">Desabilitado</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="natsEnable"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      NATS
                    </label>
                    <select
                      id="natsEnable"
                      value={natsEnable}
                      onChange={(e) => setNatsEnable(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="">Padrão</option>
                      <option value="enabled">Habilitado</option>
                      <option value="disabled">Desabilitado</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={savingWebhook} className="gap-2">
                    <Save className="h-4 w-4" />
                    {savingWebhook ? "Salvando..." : "Salvar Webhook"}
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {/* Card 3: Configurações Avançadas */}
          <form onSubmit={handleSaveAdvanced}>
            <div className="rounded-lg border border-sidebar-border bg-card p-6 shadow-xs">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Configurações Avançadas
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-sidebar-border/40">
                  <div>
                    <label
                      htmlFor="alwaysOnline"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Always Online
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Manter status sempre online no WhatsApp.
                    </p>
                  </div>
                  <input
                    id="alwaysOnline"
                    type="checkbox"
                    checked={alwaysOnline}
                    onChange={(e) => setAlwaysOnline(e.target.checked)}
                    className="rounded border-input w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-sidebar-border/40">
                  <div>
                    <label
                      htmlFor="rejectCall"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Reject Call
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Rejeitar chamadas de voz e vídeo automaticamente.
                    </p>
                  </div>
                  <input
                    id="rejectCall"
                    type="checkbox"
                    checked={rejectCall}
                    onChange={(e) => setRejectCall(e.target.checked)}
                    className="rounded border-input w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-sidebar-border/40">
                  <div>
                    <label
                      htmlFor="readMessages"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Read Messages
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Marcar mensagens recebidas como lidas automaticamente.
                    </p>
                  </div>
                  <input
                    id="readMessages"
                    type="checkbox"
                    checked={readMessages}
                    onChange={(e) => setReadMessages(e.target.checked)}
                    className="rounded border-input w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-sidebar-border/40">
                  <div>
                    <label
                      htmlFor="ignoreGroups"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Ignore Groups
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Ignorar notificações e mensagens enviadas em grupos.
                    </p>
                  </div>
                  <input
                    id="ignoreGroups"
                    type="checkbox"
                    checked={ignoreGroups}
                    onChange={(e) => setIgnoreGroups(e.target.checked)}
                    className="rounded border-input w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <label
                      htmlFor="ignoreStatus"
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Ignore Status
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Ignorar atualizações de status / stories de contatos.
                    </p>
                  </div>
                  <input
                    id="ignoreStatus"
                    type="checkbox"
                    checked={ignoreStatus}
                    onChange={(e) => setIgnoreStatus(e.target.checked)}
                    className="rounded border-input w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={savingAdvanced} className="gap-2">
                    <Save className="h-4 w-4" />
                    {savingAdvanced ? "Salvando..." : "Salvar Avançadas"}
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {/* Card 4: Zona de Perigo */}
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 shadow-xs">
            <h2 className="text-lg font-semibold text-destructive mb-4">
              Zona de Perigo
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    Desconectar Instância
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Desconecta a sessão ativa do WhatsApp.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setIsDisconnectModalOpen(true)}
                  className="gap-2 cursor-pointer"
                >
                  <Power className="h-4 w-4" />
                  Desconectar
                </Button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-destructive/20">
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    Deletar Instância
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Remove permanentemente esta instância do banco de dados.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="gap-2 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Deletar Instância
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Confirmar Desconexão */}
      <ConfirmModal
        isOpen={isDisconnectModalOpen}
        onClose={() => setIsDisconnectModalOpen(false)}
        onConfirm={handleConfirmDisconnect}
        title="Desconectar Instância"
        description={
          <>
            Você está prestes a desconectar a sessão do WhatsApp da instância{" "}
            <strong className="text-foreground font-semibold">
              {instance.name}
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
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remover Instância"
        description={
          <>
            Você está prestes a remover a instância{" "}
            <strong className="text-red-500 font-semibold">
              {instance.name}
            </strong>
            . Esta ação é irreversível e excluirá todos os dados e credenciais associadas.
          </>
        }
        requireTextMatch={instance.name}
        confirmText="Remover Instância"
        cancelText="Cancelar"
        variant="destructive"
        loading={actionLoading}
      />
    </div>
  );
}

