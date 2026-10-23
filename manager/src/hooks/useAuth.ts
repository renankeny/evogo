import { useState, useCallback } from "react";
import { apiClient } from "@/services/apiClient";
import type { AuthState } from "@/types/AuthDTO";

function getInitialAuth(): AuthState {
  if (typeof window === "undefined") {
    return { apiUrl: "http://localhost:8080", apiKey: "", isAuthenticated: false };
  }
  const saved = localStorage.getItem("evolution-auth");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const state = parsed.state || parsed;
      return {
        apiUrl: state.apiUrl || window.location.origin,
        apiKey: state.apiKey || "",
        isAuthenticated: Boolean(state.isAuthenticated),
      };
    } catch {
      // fallback
    }
  }
  return {
    apiUrl: window.location.origin,
    apiKey: "",
    isAuthenticated: false,
  };
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(getInitialAuth);

  const saveAuth = (newAuth: AuthState) => {
    localStorage.setItem(
      "evolution-auth",
      JSON.stringify({
        state: newAuth,
      })
    );
    setAuth(newAuth);
  };

  const login = useCallback(async (apiUrl: string, apiKey: string) => {
    const cleanUrl = apiUrl.replace(/\/$/, "");
    try {
      await apiClient.get("/instance/all", {
        baseURL: cleanUrl,
        headers: { apikey: apiKey, "Cache-Control": "no-cache" },
        params: { t: Date.now() },
      });
      saveAuth({
        apiUrl: cleanUrl,
        apiKey,
        isAuthenticated: true,
      });
    } catch (err: any) {
      saveAuth({
        apiUrl: cleanUrl,
        apiKey: "",
        isAuthenticated: false,
      });
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        throw new Error("Chave de API inválida. Verifique a chave informada.");
      }
      throw new Error("Não foi possível conectar. Verifique a URL e a API Key.");
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("evolution-auth");
    setAuth({
      apiUrl: window.location.origin,
      apiKey: "",
      isAuthenticated: false,
    });
    window.location.href = "/manager/login";
  }, []);

  return {
    ...auth,
    login,
    logout,
  };
}
