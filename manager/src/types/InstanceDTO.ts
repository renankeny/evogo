export interface QRCodeData {
  base64?: string;
  code?: string;
}

export interface InstanceDTO {
  id: string;
  name: string;
  status: "open" | "close" | "connecting";
  apikey: string;
  owner?: string;
  profileName?: string;
  profilePicUrl?: string;
  profileStatus?: string;
  connected: boolean;
  qrcode?: QRCodeData;
  webhook?: string;
  rabbitmqEnable?: string;
  websocketEnable?: string;
  natsEnable?: string;
  events?: string;
  disconnectReason?: string;
  createdAt: string;
  alwaysOnline?: boolean;
  rejectCall?: boolean;
  msgRejectCall?: string;
  readMessages?: boolean;
  ignoreGroups?: boolean;
  ignoreStatus?: boolean;
}

export interface ProxyConfigDTO {
  host?: string;
  port?: string;
  username?: string;
  password?: string;
}

export interface CreateInstancePayload {
  instanceName: string;
  token?: string;
  proxy?: ProxyConfigDTO;
  webhook?: string;
  events?: string[];
}

export interface ConnectInstanceOptions {
  webhookUrl?: string;
  subscribe?: string[];
  rabbitmqEnable?: string;
  websocketEnable?: string;
  natsEnable?: string;
}

