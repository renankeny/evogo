import React from "react";
import { Server, Database, ShieldCheck, Cpu } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export interface SystemStatusCardProps {
  id: string;
  isOnline: boolean;
}

export function SystemStatusCard({ id, isOnline }: SystemStatusCardProps) {
  return (
    <Card id={id} className="border-border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            Status do Servidor
          </CardTitle>
          <Badge variant={isOnline ? "success" : "destructive"}>
            {isOnline ? "API Online" : "Desconectado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 text-sm">
        <div className="flex items-center justify-between border-b border-border/50 py-2">
          <span className="text-muted-foreground flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            Versão & Motor
          </span>
          <span className="font-medium text-foreground">Evolution Go v0.7.2 (Go 1.27)</span>
        </div>
        <div className="flex items-center justify-between border-b border-border/50 py-2">
          <span className="text-muted-foreground flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            Banco de Dados
          </span>
          <span className="font-medium text-foreground">PostgreSQL (Pool Ativo)</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Modo de Licença
          </span>
          <Badge variant="success">Autônomo / Ativo</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
