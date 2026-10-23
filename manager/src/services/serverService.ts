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
};
