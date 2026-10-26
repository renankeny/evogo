/**
 * Utilitário centralizado para determinar o status de conexão de uma instância.
 * Garante paridade absoluta entre Cards de Instâncias, Tabelas e Modais.
 */

export type InstanceState = "connected" | "connecting" | "disconnected";

export interface InstanceStatusInfo {
  state: InstanceState;
  label: string;
  badgeVariant: "success" | "warning" | "destructive";
  badgeClass: string;
  dotColor: string;
  dotClass: string;
  isOnline: boolean;
  isConnecting: boolean;
  rawStatus: "open" | "connecting" | "close";
}

export function getInstanceStatus(instance: {
  connected?: boolean;
  status?: string;
  qrcode?: any;
}): InstanceStatusInfo {
  const isOnline = Boolean(instance.connected || instance.status === "open");
  const isConnecting =
    !isOnline &&
    (instance.status === "connecting" ||
      Boolean(instance.qrcode) ||
      (typeof instance.qrcode === "object" && Boolean(instance.qrcode?.base64)));

  if (isOnline) {
    return {
      state: "connected",
      label: "Conectado",
      badgeVariant: "success",
      badgeClass: "badge-status-connected",
      dotColor: "#22c55e",
      dotClass: "bg-green-500",
      isOnline: true,
      isConnecting: false,
      rawStatus: "open",
    };
  }

  if (isConnecting) {
    return {
      state: "connecting",
      label: "Conectando...",
      badgeVariant: "warning",
      badgeClass: "badge-status-connecting animate-pulse",
      dotColor: "#eab308",
      dotClass: "bg-yellow-500 animate-pulse",
      isOnline: false,
      isConnecting: true,
      rawStatus: "connecting",
    };
  }

  return {
    state: "disconnected",
    label: "Desconectado",
    badgeVariant: "destructive",
    badgeClass: "badge-status-disconnected",
    dotColor: "#ef4444",
    dotClass: "bg-red-500",
    isOnline: false,
    isConnecting: false,
    rawStatus: "close",
  };
}
