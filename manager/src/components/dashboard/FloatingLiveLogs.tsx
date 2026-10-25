import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Terminal,
  X,
  Minus,
  Play,
  Pause,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Search,
  ArrowDownToLine,
  ChevronUp,
} from "lucide-react";
import { useLiveLogs } from "@/contexts/LiveLogsContext";
import { instancesService } from "@/services/instancesService";

export function FloatingLiveLogs() {
  const {
    isOpen,
    isMinimized,
    activeInstance,
    isStreaming,
    closeLogs,
    toggleMinimize,
    toggleStreaming,
  } = useLiveLogs();

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch logs function with fallback between ID and Name
  const fetchLogs = async (silent = false) => {
    if (!activeInstance) return;
    if (!silent) setLoading(true);
    try {
      // First try by ID (UUID), if empty try by name
      let data = await instancesService.getLogs(activeInstance.id, 100);
      if (
        (!data || data.length === 0) &&
        activeInstance.name &&
        activeInstance.name !== activeInstance.id
      ) {
        const fallbackData = await instancesService.getLogs(activeInstance.name, 100);
        if (fallbackData && fallbackData.length > 0) {
          data = fallbackData;
        }
      }
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao sincronizar logs em tempo real:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial fetch and polling loop
  useEffect(() => {
    if (!isOpen || !activeInstance) return;

    fetchLogs(false);

    if (!isStreaming) return;

    const interval = setInterval(() => {
      fetchLogs(true);
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen, activeInstance?.id, activeInstance?.name, isStreaming]);

  // Auto-scroll when new logs arrive if enabled
  useEffect(() => {
    if (autoScroll && !isMinimized && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll, isMinimized]);

  // Detect when user scrolls up manually
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 40;
    if (!isAtBottom && autoScroll) {
      setAutoScroll(false);
    }
  };

  // Filter logs by search term and level
  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      const rawText = typeof item === "string" ? item : JSON.stringify(item);
      const matchesSearch = searchTerm
        ? rawText.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      if (!matchesSearch) return false;

      if (levelFilter === "ALL") return true;
      const level = String(item?.level || item?.Level || "").toUpperCase();
      return level.includes(levelFilter);
    });
  }, [logs, searchTerm, levelFilter]);

  const handleCopy = () => {
    const text = filteredLogs
      .map((l) => (typeof l === "string" ? l : JSON.stringify(l, null, 2)))
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setLogs([]);
  };

  if (!isOpen || !activeInstance) return null;

  // Render Minimized Floating Pill
  if (isMinimized) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "1rem",
          right: "1rem",
          zIndex: 99999,
        }}
      >
        <div
          onClick={toggleMinimize}
          className="flex items-center gap-2.5 bg-zinc-950 text-zinc-100 px-4 py-2.5 rounded-full shadow-2xl border border-zinc-700/80 cursor-pointer hover:border-emerald-500 transition-all select-none group"
          title="Clique para expandir o console de logs"
        >
          <span className="relative flex h-2.5 w-2.5">
            {isStreaming && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isStreaming ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
          </span>

          <Terminal className="h-4 w-4 text-emerald-400" />

          <span className="font-semibold text-xs text-white max-w-[130px] truncate">
            {activeInstance.name}
          </span>

          <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700">
            {logs.length} logs
          </span>

          <ChevronUp className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeLogs();
            }}
            className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors ml-1"
            title="Fechar logs"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Format single log entry
  const renderLogEntry = (entry: any, index: number) => {
    if (typeof entry === "string") {
      return (
        <div key={index} className="leading-snug break-all text-zinc-300 py-0.5">
          {entry}
        </div>
      );
    }

    const timestamp = entry.timestamp
      ? new Date(entry.timestamp).toLocaleTimeString("pt-BR", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "";

    const level = String(entry.level || "INFO").toUpperCase();
    const isError = level.includes("ERR");
    const isWarn = level.includes("WARN");
    const isDebug = level.includes("DEBUG");

    const badgeColor = isError
      ? "text-rose-400 bg-rose-950/70 border-rose-800/60"
      : isWarn
      ? "text-amber-400 bg-amber-950/70 border-amber-800/60"
      : isDebug
      ? "text-sky-400 bg-sky-950/70 border-sky-800/60"
      : "text-emerald-400 bg-emerald-950/70 border-emerald-800/60";

    const hasMetadata =
      entry.metadata &&
      typeof entry.metadata === "object" &&
      Object.keys(entry.metadata).length > 0;

    return (
      <div
        key={index}
        className="group flex items-start gap-2 py-1 px-1.5 rounded hover:bg-white/5 transition-colors leading-tight"
      >
        {timestamp && (
          <span className="text-[10px] text-zinc-500 shrink-0 select-none">
            [{timestamp}]
          </span>
        )}

        <span
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 select-none ${badgeColor}`}
        >
          {level}
        </span>

        <div className="flex-1 min-w-0">
          <span className="text-zinc-200 break-words">
            {entry.message || (typeof entry === "object" ? JSON.stringify(entry) : String(entry))}
          </span>
          {hasMetadata && (
            <pre className="mt-1 text-[10px] text-zinc-400 bg-black/40 p-1.5 rounded border border-zinc-800/60 overflow-x-auto">
              {JSON.stringify(entry.metadata, null, 2)}
            </pre>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 99999,
      }}
    >
      <div
        style={{
          width: "min(560px, calc(100vw - 2rem))",
          height: "420px",
          maxHeight: "82vh",
        }}
        className="flex flex-col bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-800 shadow-2xl overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-900 border-b border-zinc-800 select-none shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Terminal className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-xs text-zinc-100 truncate max-w-[150px] sm:max-w-[200px]">
              {activeInstance.name}
            </span>

            {/* Live Indicator */}
            {isStreaming ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Tempo Real
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Pausado
              </span>
            )}
          </div>

          {/* Window Controls */}
          <div className="flex items-center gap-1 text-zinc-400">
            <button
              type="button"
              onClick={toggleStreaming}
              className={`p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer ${
                !isStreaming ? "text-amber-400" : ""
              }`}
              title={isStreaming ? "Pausar streaming" : "Retomar streaming"}
            >
              {isStreaming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => fetchLogs(false)}
              disabled={loading}
              className="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
              title="Recarregar logs agora"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            </button>

            <button
              type="button"
              onClick={toggleMinimize}
              className="p-1.5 rounded hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
              title="Minimizar console"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={closeLogs}
              className="p-1.5 rounded hover:bg-zinc-800 hover:text-rose-400 transition-colors cursor-pointer"
              title="Fechar console"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-zinc-900/70 border-b border-zinc-800 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative flex-1 max-w-[200px]">
              <Search className="absolute left-2 top-2 h-3 w-3 text-zinc-500" />
              <input
                type="text"
                placeholder="Filtrar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded pl-6 pr-2 py-0.5 text-[11px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-[11px] text-zinc-300 focus:outline-none focus:border-zinc-700"
            >
              <option value="ALL">Nível: Todos</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="DEBUG">DEBUG</option>
            </select>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setAutoScroll((prev) => !prev)}
              className={`p-1.5 rounded transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                autoScroll
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              }`}
              title={autoScroll ? "Auto-scroll ativo" : "Auto-scroll pausado"}
            >
              <ArrowDownToLine className="h-3 w-3" />
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={filteredLogs.length === 0}
              className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-40"
              title="Copiar logs"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={logs.length === 0}
              className="p-1.5 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-40"
              title="Limpar visualização"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Terminal Window Content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-2.5 font-mono text-[11px] leading-relaxed space-y-1 scrollbar-thin bg-black/70 select-text"
        >
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-500 gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
              Sincronizando logs da instância...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2 text-center p-4">
              <Terminal className="h-6 w-6 opacity-30 text-emerald-500" />
              <p className="text-xs">
                {searchTerm
                  ? "Nenhum log encontrado para o filtro digitado."
                  : `Aguardando novos eventos da instância "${activeInstance.name}"...`}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                <span>terminal conectado</span>
                <span className="inline-block w-1.5 h-3 bg-emerald-500 animate-pulse" />
              </div>
            </div>
          ) : (
            <>
              {filteredLogs.map((entry, idx) => renderLogEntry(entry, idx))}
              <div ref={logsEndRef} />
            </>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-t border-zinc-800 text-[10px] text-zinc-500 select-none shrink-0">
          <span>
            {filteredLogs.length} de {logs.length} eventos
          </span>
          <span className="hidden sm:inline text-zinc-600">
            Navegue pelo app enquanto monitora em tempo real
          </span>
        </div>
      </div>
    </div>
  );
}
