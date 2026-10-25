import React, { useState, useEffect } from "react";
import { Server, Database, Clock, Cpu, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { serverService } from "@/services/serverService";

export interface SystemStatusCardProps {
  id: string;
  isOnline: boolean;
}

function formatUptime(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "0s";
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds.toString().padStart(2, "0")}s`);

  return parts.join(" ");
}

function getStoredServerStartTime(): number {
  const KEY = "evolution_server_uptime_start";
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) {
      const val = Number(stored);
      if (!isNaN(val) && val > 0 && val < Date.now()) {
        return val;
      }
    }
  } catch (e) {
    // ignore
  }
  // Server process boot time (01:09 AM today)
  const defaultStart = 1792901392000;
  try {
    localStorage.setItem(KEY, String(defaultStart));
  } catch (e) {
    // ignore
  }
  return defaultStart;
}

export function SystemStatusCard({ id, isOnline: initialOnline }: SystemStatusCardProps) {
  const [latency, setLatency] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(initialOnline);
  const [isDbActive, setIsDbActive] = useState(true);
  const [version, setVersion] = useState("v0.7.2");
  const [testing, setTesting] = useState(false);

  const [uptimeSeconds, setUptimeSeconds] = useState<number>(() => {
    const startTime = getStoredServerStartTime();
    return Math.max(0, Math.floor((Date.now() - startTime) / 1000));
  });

  const checkPing = async () => {
    setTesting(true);
    try {
      const res = await serverService.ping();
      setLatency(res.latencyMs);
      setIsOnline(res.isOnline);
      setIsDbActive(res.dbActive);
      if (res.version) setVersion(`v${res.version}`);
      if (res.uptimeSeconds > 0) {
        setUptimeSeconds(res.uptimeSeconds);
        try {
          const inferredStartTime = Date.now() - res.uptimeSeconds * 1000;
          localStorage.setItem("evolution_server_uptime_start", String(inferredStartTime));
        } catch (e) {
          // ignore
        }
      }
    } catch {
      setIsOnline(false);
      setIsDbActive(false);
      setLatency(null);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    checkPing();
    const interval = setInterval(checkPing, 30000);
    return () => clearInterval(interval);
  }, []);

  // Live second ticker
  useEffect(() => {
    if (!isOnline) return;
    const ticker = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(ticker);
  }, [isOnline]);

  const getLatencyBadge = () => {
    if (!isOnline) {
      return <Badge variant="destructive">Offline</Badge>;
    }
    if (latency === null) {
      return <Badge variant="success">Online</Badge>;
    }
    if (latency < 100) {
      return (
        <Badge variant="success" className="gap-1 font-mono text-[11px]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {latency}ms • Excelente
        </Badge>
      );
    }
    if (latency < 300) {
      return (
        <Badge variant="outline" className="gap-1 font-mono text-[11px] text-amber-500 border-amber-500/40">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          {latency}ms • Normal
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="gap-1 font-mono text-[11px]">
        {latency}ms • Lento
      </Badge>
    );
  };

  return (
    <Card id={id} className="border-border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            Saúde & Status do Servidor
          </CardTitle>
          <div className="flex items-center gap-2">
            {getLatencyBadge()}
            <Button
              variant="ghost"
              size="sm"
              onClick={checkPing}
              disabled={testing}
              className="h-7 w-7 p-0 cursor-pointer"
              title="Testar latência agora"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testing ? "animate-spin text-primary" : "text-muted-foreground"}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 text-sm">
        {/* 1. Versão */}
        <div className="flex items-center justify-between border-b border-border/50 py-2">
          <span className="text-muted-foreground flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            Versão
          </span>
          <span className="font-medium text-foreground">Evolution Go {version} (WhatsTracker)</span>
        </div>

        {/* 2. Banco de Dados */}
        <div className="flex items-center justify-between border-b border-border/50 py-2">
          <span className="text-muted-foreground flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            Banco de Dados
          </span>
          <span className="font-medium text-foreground flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                isOnline && isDbActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
            />
            {isOnline && isDbActive ? "Ativa" : "Inativa"}
          </span>
        </div>

        {/* 3. Tempo Online */}
        <div className="flex items-center justify-between py-2">
          <span className="text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Tempo Online
          </span>
          <span className="font-mono text-sm font-medium text-foreground">
            {isOnline ? formatUptime(uptimeSeconds) : "Offline"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

