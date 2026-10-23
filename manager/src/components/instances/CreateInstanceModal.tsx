import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CreateInstancePayload } from "@/types/InstanceDTO";

export interface CreateInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateInstancePayload) => Promise<void>;
}

export function formatInstanceName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos (ex: á -> a, ç -> c)
    .toLowerCase()
    .replace(/[\s_]+/g, "-") // converte espaços e underscores em hífen
    .replace(/[^a-z0-9-]/g, "") // somente letras minúsculas, números e hífen
    .replace(/-+/g, "-"); // evita hífens múltiplos seguidos
}

export function CreateInstanceModal({ isOpen, onClose, onSubmit }: CreateInstanceModalProps) {
  const [instanceName, setInstanceName] = useState("");
  const [token, setToken] = useState("");
  const [showProxy, setShowProxy] = useState(false);
  const [proxyHost, setProxyHost] = useState("");
  const [proxyPort, setProxyPort] = useState("");
  const [proxyUsername, setProxyUsername] = useState("");
  const [proxyPassword, setProxyPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setInstanceName("");
    setToken("");
    setShowProxy(false);
    setProxyHost("");
    setProxyPort("");
    setProxyUsername("");
    setProxyPassword("");
    setError(null);
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formatInstanceName(instanceName).replace(/^-+|-+$/g, "");
    if (!cleanName) {
      setError("Nome da instância é obrigatório.");
      return;
    }
    if (cleanName.length < 3) {
      setError("Nome deve ter pelo menos 3 caracteres.");
      return;
    }
    if (cleanName.length > 50) {
      setError("Nome deve ter no máximo 50 caracteres.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(cleanName)) {
      setError("Nome deve conter apenas letras, números e hífen (-).");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: CreateInstancePayload = {
      instanceName: cleanName,
      token: token.trim() || undefined,
    };

    if (proxyHost.trim() || proxyPort.trim()) {
      if (!proxyHost.trim() || !proxyPort.trim()) {
        setError("Para configurar proxy, informe tanto o Host quanto a Porta.");
        setSubmitting(false);
        return;
      }
      payload.proxy = {
        host: proxyHost.trim(),
        port: proxyPort.trim(),
        username: proxyUsername.trim() || undefined,
        password: proxyPassword || undefined,
      };
    }

    try {
      await onSubmit(payload);
      resetForm();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Erro ao criar instância.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Criar Nova Instância">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="instanceName" className="text-sm font-medium text-foreground">
            Nome da Instância <span className="text-red-500">*</span>
          </label>
          <Input
            id="instanceName"
            type="text"
            placeholder="ex: renan-keny-123"
            value={instanceName}
            onChange={(e) => {
              const formatted = formatInstanceName(e.target.value);
              setInstanceName(formatted);
              if (error) setError(null);
            }}
            onBlur={() => {
              setInstanceName((prev) => prev.replace(/^-+|-+$/g, ""));
            }}
            disabled={submitting}
            autoFocus
            className="bg-sidebar border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50"
          />
          <p className="text-xs text-sidebar-foreground/60">
            Apenas letras minúsculas, números e hífen (-) (sem espaços ou caracteres especiais)
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="token" className="text-sm font-medium text-foreground">
            Token (Opcional)
          </label>
          <Input
            id="token"
            type="text"
            placeholder="Token personalizado (UUID)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={submitting}
            className="bg-sidebar border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50"
          />
          <p className="text-xs text-sidebar-foreground/60">
            Se não informado, será gerado um UUID automaticamente
          </p>
        </div>

        {/* Collapsible Proxy Accordion */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => setShowProxy(!showProxy)}
            disabled={submitting}
            className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border border-sidebar-border bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer transition-colors"
          >
            <span>Configuração de Proxy (Opcional)</span>
            {showProxy ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showProxy && (
            <div className="space-y-3 pt-2 border-t border-sidebar-border">
              <div className="space-y-1">
                <label htmlFor="proxyHost" className="text-xs font-medium text-foreground">
                  Host do Proxy
                </label>
                <Input
                  id="proxyHost"
                  type="text"
                  placeholder="ex: proxy.example.com"
                  value={proxyHost}
                  onChange={(e) => setProxyHost(e.target.value)}
                  disabled={submitting}
                  className="bg-sidebar border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="proxyPort" className="text-xs font-medium text-foreground">
                  Porta do Proxy
                </label>
                <Input
                  id="proxyPort"
                  type="text"
                  placeholder="ex: 8080"
                  value={proxyPort}
                  onChange={(e) => setProxyPort(e.target.value)}
                  disabled={submitting}
                  className="bg-sidebar border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label htmlFor="proxyUsername" className="text-xs font-medium text-foreground">
                    Usuário do Proxy
                  </label>
                  <Input
                    id="proxyUsername"
                    type="text"
                    placeholder="Opcional"
                    value={proxyUsername}
                    onChange={(e) => setProxyUsername(e.target.value)}
                    disabled={submitting}
                    className="bg-sidebar border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="proxyPassword" className="text-xs font-medium text-foreground">
                    Senha do Proxy
                  </label>
                  <Input
                    id="proxyPassword"
                    type="password"
                    placeholder="Opcional"
                    value={proxyPassword}
                    onChange={(e) => setProxyPassword(e.target.value)}
                    disabled={submitting}
                    className="bg-sidebar border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            {submitting ? "Criando..." : "Criar Instância"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
