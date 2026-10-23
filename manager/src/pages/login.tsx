import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [apiUrl, setApiUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "http://localhost:8080";
  });
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError("API Key é obrigatória");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(apiUrl, apiKey.trim());
      navigate("/manager");
    } catch (err: any) {
      setError(err?.message || "Erro ao conectar. Verifique a URL e API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-t from-primary/20 via-background/95 to-background relative">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Evolution GO</h1>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-6 shadow-lg">
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-bold">Entrar na sua conta</h2>
            <p className="text-muted-foreground text-sm">
              Digite suas credenciais para acessar o sistema
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="login-apiUrl">
                URL da API Evolution GO
              </label>
              <input
                id="login-apiUrl"
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="http://localhost:8080"
                disabled={loading}
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="login-apiKey">
                API Key (GLOBAL_API_KEY)
              </label>
              <input
                id="login-apiKey"
                type="password"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Sua chave de API"
                disabled={loading}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full cursor-pointer mt-2"
            >
              {loading ? "Conectando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
