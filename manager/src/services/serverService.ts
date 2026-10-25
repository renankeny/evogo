import { apiClient } from "@/services/apiClient";
import type { ServerStatusDTO, LicenseStatusDTO } from "@/types/ServerStatusDTO";

export const serverService = {
  async getStatus(): Promise<ServerStatusDTO> {
    const res = await apiClient.get<ServerStatusDTO>("/server/ok");
    return res.data;
  },

  async getLicenseStatus(): Promise<LicenseStatusDTO> {
    const res = await apiClient.get<LicenseStatusDTO>("/license/status");
    return res.data;
  },

  async ping(): Promise<{ latencyMs: number; status: string; version: string; isOnline: boolean }> {
    const start = performance.now();
    try {
      const res = await apiClient.get<{ status?: string; version?: string }>("/health", {
        params: { t: Date.now() },
      });
      const latencyMs = Math.round(performance.now() - start);
      return {
        latencyMs,
        status: res.data?.status || "online",
        version: res.data?.version || "0.7.2",
        isOnline: true,
      };
    } catch {
      const latencyMs = Math.round(performance.now() - start);
      try {
        await apiClient.get("/server/ok", { params: { t: Date.now() } });
        return { latencyMs, status: "online", version: "0.7.2", isOnline: true };
      } catch {
        return { latencyMs: 0, status: "offline", version: "0.7.2", isOnline: false };
      }
    }
  },
};
