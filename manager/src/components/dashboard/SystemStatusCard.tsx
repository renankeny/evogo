import React, { useState, useEffect } from "react";
import { Server, Database, ShieldCheck, Cpu, RefreshCw, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { serverService } from "@/services/serverService";

export interface SystemStatusCardProps {
  id: string;
  isOnline: boolean;
}

export function SystemStatusCard({ id, isOnline: initialOnline }: SystemStatusCardProps) {
  const [latency, setLatency] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(initialOnline);
  const [version, setVersion] = useState("v0.7.2");
  const [testing, setTesting] = useState(false);

  const checkPing = async () => {
    setTesting(true);
    try {
      const res = await serverService.ping();
      setLatency(res.latencyMs);
      setIsOnline(res.isOnline);
      if (res.version) setVersion(`v${res.version}`);
    } catch {
      setIsOnline(false);
      setLatency(null);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    checkPing();
    const interval = setInterval(checkPing, 30000); // Ping every 30s
    return () => clearInterval(interval);
  }, []);

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
        <div className="flex items-center justify-between border-b border-border/50 py-2">
          <span className="text-muted-foreground flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            Versão & Motor
          </span>
          <span className="font-medium text-foreground">Evolution Go {version} (Go 1.27)</span>
        </div>
        <div className="flex items-center justify-between border-b border-border/50 py-2">
          <span className="text-muted-foreground flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            Banco de Dados
          </span>
          <span className="font-medium text-foreground flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            PostgreSQL (Pool Ativo)
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Modo de Licença
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="success">Autônomo / Ativo</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
