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
  Settings2,
  Webhook,
  Sliders,
  AlertTriangle,
  Radio,
  Copy,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { instancesService } from "@/services/instancesService";
import { getInstanceStatus } from "@/utils/instanceStatus";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
  const [copiedToken, setCopiedToken] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
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
  const [msgRejectCall, setMsgRejectCall] = useState("");
  const [readMessages, setReadMessages] = useState(false);
  const [ignoreGroups, setIgnoreGroups] = useState(false);
  const [ignoreStatus, setIgnoreStatus] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    if (!instanceId) return;
    try {
      if (!silent) setLoading(true);
      const data = await instancesService.getInfo(instanceId);
      setInstance(data);

      setWebhookUrl(data.webhook || "");
      setRabbitmqEnable(data.rabbitmqEnable || "");
      setWebsocketEnable(data.websocketEnable || "");
      setNatsEnable(data.natsEnable || "");

      if (data.events) {
        const evts = data.events.split(",").map((e) => e.trim()).filter(Boolean);
        const nonAll = WEBHOOK_EVENTS.filter((e) => e !== "ALL");
        const hasAllIndividual = nonAll.length > 0 && nonAll.every((e) => evts.includes(e));
        if (evts.includes("ALL") || hasAllIndividual) {
          setSelectedEvents(["ALL"]);
        } else {
          setSelectedEvents(evts);
        }
      } else {
        setSelectedEvents([]);
      }

      setAlwaysOnline(Boolean(data.alwaysOnline));
      setRejectCall(Boolean(data.rejectCall));
      setMsgRejectCall(data.msgRejectCall || "");
      setReadMessages(Boolean(data.readMessages));
      setIgnoreGroups(Boolean(data.ignoreGroups));
      setIgnoreStatus(Boolean(data.ignoreStatus));
    } catch (err: any) {
      if (!silent) {
        console.error("Erro ao carregar instância:", err);
        setFeedback("Erro ao carregar dados da instância.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [instanceId]);

  useEffect(() => {
    loadData(false);
    // Auto-sync connection status in background every 6 seconds
    const interval = setInterval(() => {
      loadData(true);
    }, 6000);
    return () => clearInterval(interval);
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

  const handleCopyToken = () => {
    if (!instance?.apikey) return;
    navigator.clipboard.writeText(instance.apikey);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleReconnect = async () => {
    if (!instance) return;
    setReconnecting(true);
    setFeedback(null);
    try {
      await instancesService.reconnect(instance.apikey);
      setFeedback("Comando de reconexão disparado com sucesso!");
      await loadData(true);
    } catch (err: any) {
      console.error("Erro ao reconectar:", err);
      setFeedback(err?.response?.data?.error || "Erro ao reconectar instância.");
    } finally {
      setReconnecting(false);
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
          msgRejectCall: msgRejectCall.trim(),
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
      <PageContainer maxWidth="narrow">
        <div className="flex h-64 items-center justify-center p-8 text-center">
          <p className="text-muted-foreground text-sm font-medium">Carregando configurações da instância...</p>
        </div>
      </PageContainer>
    );
  }

  if (!instance) {
    return (
      <PageContainer maxWidth="narrow">
        <div className="flex h-64 flex-col items-center justify-center p-8 text-center space-y-4">
          <p className="text-muted-foreground text-sm">Instância não encontrada ou removida.</p>
          <Button onClick={() => navigate("/manager/instances")}>
            Voltar para Instâncias
          </Button>
        </div>
      </PageContainer>
    );
  }

  const statusInfo = instance ? getInstanceStatus(instance) : null;
  const isConnected = statusInfo?.isOnline ?? false;

  return (
    <PageContainer maxWidth="narrow">
      {/* Standard Header with Back Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => navigate("/manager/instances")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-accent cursor-pointer transition-colors shrink-0"
          title="Voltar para instâncias"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <PageHeader
            title="Configurações da Instância"
            description={`Parâmetros, webhooks e comportamento operacional de "${instance.name}".`}
            badge={
              statusInfo && (
                <Badge variant={statusInfo.badgeVariant}>
                  <span
                    className={`h-1.5 w-1.5 rounded-full mr-1.5 inline-block shrink-0 ${statusInfo.dotClass}`}
                    style={{ backgroundColor: statusInfo.dotColor }}
                  />
                  {statusInfo.label}
                </Badge>
              )
            }
            className="pb-0 border-b-0"
          />
        </div>
        <button
          onClick={() => loadData(false)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-accent cursor-pointer transition-colors shrink-0"
          title="Atualizar dados agora"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {feedback && (
        <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary flex items-center justify-between">
          <span className="font-medium">{feedback}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-primary hover:opacity-80 text-xs font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Card 1: Informações Gerais */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            Informações da Instância
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-md bg-muted/30 border border-border/50">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Nome</label>
              <p className="mt-1 text-sm text-foreground font-medium">{instance.name}</p>
            </div>

            <div className="p-3 rounded-md bg-muted/30 border border-border/50">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Token de Autenticação</label>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-xs text-foreground font-mono truncate">
                  {showToken ? instance.apikey : "•".repeat(Math.min(instance.apikey?.length || 16, 24))}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    title="Copiar Token"
                  >
                    {copiedToken ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    title={showToken ? "Ocultar" : "Mostrar"}
                  >
                    {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-md bg-muted/30 border border-border/50">
              <label className="text-xs font-semibold text-muted-foreground uppercase">WhatsApp / JID</label>
              <p className="mt-1 text-sm text-foreground font-mono">
                {instance.owner ? `+${instance.owner}` : "Não pareado"}
              </p>
            </div>

            <div className="p-3 rounded-md bg-muted/30 border border-border/50">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Criado em</label>
              <p className="mt-1 text-sm text-muted-foreground">
                {instance.createdAt ? new Date(instance.createdAt).toLocaleString("pt-BR") : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Webhooks & Eventos */}
      <form onSubmit={handleSaveWebhook}>
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Webhook className="h-4 w-4 text-primary" />
              Configurações de Webhook
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <label htmlFor="webhookUrl" className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                URL de Destino do Webhook
              </label>
              <input
                id="webhookUrl"
                type="url"
                placeholder="https://seu-sistema.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Endpoint que receberá payloads JSON de mensagens e conexões em tempo real.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2">
                Eventos Inscritos
              </label>
              <div className="space-y-2 rounded-md border border-border/60 bg-muted/20 p-3 max-h-60 overflow-y-auto">
                <div className="p-2 rounded-md bg-primary/10 border border-primary/20">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes("ALL")}
                      onChange={() => handleEventToggle("ALL")}
                      className="rounded border-input w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-primary">
                      ALL (Assinar todos os eventos disponíveis)
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                  {WEBHOOK_EVENTS.filter((e) => e !== "ALL").map((evt) => {
                    const isChecked = selectedEvents.includes(evt) || selectedEvents.includes("ALL");
                    return (
                      <label
                        key={evt}
                        className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/60 p-1.5 rounded transition-colors"
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
                              ? "text-muted-foreground font-mono"
                              : "text-foreground font-mono font-medium"
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label htmlFor="rabbitmqEnable" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  RabbitMQ
                </label>
                <select
                  id="rabbitmqEnable"
                  value={rabbitmqEnable}
                  onChange={(e) => setRabbitmqEnable(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="">Padrão</option>
                  <option value="enabled">Habilitado</option>
                  <option value="disabled">Desabilitado</option>
                </select>
              </div>

              <div>
                <label htmlFor="websocketEnable" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  WebSocket
                </label>
                <select
                  id="websocketEnable"
                  value={websocketEnable}
                  onChange={(e) => setWebsocketEnable(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="">Padrão</option>
                  <option value="enabled">Habilitado</option>
                  <option value="disabled">Desabilitado</option>
                </select>
              </div>

              <div>
                <label htmlFor="natsEnable" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  NATS
                </label>
                <select
                  id="natsEnable"
                  value={natsEnable}
                  onChange={(e) => setNatsEnable(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="">Padrão</option>
                  <option value="enabled">Habilitado</option>
                  <option value="disabled">Desabilitado</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border/40">
              <Button type="submit" disabled={savingWebhook} className="gap-2 cursor-pointer">
                <Save className="h-4 w-4" />
                {savingWebhook ? "Salvando..." : "Salvar Webhook"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Card 3: Configurações Avançadas */}
      <form onSubmit={handleSaveAdvanced}>
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              Comportamento do WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <div>
                <label htmlFor="alwaysOnline" className="text-sm font-medium text-foreground cursor-pointer">
                  Always Online
                </label>
                <p className="text-xs text-muted-foreground">Manter status sempre online no WhatsApp.</p>
              </div>
              <input
                id="alwaysOnline"
                type="checkbox"
                checked={alwaysOnline}
                onChange={(e) => setAlwaysOnline(e.target.checked)}
                className="rounded border-input w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="py-2 border-b border-border/40 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="rejectCall" className="text-sm font-medium text-foreground cursor-pointer">
                    Reject Call
                  </label>
                  <p className="text-xs text-muted-foreground">Rejeitar chamadas de voz e vídeo automaticamente.</p>
                </div>
                <input
                  id="rejectCall"
                  type="checkbox"
                  checked={rejectCall}
                  onChange={(e) => setRejectCall(e.target.checked)}
                  className="rounded border-input w-4 h-4 cursor-pointer"
                />
              </div>

              {rejectCall && (
                <div className="pl-3 sm:pl-4 border-l-2 border-primary/40 space-y-1.5 pt-1">
                  <label htmlFor="msgRejectCall" className="block text-xs font-medium text-foreground">
                    Mensagem de Resposta Automática (Opcional)
                  </label>
                  <input
                    id="msgRejectCall"
                    type="text"
                    placeholder="ex: Não aceitamos chamadas. Por favor, envie uma mensagem de texto."
                    value={msgRejectCall}
                    onChange={(e) => setMsgRejectCall(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Esta mensagem será enviada via WhatsApp para quem ligar logo após a rejeição da chamada.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <div>
                <label htmlFor="readMessages" className="text-sm font-medium text-foreground cursor-pointer">
                  Read Messages
                </label>
                <p className="text-xs text-muted-foreground">Marcar mensagens recebidas como lidas automaticamente.</p>
              </div>
              <input
                id="readMessages"
                type="checkbox"
                checked={readMessages}
                onChange={(e) => setReadMessages(e.target.checked)}
                className="rounded border-input w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <div>
                <label htmlFor="ignoreGroups" className="text-sm font-medium text-foreground cursor-pointer">
                  Ignore Groups
                </label>
                <p className="text-xs text-muted-foreground">Ignorar notificações e mensagens enviadas em grupos.</p>
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
                <label htmlFor="ignoreStatus" className="text-sm font-medium text-foreground cursor-pointer">
                  Ignore Status
                </label>
                <p className="text-xs text-muted-foreground">Ignorar atualizações de status / stories de contatos.</p>
              </div>
              <input
                id="ignoreStatus"
                type="checkbox"
                checked={ignoreStatus}
                onChange={(e) => setIgnoreStatus(e.target.checked)}
                className="rounded border-input w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-border/40">
              <Button type="submit" disabled={savingAdvanced} className="gap-2 cursor-pointer">
                <Save className="h-4 w-4" />
                {savingAdvanced ? "Salvando..." : "Salvar Comportamento"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Card 4: Zona de Perigo */}
      <Card className="border-destructive/40 bg-destructive/5 shadow-xs">
        <CardHeader className="pb-3 border-b border-destructive/20">
          <CardTitle className="text-base font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Zona de Perigo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                {statusInfo?.isOnline ? "Desconectar Instância" : "Sessão Desconectada"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {statusInfo?.isOnline
                  ? "Encerra a sessão ativa do WhatsApp neste dispositivo."
                  : "A instância está desconectada. Você pode reconectar o socket da sessão agora."}
              </p>
            </div>
            {statusInfo?.isOnline ? (
              <Button
                variant="destructive"
                onClick={() => setIsDisconnectModalOpen(true)}
                className="gap-2 cursor-pointer shrink-0"
              >
                <Power className="h-4 w-4" />
                Desconectar
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleReconnect}
                disabled={reconnecting}
                className="gap-2 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer shrink-0"
              >
                <RotateCcw className={`h-4 w-4 ${reconnecting ? "animate-spin" : ""}`} />
                {reconnecting ? "Reconectando..." : "Reconectar Agora"}
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-destructive/20">
            <div>
              <h3 className="text-sm font-medium text-foreground">Remover Instância</h3>
              <p className="text-xs text-muted-foreground">Exclui permanentemente esta instância do banco de dados.</p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteModalOpen(true)}
              className="gap-2 cursor-pointer shrink-0"
            >
              <Trash2 className="h-4 w-4" />
              Deletar Instância
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modais de Confirmação */}
      <ConfirmModal
        isOpen={isDisconnectModalOpen}
        onClose={() => setIsDisconnectModalOpen(false)}
        onConfirm={handleConfirmDisconnect}
        title="Desconectar Instância"
        description={
          <>
            Você está prestes a desconectar a sessão do WhatsApp da instância{" "}
            <strong className="text-foreground font-semibold">{instance.name}</strong>.
          </>
        }
        confirmText="Desconectar"
        cancelText="Cancelar"
        variant="warning"
        loading={actionLoading}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remover Instância"
        description={
          <>
            Você está prestes a remover a instância{" "}
            <strong className="text-red-500 font-semibold">{instance.name}</strong>. Esta ação é irreversível.
          </>
        }
        requireTextMatch={instance.name}
        confirmText="Remover Instância"
        cancelText="Cancelar"
        variant="destructive"
        loading={actionLoading}
      />
    </PageContainer>
  );
}
