import React, { useState } from "react";
import { Play, Send, CheckCircle2, AlertCircle, Copy, Check, Terminal, Clock, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { apiClient } from "@/services/apiClient";
import { useInstances } from "@/hooks/useInstances";

export default function ApiTesterPage() {
  const { instances } = useInstances(0);
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">("GET");
  const [endpoint, setEndpoint] = useState("/server/ok");
  const [selectedToken, setSelectedToken] = useState("");
  const [requestBody, setRequestBody] = useState("");
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const presets = [
    { label: "Status do Servidor", method: "GET", endpoint: "/server/ok", body: "", requiresInstance: false },
    { label: "Health Check", method: "GET", endpoint: "/health", body: "", requiresInstance: false },
    { label: "Listar Todas Instâncias", method: "GET", endpoint: "/instance/all", body: "", requiresInstance: false },
    { label: "Status da Instância", method: "GET", endpoint: "/instance/status", body: "", requiresInstance: true },
    { label: "Obter QR Code", method: "GET", endpoint: "/instance/qr", body: "", requiresInstance: true },
    {
      label: "Enviar Mensagem de Texto",
      method: "POST",
      endpoint: "/send/text",
      requiresInstance: true,
      body: JSON.stringify(
        {
          number: "5511999999999",
          text: "Olá do Evolution GO!",
        },
        null,
        2
      ),
    },
    {
      label: "Conectar Instância",
      method: "POST",
      endpoint: "/instance/connect",
      requiresInstance: true,
      body: JSON.stringify(
        {
          subscribe: ["MESSAGE", "SEND_MESSAGE", "CONNECTION"],
        },
        null,
        2
      ),
    },
    { label: "Desconectar Instância", method: "POST", endpoint: "/instance/disconnect", body: "", requiresInstance: true },
  ];

  const handleApplyPreset = (preset: (typeof presets)[0]) => {
    setMethod(preset.method as "GET" | "POST" | "PUT" | "DELETE");
    setEndpoint(preset.endpoint);
    setRequestBody(preset.body);
    if (preset.requiresInstance && !selectedToken && instances.length > 0) {
      setSelectedToken(instances[0].apikey);
    }
  };

  const handleExecute = async () => {
    const cleanEndpoint = endpoint.trim().startsWith("/") ? endpoint.trim() : `/${endpoint.trim()}`;

    let payload: any = {};
    if (["POST", "PUT"].includes(method) && requestBody.trim()) {
      try {
        payload = JSON.parse(requestBody);
      } catch (parseErr: any) {
        setResponseStatus(400);
        setLatencyMs(0);
        setResponseData(
          JSON.stringify(
            {
              error: "JSON inválido no corpo da requisição",
              detalhes: parseErr?.message || "Verifique a formatação do JSON digitado.",
            },
            null,
            2
          )
        );
        return;
      }
    }

    setLoading(true);
    setResponseStatus(null);
    setResponseData(null);
    setLatencyMs(null);
    const start = performance.now();

    try {
      const headers: Record<string, string> = {};
      if (selectedToken) {
        headers["apikey"] = selectedToken;
      }

      let res;
      if (method === "GET") {
        res = await apiClient.get(cleanEndpoint, { headers });
      } else if (method === "POST") {
        res = await apiClient.post(cleanEndpoint, payload, { headers });
      } else if (method === "PUT") {
        res = await apiClient.put(cleanEndpoint, payload, { headers });
      } else {
        res = await apiClient.delete(cleanEndpoint, { headers });
      }
      setLatencyMs(Math.round(performance.now() - start));
      setResponseStatus(res.status);
      setResponseData(JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      setLatencyMs(Math.round(performance.now() - start));
      setResponseStatus(err?.response?.status || 500);
      setResponseData(
        JSON.stringify(err?.response?.data || { error: err?.message }, null, 2)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormatJson = () => {
    if (!requestBody.trim()) return;
    try {
      const parsed = JSON.parse(requestBody);
      setRequestBody(JSON.stringify(parsed, null, 2));
    } catch {
      // ignore parse errors
    }
  };

  const handleCopyResponse = () => {
    if (!responseData) return;
    navigator.clipboard.writeText(responseData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageContainer>
      {/* Standard Page Header */}
      <PageHeader
        title="API Tester"
        description="Teste interativamente qualquer rota do Evolution GO diretamente pela interface."
        badge={
          <Badge variant="outline" className="font-mono text-xs gap-1 border-primary/30 text-primary">
            <Terminal className="h-3 w-3" />
            v0.7.2
          </Badge>
        }
      />

      {/* Presets Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-lg border border-border/60 bg-muted/30">
        <span className="text-xs font-semibold text-muted-foreground mr-1">Atalhos Rápidos:</span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className="text-xs px-2.5 py-1 rounded-md border border-border bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors text-foreground font-medium cursor-pointer"
            onClick={() => handleApplyPreset(p)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Painel de Requisição */}
        <Card className="border-border bg-card shadow-xs flex flex-col">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              Parâmetros da Requisição
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 pt-4 flex-1">
            {/* Método e Endpoint */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Método & Rota
              </label>
              <div className="flex gap-2">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as "GET" | "POST" | "PUT" | "DELETE")}
                  className={`rounded-md border px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer ${
                    method === "GET"
                      ? "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : method === "POST"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : method === "PUT"
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <Input
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="/server/ok"
                  className="font-mono text-xs flex-1"
                />
              </div>
            </div>

            {/* Token da Instância */}
            {instances.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                  Autenticação (Header apikey)
                </label>
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer font-mono"
                >
                  <option value="">Chave Global Padrão (Admin)</option>
                  {instances.map((i) => (
                    <option key={i.id} value={i.apikey}>
                      Instância: {i.name} ({i.apikey.slice(0, 10)}...)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Body para POST e PUT */}
            {["POST", "PUT"].includes(method) && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase">
                    Corpo da Requisição (JSON)
                  </label>
                  <button
                    type="button"
                    onClick={handleFormatJson}
                    className="text-[11px] text-primary hover:underline cursor-pointer"
                  >
                    Formatar JSON
                  </button>
                </div>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={9}
                  placeholder={'{\n  "key": "value"\n}'}
                  className="w-full rounded-md border border-input bg-muted/20 p-3 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                />
              </div>
            )}

            <Button
              onClick={handleExecute}
              disabled={loading}
              className="w-full gap-2 cursor-pointer mt-auto"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Executando Requisição...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Executar Chamada
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Painel de Resposta */}
        <Card className="border-border bg-card shadow-xs flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              Retorno da API
              {responseStatus !== null && (
                <Badge
                  variant={responseStatus >= 200 && responseStatus < 300 ? "success" : "destructive"}
                  className="gap-1 font-mono text-xs"
                >
                  {responseStatus >= 200 && responseStatus < 300 ? (
                    <CheckCircle2 className="h-3 w-3 inline" />
                  ) : (
                    <AlertCircle className="h-3 w-3 inline" />
                  )}
                  {responseStatus}
                </Badge>
              )}
              {latencyMs !== null && (
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {latencyMs}ms
                </span>
              )}
            </CardTitle>

            {responseData && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5 cursor-pointer"
                onClick={handleCopyResponse}
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            )}
          </CardHeader>

          <CardContent className="pt-4 flex-1 flex flex-col">
            {responseData ? (
              <pre className="flex-1 max-h-[480px] overflow-auto rounded-md border border-border bg-zinc-950 p-4 font-mono text-xs text-zinc-200 scrollbar-thin">
                {responseData}
              </pre>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center rounded-md border border-dashed border-border text-center text-xs text-muted-foreground p-8 min-h-[280px]">
                <Terminal className="h-8 w-8 opacity-40 mb-2 text-muted-foreground" />
                <p className="font-medium text-foreground">Aguardando execução</p>
                <p className="text-[11px] mt-1 text-muted-foreground">
                  Selecione um endpoint ou atalho e clique em &quot;Executar Chamada&quot;.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
