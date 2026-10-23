import { useState, useEffect, useCallback } from "react";
import { instancesService } from "@/services/instancesService";
import type { InstanceDTO, CreateInstancePayload, ConnectInstanceOptions } from "@/types/InstanceDTO";

export function useInstances(pollInterval = 5000) {
  const [instances, setInstances] = useState<InstanceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstances = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await instancesService.getAll();
      setInstances(data);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Erro ao carregar instâncias");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstances();
    if (pollInterval > 0) {
      const timer = setInterval(() => {
        fetchInstances(true);
      }, pollInterval);
      return () => clearInterval(timer);
    }
  }, [fetchInstances, pollInterval]);

  const createInstance = async (payload: CreateInstancePayload) => {
    const res = await instancesService.create(payload);
    await fetchInstances(true);
    return res;
  };

  const connectInstance = async (token: string, options?: ConnectInstanceOptions) => {
    const res = await instancesService.connect(token, options);
    await fetchInstances(true);
    return res;
  };

  const disconnectInstance = async (token: string) => {
    await instancesService.disconnect(token);
    await fetchInstances(true);
  };

  const reconnectInstance = async (token: string) => {
    await instancesService.reconnect(token);
    await fetchInstances(true);
  };

  const forceReconnectInstance = async (instanceId: string) => {
    await instancesService.forceReconnect(instanceId);
    await fetchInstances(true);
  };

  const deleteInstance = async (instanceId: string) => {
    await instancesService.delete(instanceId);
    await fetchInstances(true);
  };

  const getQrCode = async (token: string) => {
    return await instancesService.getQr(token);
  };

  return {
    instances,
    loading,
    error,
    refresh: fetchInstances,
    fetchInstances,
    createInstance,
    connectInstance,
    disconnectInstance,
    reconnectInstance,
    forceReconnectInstance,
    deleteInstance,
    getQrCode,
  };
}
