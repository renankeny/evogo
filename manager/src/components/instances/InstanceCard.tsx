import React from "react";
import { QrCode, Power, Trash2, Smartphone, Settings } from "lucide-react";
import { maskApiKey } from "@/utils/maskApiKey";
import type { InstanceDTO } from "@/types/InstanceDTO";

export interface InstanceCardProps {
  instance: InstanceDTO;
  onConnect: (instance: InstanceDTO) => void;
  onDisconnect: (instance: InstanceDTO) => void;
  onSettings?: (instance: InstanceDTO) => void;
  onForceReconnect?: (instance: InstanceDTO) => void;
  onDelete: (instance: InstanceDTO) => void;
  loadingAction?: boolean;
}

export function InstanceCard({
  instance,
  onConnect,
  onDisconnect,
  onSettings,
  onDelete,
}: InstanceCardProps) {
  const isConnected = Boolean(instance.connected || instance.status === "open");
  const isConnecting = !isConnected && (instance.status === "connecting" || Boolean(instance.qrcode));

  return (
    <div className="group relative bg-sidebar border border-sidebar-border hover:bg-sidebar-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-black/10 overflow-hidden rounded-lg">
      <div className="p-0">
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          {instance.profilePicUrl ? (
            <div className="flex-shrink-0 dark">
              <div className="rounded-lg bg-gray-900 flex items-center justify-center w-14 h-14 overflow-hidden">
                <img
                  src={instance.profilePicUrl}
                  alt={instance.name}
                  className="w-12 h-12 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-muted flex items-center justify-center w-12 h-12 overflow-hidden flex-shrink-0">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate text-sidebar-foreground">
              {instance.profileName || instance.name}
            </h3>
            <p className="text-xs text-sidebar-foreground/60 truncate">{instance.name}</p>
          </div>

          <div className="flex-shrink-0">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isConnected
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : isConnecting
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse"
                  : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
              }`}
            >
              {isConnected ? "Conectado" : isConnecting ? "Conectando..." : "Desconectado"}
            </span>
          </div>
        </div>

        <div className="px-4 py-3 text-xs text-sidebar-foreground/70 space-y-1">
          <div className="flex items-center justify-between">
            <span>Status</span>
            <span className="font-mono">{isConnected ? "open" : isConnecting ? "connecting" : "close"}</span>
          </div>
          {instance.owner && (
            <div className="flex items-center justify-between">
              <span>Proprietário</span>
              <span className="font-mono truncate ml-2 max-w-[150px]">{instance.owner}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Token</span>
            <span className="font-mono truncate ml-2 max-w-[150px]">{maskApiKey(instance.apikey)}</span>
          </div>
        </div>

        <div className="flex border-t border-sidebar-border opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {!isConnected ? (
            <button
              className="flex-1 rounded-none h-12 text-green-500 hover:text-green-400 hover:bg-green-500/10 flex items-center justify-center text-sm font-medium transition-colors cursor-pointer"
              onClick={() => onConnect(instance)}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Conectar
            </button>
          ) : (
            <button
              className="flex-1 rounded-none h-12 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 flex items-center justify-center text-sm font-medium transition-colors cursor-pointer"
              onClick={() => onDisconnect(instance)}
            >
              <Power className="h-4 w-4 mr-2" />
              Desconectar
            </button>
          )}

          <div className="w-px bg-sidebar-border" />

          {onSettings && (
            <>
              <button
                className="rounded-none h-12 px-4 text-sidebar-foreground hover:bg-sidebar-accent flex items-center justify-center transition-colors cursor-pointer"
                onClick={() => onSettings(instance)}
                title="Configurações da instância"
              >
                <Settings className="h-4 w-4" />
              </button>
              <div className="w-px bg-sidebar-border" />
            </>
          )}

          <button
            className="rounded-none h-12 px-4 text-red-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
            onClick={() => onDelete(instance)}
            title="Excluir instância"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
