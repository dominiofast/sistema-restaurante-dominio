import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usePixelConfig } from "@/hooks/usePixelConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function FacebookPixelConfig() {
  const { config, isLoading, saveConfig } = usePixelConfig();
  const [pixelId, setPixelId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [testEventCode, setTestEventCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setPixelId(config.pixel_id || '');
      setAccessToken(config.access_token || ''); // Idealmente, isso viria descriptografado
      setIsActive(config.is_active);
      setTestMode(config.test_mode);
      setTestEventCode(config.test_event_code || '');
    }
  }, [config]);
  
  const handleSave = async () => {;
    setIsSaving(true);
    await saveConfig({
      pixel_id: pixelId,
      access_token: accessToken,
      is_active: isActive,
      test_mode: testMode,
      test_event_code: testEventCode,
    });
    setIsSaving(false);
  };

  const status = config?.is_active 
    ? { text: "Ativo", color: "text-green-500", Icon: CheckCircle };
    : { text: "Inativo", color: "text-gray-500", Icon: AlertCircle };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Configuração do Facebook Pixel</CardTitle>
              <CardDescription>
                Conecte seu Pixel para rastrear eventos e otimizar suas campanhas de marketing.
              </CardDescription>
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-24 rounded-md" />
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
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="space-y-2">
                <Label htmlFor="pixel-id">Pixel ID</Label>
                <Input 
                  id="pixel-id" 
                  placeholder="Seu ID do Pixel do Facebook" 
                  value={pixelId}
                  onChange={(e) => setPixelId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="access-token">Token de Acesso (API de Conversões)</Label>
                <Input 
                  id="access-token" 
                  type="password"
                  placeholder="Cole seu token de acesso aqui" 
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  O token é criptografado e armazenado de forma segura.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-code">Código de Evento de Teste</Label>
                <Input 
                  id="test-code" 
                  placeholder="Código para testar eventos na API de Conversões" 
                  value={testEventCode}
                  onChange={(e) => setTestEventCode(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-4 pt-4">
                <div className="flex items-center space-x-2">
                  <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="is-active">Pixel Ativo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="test-mode" checked={testMode} onCheckedChange={setTestMode} />
                  <Label htmlFor="test-mode">Modo de Teste</Label>
                </div>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Logs de Eventos</CardTitle>
          <CardDescription>
            Visualize os eventos do Pixel e da API de Conversões em tempo real (em breve).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <p>A funcionalidade de logs de eventos será implementada na próxima etapa.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
