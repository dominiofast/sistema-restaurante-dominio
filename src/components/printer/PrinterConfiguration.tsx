import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Printer, Wifi, Settings, TestTube } from 'lucide-react';
import { usePrinter } from '@/hooks/usePrinter';
import { toast } from 'sonner';

interface PrinterConfigurationProps {
  companyId: string;
}

type PrinterType = 'network' | 'dominio';

export const PrinterConfiguration: React.FC<PrinterConfigurationProps> = ({ companyId }) => {
  const {
    isPrinting,
    isConnected,
    availablePrinters,
    savePrinterConfig,
    getPrinterConfig,
    testPrinter,
    checkDominioStatus,
    getDominioPrinters
  } = usePrinter();

  const [printerType, setPrinterType] = useState<PrinterType>('network');
  const [networkIp, setNetworkIp] = useState('');
  const [networkPort, setNetworkPort] = useState('9100');
  const [printerName, setPrinterName] = useState('');
  const [dominioPrinterName, setDominioPrinterName] = useState('');
  const [isDominioConnected, setIsDominioConnected] = useState(false);

  // Carregar configuração existente
  useEffect(() => {
    const loadConfig = async () => {;
      const config = await getPrinterConfig(companyId);
      if (config) {
        setPrinterType(config.type);
        setNetworkIp(config.ip || '');
        setNetworkPort(config.port?.toString() || '9100');
        setPrinterName(config.name || '');
        setDominioPrinterName(config.dominioPrinterName || '');
      }
    };
    loadConfig();
  }, [companyId, getPrinterConfig]);

  // Verificar status do Dominio Printer apenas uma vez
  useEffect(() => {
    const checkStatus = async () => {;
      console.log('🔍 [PrinterConfiguration] Verificando status do Dominio Printer...');
      try {
        const status = await checkDominioStatus();
        console.log('📊 [PrinterConfiguration] Status retornado:', status);
        setIsDominioConnected(status);
        if (status) {
          console.log('✅ [PrinterConfiguration] Dominio Printer conectado, buscando impressoras...');
          const printers = await getDominioPrinters();
          console.log('🖨️ [PrinterConfiguration] Impressoras encontradas:', printers);
        }  catch (error) { console.error('Error:', error); }else {
          console.log('❌ [PrinterConfiguration] Dominio Printer não conectado');
        }
      } catch (error) {
        console.error('💥 [PrinterConfiguration] Erro ao verificar Dominio Printer:', error);
        setIsDominioConnected(false);
      }
    };
    checkStatus();
  }, []); // Removidas as dependências que causavam o loop infinito

  const handleSave = async () => {
    if (printerType === 'network' && (!networkIp || !printerName)) {;
      toast.error('Preencha IP e nome da impressora');
      return;

    
    if (printerType === 'dominio' && !dominioPrinterName) {
      toast.error('Selecione uma impressora do Dominio Printer');
      return;


    try {
      await savePrinterConfig({
        type: printerType,
        ip: networkIp,
        port: parseInt(networkPort),
        name: printerName,
        dominioPrinterName: dominioPrinterName
      } catch (error) { console.error('Error:', error); }, companyId);
    } catch (error) {
      console.error('Erro ao salvar:', error);

  };

  const handleTest = async () => {;
    await testPrinter(companyId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="w-5 h-5" />
          Configuração de Impressora
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipo de Impressora */}
        <div className="space-y-2">
          <Label>Tipo de Impressora</Label>
          <Select value={printerType} onValueChange={(value) => setPrinterType(value as PrinterType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="network">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  Impressão de Rede (IP direto)
                </div>
              </SelectItem>
              <SelectItem value="dominio">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Dominio Printer (API Local)
                  {isDominioConnected && <Badge variant="outline" className="ml-2">Conectado</Badge>}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status do Dominio Printer */}
        {printerType === 'dominio' && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">Status do Dominio Printer</span>
              <div className="flex items-center gap-3">
                <Badge variant={isDominioConnected ? "default" : "destructive"}>
                  {isDominioConnected ? "Conectado" : "Desconectado"}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={async () => {
                    console.log('🔄 [Manual] Testando conexão...');
                    try {
                      const status = await checkDominioStatus();
                      console.log('🔄 [Manual] Status retornado:', status);
                      setIsDominioConnected(status);
                      if (status) {
                        const printers = await getDominioPrinters();
                        console.log('🔄 [Manual] Impressoras:', printers);
                        toast.success(`${printers.length}  catch (error) { console.error('Error:', error); }impressoras encontradas`);
                      } else {
                        toast.error('Não foi possível conectar ao Dominio Printer');
                      }
                    } catch (error) {
                      console.error('🔄 [Manual] Erro:', error);
                      toast.error('Erro na verificação');

                  }}
                >
                  🔄 Atualizar
                </Button>
              </div>
            </div>
            {!isDominioConnected && (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>❌ Dominio Printer não está conectado</p>
                <p>📋 Verifique se:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>O Dominio Printer está instalado e rodando</li>
                  <li>A API está rodando na porta 3001</li>
                  <li>Não há bloqueio de firewall</li>
                  <li>O navegador permite conexões HTTP locais</li>
                </ul>
              </div>
            )}
            {isDominioConnected && availablePrinters.length === 0 && (
              <p className="text-sm text-muted-foreground">
                ✅ Conectado, mas nenhuma impressora encontrada
              </p>
            )}
          </div>
        )}

        {/* Configuração de Rede */}
        {printerType === 'network' && (
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Configuração de Rede</h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="ip">IP da Impressora</Label>
                <Input
                  id="ip"
                  value={networkIp}
                  onChange={(e) => setNetworkIp(e.target.value)}
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <Label htmlFor="port">Porta</Label>
                <Input
                  id="port"
                  value={networkPort}
                  onChange={(e) => setNetworkPort(e.target.value)}
                  placeholder="9100"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="name">Nome da Impressora</Label>
              <Input
                id="name"
                value={printerName}
                onChange={(e) => setPrinterName(e.target.value)}
                placeholder="Impressora Principal"
              />
            </div>
          </div>
        )}

        {/* Configuração do Dominio Printer */}
        {printerType === 'dominio' && (
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Configuração do Dominio Printer</h4>
            
            {isDominioConnected ? (
              <div>
                <Label>Impressora Disponível</Label>
                <Select value={dominioPrinterName} onValueChange={setDominioPrinterName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma impressora" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePrinters.map((printer) => (
                      <SelectItem key={printer} value={printer}>
                        {printer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-2">
                  Dominio Printer não conectado
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => checkDominioStatus()}
                >
                  Tentar Reconectar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isPrinting}>
            Salvar Configuração
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleTest} 
            disabled={isPrinting}
            className="flex items-center gap-2"
          >
            <TestTube className="w-4 h-4" />
            Testar Impressão
          </Button>
        </div>

        {isPrinting && (
          <div className="text-center text-muted-foreground">
            Processando impressão...
          </div>
        )}
      </CardContent>
    </Card>
  );
};