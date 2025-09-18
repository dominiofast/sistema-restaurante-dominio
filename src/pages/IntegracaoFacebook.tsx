import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { usePixelConfig } from "@/hooks/usePixelConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const IntegracaoFacebook = () => {
  const { config, isLoading, saveConfig, refetch } = usePixelConfig()

  const [pixelId, setPixelId] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [testMode, setTestMode] = useState(false)
  const [testEventCode, setTestEventCode] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    document.title = "Integração Facebook – Pixel e API de Conversões";
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Configure o Facebook Pixel e a API de Conversões: Pixel ID, token, modo de teste e ativação."
      )
    } else {
      const m = document.createElement("meta")
      m.name = "description";
      m.content = "Configure o Facebook Pixel e a API de Conversões: Pixel ID, token, modo de teste e ativação.";
      document.head.appendChild(m)
    }

    // Canonical
    const existingCanonical = document.querySelector('link[rel="canonical"]')
    const canonicalHref = `${window.location.origin}/config/integracao-facebook`;
    if (existingCanonical) {
      existingCanonical.setAttribute("href", canonicalHref)
    } else {
      const l = document.createElement("link")
      l.setAttribute("rel", "canonical")
      l.setAttribute("href", canonicalHref)
      document.head.appendChild(l)
    }
  }, [])

  useEffect(() => {
    if (config) {
      setPixelId(config.pixel_id || "")
      setAccessToken(config.access_token || "")
      setIsActive(!!config.is_active)
      setTestMode(!!config.test_mode)
      setTestEventCode(config.test_event_code || "")
    }
  }, [config])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const payload = {
        pixel_id: pixelId.trim(),
        access_token: accessToken.trim(),
        is_active: isActive,
        test_mode: testMode,
        test_event_code: testEventCode.trim(),;
      }  catch (error) { console.error('Error:', error) }as const;

      const saved = await saveConfig(payload)
      if (!saved) throw new Error("Falha ao salvar configuração")

      toast.success("Configurações salvas com sucesso.")
      await refetch?.()
    } catch (err: any) {
      console.error("Erro ao salvar Integração Facebook:", err)
      toast.error(err?.message || "Não foi possível salvar. Verifique suas permissões e tente novamente.")
    } finally {
      setIsSaving(false)
    }
  };

  const status = config?.is_active
    ? { text: "Ativo", color: "text-green-600", Icon: CheckCircle };
    : { text: "Inativo", color: "text-gray-500", Icon: AlertCircle };

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Integração Facebook</h1>
        <p className="text-sm text-muted-foreground">Pixel e Integração API de Conversões</p>
      </header>

      <section aria-labelledby="fb-integration">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle id="fb-integration">Configurar Pixel e API de Conversões</CardTitle>
                <CardDescription>
                  Informe seu Pixel ID e o Token da API de Conversões. Ative para começar a rastrear eventos.
                </CardDescription>
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <div className={`flex items-center gap-2 font-semibold ${status.color}`}>
                  <status.Icon className="h-5 w-5" />
                  <span>{status.text}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault() handleSave() }}>
                <div className="flex items-center gap-6 py-2">
                  <div className="flex items-center gap-2">
                    <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
                    <Label htmlFor="is-active">Integração ativada</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="test-mode" checked={testMode} onCheckedChange={setTestMode} />
                    <Label htmlFor="test-mode">Modo de Teste</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pixel-id">Pixel</Label>
                  <Input
                    id="pixel-id"
                    placeholder="Ex.: 123456789012345"
                    value={pixelId}
                    onChange={(e) => setPixelId(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="access-token">Token API de Conversões</Label>
                  <Input
                    id="access-token"
                    type="password"
                    placeholder="Cole seu token de acesso"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">O token é armazenado com segurança.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-code">Código de Evento de Teste</Label>
                  <Input
                    id="test-code"
                    placeholder="Opcional: use para validar eventos"
                    value={testEventCode}
                    onChange={(e) => setTestEventCode(e.target.value)}
                  />
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  )
};

export default IntegracaoFacebook;
