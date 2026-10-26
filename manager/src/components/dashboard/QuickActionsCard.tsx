import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, BookOpen, Terminal, Key, Globe, ExternalLink, Send, Copy, Check } from "lucide-react";
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
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyUrl = () => {
    if (!apiUrl) return;
    navigator.clipboard.writeText(apiUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

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
              <Terminal className="h-4 w-4 text-purple-500 dark:text-purple-400" />
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
              <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              URL da API:
            </span>
            <div className="flex items-center gap-1.5 max-w-full overflow-hidden">
              <span className="font-mono font-medium text-foreground truncate">{apiUrl || "-"}</span>
              {apiUrl && (
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                  title="Copiar URL da API"
                >
                  {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
              <Key className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              Chave Global:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-medium text-foreground">{maskApiKey(apiKey)}</span>
              {apiKey && (
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                  title="Copiar Chave Global"
                >
                  {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
