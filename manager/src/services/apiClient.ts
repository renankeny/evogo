import axios from "axios";

export const apiClient = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  let apiUrl = "";
  let apiKey = "";

  const authData = localStorage.getItem("evolution-auth");
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      const state = parsed.state || parsed;
      apiUrl = state.apiUrl || "";
      apiKey = state.apiKey || "";
    } catch (e) {
      console.error("Error reading auth data:", e);
    }
  }

  if (!apiUrl && typeof window !== "undefined") {
    apiUrl = window.location.origin;
  }

  if (apiUrl) {
    // Strip any trailing /manager, /manager/instances, etc., and trailing slashes
    config.baseURL = apiUrl.replace(/\/manager(?:\/.*)?$/, "").replace(/\/+$/, "");
  }

  if (apiKey && !config.headers.get("apikey")) {
    config.headers.set("apikey", apiKey);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("evolution-auth");
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/manager/login";
      }
    }
    return Promise.reject(error);
  }
);
