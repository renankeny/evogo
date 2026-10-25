import React, { createContext, useContext, useState, useCallback } from "react";
import type { InstanceDTO } from "@/types/InstanceDTO";

export interface LiveLogsContextType {
  isOpen: boolean;
  isMinimized: boolean;
  activeInstance: InstanceDTO | null;
  isStreaming: boolean;
  openLogs: (instance: InstanceDTO) => void;
  closeLogs: () => void;
  toggleMinimize: () => void;
  setMinimized: (minimized: boolean) => void;
  toggleStreaming: () => void;
  setStreaming: (streaming: boolean) => void;
  setActiveInstance: (instance: InstanceDTO | null) => void;
}

const LiveLogsContext = createContext<LiveLogsContextType | undefined>(undefined);

export function LiveLogsProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeInstance, setActiveInstance] = useState<InstanceDTO | null>(null);
  const [isStreaming, setIsStreaming] = useState(true);

  const openLogs = useCallback((instance: InstanceDTO) => {
    setActiveInstance(instance);
    setIsOpen(true);
    setIsMinimized(false);
    setIsStreaming(true);
  }, []);

  const closeLogs = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const setMinimized = useCallback((minimized: boolean) => {
    setIsMinimized(minimized);
  }, []);

  const toggleStreaming = useCallback(() => {
    setIsStreaming((prev) => !prev);
  }, []);

  const setStreaming = useCallback((streaming: boolean) => {
    setIsStreaming(streaming);
  }, []);

  return (
    <LiveLogsContext.Provider
      value={{
        isOpen,
        isMinimized,
        activeInstance,
        isStreaming,
        openLogs,
        closeLogs,
        toggleMinimize,
        setMinimized,
        toggleStreaming,
        setStreaming,
        setActiveInstance,
      }}
    >
      {children}
    </LiveLogsContext.Provider>
  );
}

export function useLiveLogs() {
  const context = useContext(LiveLogsContext);
  if (!context) {
    throw new Error("useLiveLogs must be used within a LiveLogsProvider");
  }
  return context;
}
