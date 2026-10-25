import React from "react";
import { Link } from "react-router-dom";
import { Plus, BookOpen, PlaySquare, Key, ExternalLink, Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { maskApiKey } from "@/utils/maskApiKey";

export interface QuickActionsCardProps {
  id: string;
  apiKey: string;
  apiUrl: string;
  onOpenCreateModal: () => void;
  onOpenQuickSend?: () => void;
}

export function QuickActionsCard({
  id,
  apiKey,
  apiUrl,
  onOpenCreateModal,
  onOpenQuickSend,
}: QuickActionsCardProps) {
  const swaggerUrl = `${apiUrl.replace(/\/$/, "")}/swagger/index.html`;

  return (
    <Card id={id} className="border-border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">Ações Rápidas & Conexão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          <Button onClick={onOpenCreateModal} className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-9 cursor-pointer w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Nova Instância
          </Button>

          {onOpenQuickSend && (
            <Button
              variant="outline"
              onClick={onOpenQuickSend}
              className="gap-1.5 sm:gap-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs sm:text-sm h-9 cursor-pointer w-full sm:w-auto"
            >
              <Send className="h-4 w-4" />
              Disparo de Teste
            </Button>
          )}

          <Link to="/manager/api-tester" className="w-full sm:w-auto">
            <Button variant="outline" className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-9 cursor-pointer w-full">
              <PlaySquare className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              API Tester
            </Button>
          </Link>

          <a href={swaggerUrl} target="_blank" rel="noreferrer noopener" className="w-full sm:w-auto">
            <Button variant="outline" className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-9 cursor-pointer w-full">
              <BookOpen className="h-4 w-4 text-primary" />
              Swagger Docs
              <ExternalLink className="h-3 w-3 opacity-60 ml-0.5" />
            </Button>
          </a>
        </div>

        <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-muted-foreground">URL da API:</span>
            <span className="font-mono font-medium text-foreground break-all">{apiUrl || "-"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Key className="h-3 w-3" />
              Chave Global:
            </span>
            <span className="font-mono font-medium text-foreground">{maskApiKey(apiKey)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
