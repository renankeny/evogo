import React, { useState, useEffect } from "react";
import { Terminal, RefreshCw, Copy, Check, Search, AlertCircle, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { instancesService } from "@/services/instancesService";
import type { InstanceDTO } from "@/types/InstanceDTO";

export interface InstanceLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: InstanceDTO | null;
}

export function InstanceLogsModal({ isOpen, onClose, instance }: InstanceLogsModalProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [copied, setCopied] = useState(false);

  const fetchLogs = async () => {
    if (!instance) return;
    setLoading(true);
    try {
      const data = await instancesService.getLogs(instance.id, 150);
      setLogs(data);
    } catch (err) {
      console.error("Erro ao buscar logs da instância:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && instance) {
      fetchLogs();
    } else {
      setLogs([]);
      setSearchTerm("");
    }
  }, [isOpen, instance]);

  const filteredLogs = logs.filter((item) => {
    const rawText = typeof item === "string" ? item : JSON.stringify(item);
    const matchesSearch = searchTerm ? rawText.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    
    if (!matchesSearch) return false;
    if (levelFilter === "ALL") return true;

    const level = (item?.level || item?.Level || "").toUpperCase();
    return level.includes(levelFilter);
  });

  const handleCopy = () => {
    const text = filteredLogs
      .map((l) => (typeof l === "string" ? l : JSON.stringify(l, null, 2)))
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Logs de Operação - ${instance?.name || "Instância"}`}
      className="max-w-3xl"
    >
      <div className="space-y-3">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filtrar eventos e erros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs font-mono"
              />
            </div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">Nível: Todos</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={filteredLogs.length === 0}
              className="h-8 text-xs gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado!" : "Copiar"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={loading}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Terminal Window View */}
        <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-3 h-80 overflow-y-auto font-mono text-[12px] text-zinc-300 space-y-1.5 scrollbar-thin shadow-inner">
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-500 gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              Carregando histórico de logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-1.5 text-center py-6">
              <Terminal className="h-6 w-6 opacity-40" />
              <span>Nenhum registro de log encontrado para os critérios selecionados.</span>
              <span className="text-[11px] text-zinc-600">
                Os logs detalhados são gravados conforme mensagens e eventos chegam.
              </span>
            </div>
          ) : (
            filteredLogs.map((log, idx) => {
              const timeStr = log.timestamp || log.time || log.createdAt || log.created_at || "";
              const level = (log.level || "INFO").toUpperCase();
              const message = log.message || log.msg || (typeof log === "string" ? log : JSON.stringify(log));

              let levelColor = "text-emerald-400 bg-emerald-950/60 border-emerald-800/40";
              if (level.includes("WARN")) levelColor = "text-amber-400 bg-amber-950/60 border-amber-800/40";
              if (level.includes("ERR") || level.includes("FAIL")) levelColor = "text-red-400 bg-red-950/60 border-red-800/40";

              return (
                <div
                  key={idx}
                  className="flex items-start gap-2 hover:bg-zinc-900/60 py-0.5 px-1.5 rounded transition-colors"
                >
                  {timeStr && (
                    <span className="text-zinc-500 text-[11px] shrink-0 select-none">
                      {new Date(timeStr).toLocaleTimeString("pt-BR")}
                    </span>
                  )}
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded border shrink-0 ${levelColor}`}
                  >
                    {level}
                  </span>
                  <span className="break-all text-zinc-200">{message}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>
            Exibindo <b className="text-foreground">{filteredLogs.length}</b> de{" "}
            <b className="text-foreground">{logs.length}</b> eventos
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 text-xs">
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
