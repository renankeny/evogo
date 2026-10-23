export interface ServerStatusDTO {
  status: string;
  version?: string;
}

export interface LicenseStatusDTO {
  status: "active" | "inactive";
  message?: string;
}
