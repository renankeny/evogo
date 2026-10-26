import { apiClient } from "@/services/apiClient";
import type {
  InstanceDTO,
  CreateInstancePayload,
  ConnectInstanceOptions,
} from "@/types/InstanceDTO";

function mapRawInstance(raw: any): InstanceDTO {
  let qrcodeObj = undefined;
  if (raw.qrcode) {
    const parts = raw.qrcode.split("|");
    qrcodeObj = {
      base64: parts[0] || undefined,
      code: parts[1] || undefined,
    };
  }

  const status = raw.connected ? "open" : raw.qrcode ? "connecting" : "close";

  return {
    id: raw.id,
    name: raw.name,
    status: status,
    apikey: raw.token,
    owner: raw.jid ? raw.jid.split("@")[0] : undefined,
    profileName: raw.profileName || raw.name,
    profilePicUrl: raw.profilePicUrl || undefined,
    profileStatus: raw.profileStatus || undefined,
    connected: Boolean(raw.connected),
    qrcode: qrcodeObj,
    webhook: raw.webhook || undefined,
    rabbitmqEnable: raw.rabbitmqEnable || undefined,
    websocketEnable: raw.websocketEnable || undefined,
    natsEnable: raw.natsEnable || undefined,
    events: raw.events || undefined,
    disconnectReason: raw.disconnect_reason || undefined,
    createdAt: raw.createdAt,
    alwaysOnline: Boolean(raw.alwaysOnline),
    rejectCall: Boolean(raw.rejectCall),
    msgRejectCall: raw.msgRejectCall || "",
    readMessages: Boolean(raw.readMessages),
    ignoreGroups: Boolean(raw.ignoreGroups),
    ignoreStatus: Boolean(raw.ignoreStatus),
  };
}

export const instancesService = {
  async getAll(): Promise<InstanceDTO[]> {
    const res = await apiClient.get<{ data: any[] }>("/instance/all", {
      params: { t: Date.now() },
    });
    const list = res.data?.data || [];
    return list.map(mapRawInstance);
  },

  async getInfo(instanceId: string): Promise<InstanceDTO> {
    const res = await apiClient.get<{ data: any }>(`/instance/info/${instanceId}`);
    return mapRawInstance(res.data.data);
  },

  async create(payload: CreateInstancePayload): Promise<{ id: string; token: string }> {
    const token =
      payload.token?.trim() ||
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    const body: Record<string, any> = {
      name: payload.instanceName.trim(),
      token: token,
    };
    if (payload.proxy && payload.proxy.host && payload.proxy.port) {
      body.proxy = {
        host: payload.proxy.host.trim(),
        port: payload.proxy.port.trim(),
        username: payload.proxy.username?.trim() || "",
        password: payload.proxy.password || "",
      };
    }
    if (payload.webhook) body.webhook = payload.webhook;
    if (payload.events) body.events = payload.events;

    const res = await apiClient.post("/instance/create", body);
    return res.data?.data || res.data;
  },

  async connect(token: string, options?: ConnectInstanceOptions): Promise<any> {
    const body: Record<string, any> = {};
    if (options?.webhookUrl) body.webhookUrl = options.webhookUrl;
    if (options?.subscribe && options.subscribe.length > 0) body.subscribe = options.subscribe;
    if (options?.rabbitmqEnable) body.rabbitmqEnable = options.rabbitmqEnable;
    if (options?.websocketEnable) body.websocketEnable = options.websocketEnable;
    if (options?.natsEnable) body.natsEnable = options.natsEnable;

    const res = await apiClient.post("/instance/connect", body, {
      headers: { apikey: token },
    });
    return res.data?.data;
  },

  async getQr(token: string): Promise<string> {
    const res = await apiClient.get("/instance/qr", {
      headers: { apikey: token },
    });
    return res.data?.data?.qrcode || res.data?.data || "";
  },

  async disconnect(token: string): Promise<void> {
    await apiClient.post("/instance/disconnect", {}, { headers: { apikey: token } });
  },

  async logout(token: string): Promise<void> {
    await apiClient.delete("/instance/logout", { headers: { apikey: token } });
  },

  async reconnect(token: string): Promise<void> {
    await apiClient.post("/instance/reconnect", {}, { headers: { apikey: token } });
  },

  async forceReconnect(instanceId: string): Promise<void> {
    await apiClient.post(`/instance/forcereconnect/${instanceId}`);
  },

  async delete(instanceId: string): Promise<void> {
    await apiClient.delete(`/instance/delete/${instanceId}`);
  },

  async updateWebhook(
    token: string,
    data: {
      webhookUrl: string;
      subscribe: string[];
      rabbitmqEnable?: string;
      websocketEnable?: string;
      natsEnable?: string;
    }
  ): Promise<any> {
    const body: Record<string, any> = {
      subscribe: data.subscribe,
      rabbitmqEnable: data.rabbitmqEnable || "",
      websocketEnable: data.websocketEnable || "",
      natsEnable: data.natsEnable || "",
    };
    if (data.webhookUrl.trim() === "") {
      body.clearWebhook = true;
      body.webhookUrl = "";
    } else {
      body.webhookUrl = data.webhookUrl.trim();
    }
    const res = await apiClient.post("/instance/connect", body, {
      headers: { apikey: token },
    });
    return res.data?.data || res.data;
  },

  async getAdvancedSettings(instanceId: string, token: string): Promise<any> {
    const res = await apiClient.get(`/instance/${instanceId}/advanced-settings`, {
      headers: { apikey: token },
    });
    return res.data;
  },

  async updateAdvancedSettings(
    instanceId: string,
    token: string,
    settings: {
      alwaysOnline?: boolean;
      rejectCall?: boolean;
      readMessages?: boolean;
      ignoreGroups?: boolean;
      ignoreStatus?: boolean;
      msgRejectCall?: string;
    }
  ): Promise<any> {
    const res = await apiClient.put(
      `/instance/${instanceId}/advanced-settings`,
      settings,
      { headers: { apikey: token } }
    );
    return res.data;
  },

  async sendText(token: string, number: string, text: string): Promise<any> {
    // Clean up number
    const cleanNumber = number.replace(/\D/g, "");
    const res = await apiClient.post(
      "/send/text",
      { number: cleanNumber, text },
      { headers: { apikey: token } }
    );
    return res.data;
  },

  async getLogs(instanceId: string, limit = 100, level = ""): Promise<any[]> {
    const res = await apiClient.get(`/instance/logs/${instanceId}`, {
      params: { limit, level },
    });
    return Array.isArray(res.data) ? res.data : res.data?.data || [];
  },

  async reconnectAll(tokens: string[]): Promise<void> {
    await Promise.allSettled(
      tokens.map((token) => instancesService.reconnect(token))
    );
  },
};
