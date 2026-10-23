import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { RefreshCw, QrCode } from "lucide-react";

export interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  instanceName: string;
  qrCodeBase64?: string;
  onRefreshQr: () => void;
  loading?: boolean;
}

export function QrCodeModal({
  isOpen,
  onClose,
  instanceName,
  qrCodeBase64,
  onRefreshQr,
  loading = false,
}: QrCodeModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Conectar ${instanceName}`}>
      <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
        {qrCodeBase64 ? (
          <div className="rounded-lg border-2 border-primary/20 bg-white p-3 shadow-md">
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
    </Modal>
  );
}
