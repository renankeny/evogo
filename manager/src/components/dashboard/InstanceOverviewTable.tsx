import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Smartphone, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { InstanceDTO } from "@/types/InstanceDTO";

export interface InstanceOverviewTableProps {
  id: string;
  instances: InstanceDTO[];
  loading: boolean;
  onRefresh: () => void;
}

export function InstanceOverviewTable({
  id,
  instances,
  loading,
  onRefresh,
}: InstanceOverviewTableProps) {
  return (
    <Card id={id} className="border-border bg-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-primary" />
          Visão Geral das Instâncias
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 w-8 p-0"
            title="Atualizar lista"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Link to="/manager/instances">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              Ver Todas
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {instances.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma instância encontrada. Crie sua primeira instância para começar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/60 text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-3 px-2">Nome</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Número / JID</th>
                  <th className="py-3 px-2 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {instances.slice(0, 5).map((inst) => (
                  <tr key={inst.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2 font-medium text-foreground">{inst.name}</td>
                    <td className="py-3 px-2">
                      <Badge variant={inst.connected ? "success" : "destructive"}>
                        {inst.connected ? "Conectado" : "Desconectado"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 font-mono text-xs text-muted-foreground">
                      {inst.owner ? `+${inst.owner}` : "-"}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Link to="/manager/instances">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Gerenciar
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
