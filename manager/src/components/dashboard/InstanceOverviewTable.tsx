import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Smartphone,
  RefreshCw,
  Search,
  Send,
  Terminal,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { InstanceDTO } from "@/types/InstanceDTO";

export interface InstanceOverviewTableProps {
  id: string;
  instances: InstanceDTO[];
  loading: boolean;
  onRefresh: () => void;
  onQuickSend?: (instance: InstanceDTO) => void;
  onViewLogs?: (instance: InstanceDTO) => void;
  onReconnectAll?: () => Promise<void>;
}

export function InstanceOverviewTable({
  id,
  instances,
  loading,
  onRefresh,
  onQuickSend,
  onViewLogs,
  onReconnectAll,
}: InstanceOverviewTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [reconnectingAll, setReconnectingAll] = useState(false);

  const disconnectedCount = instances.filter((i) => !i.connected && i.status !== "open").length;

  const filteredInstances = instances.filter((inst) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = inst.name.toLowerCase().includes(term);
    const ownerMatch = (inst.owner || "").toLowerCase().includes(term);
    return nameMatch || ownerMatch;
  });

  const handleReconnectAll = async () => {
    if (!onReconnectAll) return;
    setReconnectingAll(true);
    try {
      await onReconnectAll();
    } finally {
      setReconnectingAll(false);
    }
  };

  return (
    <Card id={id} className="border-border bg-card shadow-xs">
      <CardHeader className="flex flex-col gap-3 pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              Visão Geral das Instâncias
            </CardTitle>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
              {instances.length} total
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {disconnectedCount > 0 && onReconnectAll && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReconnectAll}
                disabled={reconnectingAll}
                className="h-8 text-xs gap-1.5 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                title="Tentar reconectar todas as instâncias offline"
              >
                <RotateCcw className={`h-3.5 w-3.5 ${reconnectingAll ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Reconectar</span> Offline ({disconnectedCount})
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-8 w-8 p-0 cursor-pointer shrink-0"
              title="Atualizar lista"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : "text-muted-foreground"}`} />
            </Button>

            <Link to="/manager/instances">
              <Button variant="outline" size="sm" className="gap-1 text-xs h-8 cursor-pointer shrink-0">
                Ver Todas
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar - Full width on mobile */}
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome da instância ou número WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-xs w-full bg-background"
          />
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {instances.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma instância encontrada. Crie sua primeira instância para começar.
          </div>
        ) : filteredInstances.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma instância encontrada para a busca &quot;{searchTerm}&quot;.
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border/60 text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="py-3 px-3">Nome</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">WhatsApp / JID</th>
                    <th className="py-3 px-3 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredInstances.slice(0, 6).map((inst) => {
                    const isConnected = inst.connected || inst.status === "open";
                    return (
                      <tr key={inst.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-medium text-foreground">{inst.name}</span>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={isConnected ? "success" : "destructive"}>
                            {isConnected ? "Conectado" : "Desconectado"}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-muted-foreground">
                          {inst.owner ? `+${inst.owner}` : "Não pareado"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onQuickSend && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onQuickSend(inst)}
                                className="h-7 px-2 text-xs gap-1 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                                title="Testar disparo de mensagem"
                              >
                                <Send className="h-3 w-3" />
                                <span>Disparo</span>
                              </Button>
                            )}

                            {onViewLogs && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewLogs(inst)}
                                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Ver logs da instância"
                              >
                                <Terminal className="h-3 w-3" />
                                <span>Logs</span>
                              </Button>
                            )}

                            <Link to="/manager/instances">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Gerenciar no painel"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (< md) */}
            <div className="block md:hidden space-y-3">
              {filteredInstances.slice(0, 6).map((inst) => {
                const isConnected = inst.connected || inst.status === "open";
                return (
                  <div
                    key={inst.id}
                    className="p-3.5 rounded-lg border border-border bg-card shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground">{inst.name}</span>
                      <Badge variant={isConnected ? "success" : "destructive"}>
                        {isConnected ? "Conectado" : "Desconectado"}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground font-mono flex items-center justify-between">
                      <span>WhatsApp:</span>
                      <span className="text-foreground">{inst.owner ? `+${inst.owner}` : "Não pareado"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-border/60">
                      {onQuickSend && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onQuickSend(inst)}
                          className="flex-1 h-8 text-xs gap-1 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                        >
                          <Send className="h-3 w-3" />
                          Disparo
                        </Button>
                      )}

                      {onViewLogs && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewLogs(inst)}
                          className="flex-1 h-8 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Terminal className="h-3 w-3" />
                          Logs
                        </Button>
                      )}

                      <Link to="/manager/instances" className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Gerenciar
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
