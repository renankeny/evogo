import React, { useState, useEffect } from "react";
import { AlertTriangle, Trash2, Info, AlertCircle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "warning" | "default";
  requireTextMatch?: string;
  matchPlaceholder?: string;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "destructive",
  requireTextMatch,
  matchPlaceholder,
  loading = false,
}: ConfirmModalProps) {
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputText("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const isMatchValid = !requireTextMatch || inputText.trim() === requireTextMatch.trim();

  const handleConfirm = async () => {
    if (!isMatchValid || loading || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <Trash2 className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="sm:max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-muted p-2 flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="text-sm text-muted-foreground flex-1">
            {description}
          </div>
        </div>

        {requireTextMatch && (
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-medium text-foreground">
              Digite <span className="font-semibold text-primary">{requireTextMatch}</span> para confirmar:
            </label>
            <Input
              type="text"
              placeholder={matchPlaceholder || requireTextMatch}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading || isSubmitting}
              autoFocus
              className="bg-sidebar border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 text-sm"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading || isSubmitting}
            className="cursor-pointer"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={!isMatchValid || loading || isSubmitting}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer disabled:opacity-50"
                : "cursor-pointer"
            }
          >
            {loading || isSubmitting ? "Aguarde..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
