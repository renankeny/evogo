import React, { useState } from "react";
import { Play, Send, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { apiClient } from "@/services/apiClient";
import { useInstances } from "@/hooks/useInstances";

export default function ApiTesterPage() {
  const { instances } = useInstances(0);
  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [endpoint, setEndpoint] = useState("/server/ok");
  const [selectedToken, setSelectedToken] = useState("");
  const [requestBody, setRequestBody] = useState("");
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const presets = [
    { label: "Status do Servidor", method: "GET", endpoint: "/server/ok", body: "" },
    { label: "Listar Todas Instâncias", method: "GET", endpoint: "/instance/all", body: "" },
    { label: "Status da Licença", method: "GET", endpoint: "/license/status", body: "" },
    {
      label: "Enviar Mensagem de Texto",
      method: "POST",
      endpoint: "/message/sendText",
      body: JSON.stringify(
        {
          number: "5511999999999",
          textMessage: { text: "Olá do Evolution GO!" },
        },
        null,
        2
      ),
    },
  ];

  const handleApplyPreset = (preset: (typeof presets)[0]) => {
    setMethod(preset.method as "GET" | "POST");
    setEndpoint(preset.endpoint);
    setRequestBody(preset.body);
  };

  const handleExecute = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseData(null);
    try {
      const headers: Record<string, string> = {};
      if (selectedToken) {
        headers["apikey"] = selectedToken;
      }

      let res;
      if (method === "GET") {
        res = await apiClient.get(endpoint, { headers });
      } else {
        const payload = requestBody ? JSON.parse(requestBody) : {};
        res = await apiClient.post(endpoint, payload, { headers });
      }
      setResponseStatus(res.status);
      setResponseData(JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      setResponseStatus(err?.response?.status || 500);
      setResponseData(
        JSON.stringify(err?.response?.data || { error: err?.message }, null, 2)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (!responseData) return;
    navigator.clipboard.writeText(responseData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">API Tester</h1>
        <p className="text-sm text-muted-foreground">
          Teste interativamente as rotas do seu Evolution GO diretamente pelo painel.
        </p>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground mr-1">Atalhos rápidos:</span>
        {presets.map((p, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => handleApplyPreset(p)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Painel de Requisição */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              Requisição
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="flex gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as "GET" | "POST")}
                className="rounded-md border border-input bg-transparent px-3 py-1 text-sm font-semibold text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
              <Input
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="/server/ok"
                className="font-mono text-xs"
              />
            </div>

            {instances.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Usar Token da Instância (Opcional):
                </label>
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Nenhum (usar Global API Key padrão)</option>
                  {instances.map((i) => (
                    <option key={i.id} value={i.apikey}>
                      {i.name} ({i.apikey.slice(0, 8)}...)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {method === "POST" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Corpo JSON:</label>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={8}
                  placeholder={'{\n  "key": "value"\n}'}
                  className="w-full rounded-md border border-input bg-muted/20 p-3 font-mono text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            )}

            <Button onClick={handleExecute} disabled={loading} className="w-full gap-2">
              <Send className="h-4 w-4" />
              {loading ? "Executando..." : "Executar Requisição"}
            </Button>
          </CardContent>
        </Card>

        {/* Painel de Resposta */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              Resposta
              {responseStatus !== null && (
                <Badge variant={responseStatus >= 200 && responseStatus < 300 ? "success" : "destructive"}>
                  {responseStatus >= 200 && responseStatus < 300 ? (
                    <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1 inline" />
                  )}
                  HTTP {responseStatus}
                </Badge>
              )}
            </CardTitle>
            {responseData && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleCopyResponse}
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                Copiar
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            {responseData ? (
              <pre className="max-h-[400px] overflow-auto rounded-md border border-border/80 bg-muted/40 p-4 font-mono text-xs text-foreground">
                {responseData}
              </pre>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-md border border-dashed border-border text-center text-xs text-muted-foreground p-6">
                Clique em "Executar Requisição" para visualizar o retorno da API em tempo real.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
