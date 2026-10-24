import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { RefreshCw, QrCode, CheckCircle2 } from "lucide-react";

export interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  instanceName: string;
  qrCodeBase64?: string;
  onRefreshQr: () => void;
  loading?: boolean;
  isConnected?: boolean;
}

export function QrCodeModal({
  isOpen,
  onClose,
  instanceName,
  qrCodeBase64,
  onRefreshQr,
  loading = false,
  isConnected = false,
}: QrCodeModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isConnected ? "Instância Conectada" : `Conectar ${instanceName}`}
    >
      {isConnected ? (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/30 shadow-sm">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Conectado com sucesso!</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              A instância <strong>{instanceName}</strong> agora está online no WhatsApp e pronta para envio e recebimento de mensagens.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="default"
              size="sm"
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
            >
              Concluído
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
          {qrCodeBase64 ? (
            <div className="rounded-lg border-2 border-primary/20 bg-white p-3 shadow-md transition-all duration-300">
              <img
                src={qrCodeBase64.startsWith("data:") ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`}
                alt={`QR Code ${instanceName}`}
                className="h-64 w-64 object-contain"
              />
            </div>
          ) : (
            <div className="flex h-64 w-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-4">
              <QrCode className="h-12 w-12 text-muted-foreground/50 mb-2 animate-pulse" />
              <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
            </div>
          )}

          {/* Indicador de escuta ao vivo */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium border border-amber-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Aguardando leitura do QR Code pelo WhatsApp...
          </div>

          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Como conectar:</p>
            <ol className="list-decimal list-inside text-left space-y-0.5">
              <li>Abra o WhatsApp no seu celular</li>
              <li>Toque em Mais opções (três pontos) ou Configurações</li>
              <li>Selecione <strong>Aparelhos conectados</strong> e <strong>Conectar um aparelho</strong></li>
              <li>Aponte a câmera para esta tela</li>
            </ol>
          </div>

          <div className="pt-2 flex gap-2">
            <Button variant="outline" size="sm" onClick={onRefreshQr} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Atualizar QR Code
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
