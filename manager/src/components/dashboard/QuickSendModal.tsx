import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, AlertCircle, Sparkles, Smartphone, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { instancesService } from "@/services/instancesService";
import type { InstanceDTO } from "@/types/InstanceDTO";

export interface QuickSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  instances: InstanceDTO[];
  preselectedInstanceId?: string;
}

export function QuickSendModal({
  isOpen,
  onClose,
  instances,
  preselectedInstanceId,
}: QuickSendModalProps) {
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>("");
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("🚀 Olá! Mensagem de teste enviada pelo painel Evolution GO.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);

  // Set default selected instance
  useEffect(() => {
    if (preselectedInstanceId) {
      setSelectedInstanceId(preselectedInstanceId);
    } else {
      const firstConnected = instances.find((i) => i.connected || i.status === "open");
      if (firstConnected) {
        setSelectedInstanceId(firstConnected.id);
      } else if (instances.length > 0) {
        setSelectedInstanceId(instances[0].id);
      }
    }
  }, [preselectedInstanceId, instances, isOpen]);

  // Reset status on open
  useEffect(() => {
    if (isOpen) {
      setResult(null);
    }
  }, [isOpen]);

  const selectedInstance = instances.find((i) => i.id === selectedInstanceId);
  const isInstanceConnected = selectedInstance?.connected || selectedInstance?.status === "open";

  const quickTemplates = [
    "🚀 Olá! Mensagem de teste enviada pelo painel Evolution GO.",
    "✅ Servidor 100% operacional e entregando em alta velocidade.",
    "⚡ Teste de latência e conexão ativa no WhatsApp.",
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstance) return;

    const cleanNum = number.replace(/\D/g, "");
    if (!cleanNum || cleanNum.length < 10) {
      setResult({
        success: false,
        error: "Por favor, informe um número válido com DDI e DDD (ex: 5511999999999).",
      });
      return;
    }

    if (!message.trim()) {
      setResult({
        success: false,
        error: "Digite o texto da mensagem.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await instancesService.sendText(
        selectedInstance.apikey,
        cleanNum,
        message.trim()
      );
      setResult({
        success: true,
        data: response,
      });
    } catch (err: any) {
      setResult({
        success: false,
        error: err.response?.data?.error || err.message || "Erro ao disparar mensagem.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Disparo Rápido de Teste" className="max-w-xl">
      <form onSubmit={handleSend} className="space-y-4">
        {/* Instância Selector */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
            Instância Emissora
          </label>
          <div className="relative">
            <select
              value={selectedInstanceId}
              onChange={(e) => setSelectedInstanceId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              {instances.map((inst) => {
                const isConn = inst.connected || inst.status === "open";
                return (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} {isConn ? "(Online 🟢)" : "(Desconectada 🔴)"}{" "}
                    {inst.owner ? `- +${inst.owner}` : ""}
                  </option>
                );
              })}
            </select>
          </div>
          {!isInstanceConnected && selectedInstance && (
            <p className="mt-1 text-xs text-amber-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Aviso: Esta instância está desconectada. Conecte-a para poder disparar.
            </p>
          )}
        </div>

        {/* Número de Destino */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
            Número de Destino (WhatsApp)
          </label>
          <Input
            type="text"
            placeholder="Ex: 5511999999999 (DDI + DDD + Número)"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
            className="font-mono text-sm"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Apenas números com código do país (55 para Brasil).
          </p>
        </div>

        {/* Mensagem de Texto */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
            Texto da Mensagem
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Escreva sua mensagem de teste..."
          />

          {/* Quick template chips */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mr-1">
              <Sparkles className="h-3 w-3 text-amber-400" /> Modelos:
            </span>
            {quickTemplates.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMessage(tmpl)}
                className="text-[11px] px-2 py-0.5 rounded-full border border-border/80 bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground cursor-pointer text-left truncate max-w-[200px]"
                title={tmpl}
              >
                {tmpl}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Result Box */}
        {result && (
          <div
            className={`rounded-lg p-3 text-xs border ${
              result.success
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {result.success ? (
                <>
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Mensagem enviada com sucesso ao WhatsApp!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Falha ao enviar: {result.error}</span>
                </>
              )}
            </div>
            {result.success && result.data && (
              <div className="mt-2 p-2 rounded bg-background/80 font-mono text-[11px] text-foreground border border-border/50 max-h-24 overflow-y-auto">
                <pre>{JSON.stringify(result.data, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Fechar
          </Button>
          <Button
            type="submit"
            disabled={loading || !isInstanceConnected}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar Mensagem
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
