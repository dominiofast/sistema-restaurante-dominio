import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Settings, 
  TestTube, 
  Activity, 
  Save, 
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Play,
  Trash2,
  Zap,
  Server,
  List,
  FileText,
  Download,
  Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import '@/utils/qz-tray-official.js';

interface Impressora {
  name: string;
  description?: string;
  driver?: string;
}

interface ItemPedido {
  name: string;
  quantity: number;
  price: number;
  observations?: string;
}

interface PedidoTeste {
  id: string;
  number: string;
  customer: string;
  items: ItemPedido[];
  total: number;
  observations: string;
  delivery: {
    address: string;
    phone: string;
  };
}

interface LogEntry {
  timestamp: string;
  type: 'success' | 'error' | 'info' | 'debug';
  message: string;
}

// Declaração global do QZ
declare global {
  interface Window {
    qz: any;
  }
}

const ImpressaoQZTrayConfig = () => {
  // SEO
  useEffect(() => {
    document.title = 'Conexão QZ Tray | Impressão térmica';
    const desc = 'Conecte, teste e configure impressoras térmicas via QZ Tray.';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name','description'); document.head.appendChild(meta); }
    meta.setAttribute('content', desc);
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) { link = document.createElement('link'); link.setAttribute('rel','canonical'); document.head.appendChild(link); }
    link.setAttribute('href', window.location.origin + '/settings/qz-tray');
  }, []);
  // Estados de conexão
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qzVersion, setQzVersion] = useState<string>('');
  
  // Estados de impressoras
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [impressoraSelecionada, setImpressoraSelecionada] = useState<string>('');
  
  // Estados de configuração
  const [impressaoAutomatica, setImpressaoAutomatica] = useState(false);
  const [larguraPapel, setLarguraPapel] = useState(48);
  const [textoHeader, setTextoHeader] = useState('PEDIDO DE DELIVERY');
  const [textoFooter, setTextoFooter] = useState('Obrigado pela preferência!');
  
  // Estados de teste
  const [pedidoTeste, setPedidoTeste] = useState<PedidoTeste>({
    id: `pedido_${Date.now()}`,
    number: `#${Math.floor(Math.random() * 10000)}`,
    customer: 'João Silva',
    items: [
      {
        name: 'X-Bacon',
        quantity: 1,
        price: 25.90,
        observations: 'Sem tomate'
      },
      {
        name: 'Refrigerante',
        quantity: 2,
        price: 6.50
      }
    ],
    total: 38.90,
    observations: 'Pedido de teste',
    delivery: {
      address: 'Rua das Flores, 123 - São Paulo/SP',
      phone: '(11) 99999-9999'
    }
  });
  
  // Estados de log
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Carregar configurações salvas
  useEffect(() => {
    loadConfigurations();
    
    // Aguardar um pouco para o script carregar
    const timer = setTimeout(() => {
      console.log('🚀 Iniciando verificação do QZ Tray...');
      console.log('🔍 Verificando se o script QZ foi carregado...');
      console.log('window:', typeof window);
      console.log('document.scripts length:', document.scripts.length);
      
      // Listar todos os scripts carregados
      for (let i = 0; i < document.scripts.length; i++) {
        const script = document.scripts[i];
        if (script.src.includes('qz-tray')) {
          console.log('✅ Script QZ encontrado:', script.src);
        }
      }
      
      // Tentar forçar a criação do objeto QZ se necessário
      if (typeof window.qz === 'undefined') {
        console.log('🔄 Tentando recarregar script QZ...');
        // Tentar aguardar mais um pouco
        setTimeout(() => {
          checkQZTray();
        }, 3000);
      } else {
        checkQZTray();
      }
    }, 2000); // Aumentei para 2 segundos
    
    return () => clearTimeout(timer);
  }, []);

  // Calcular total automaticamente
  useEffect(() => {
    const total = pedidoTeste.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    setPedidoTeste(prev => ({ ...prev, total }));
  }, [pedidoTeste.items]);

  // Funções auxiliares
  const addLog = (type: 'success' | 'error' | 'info' | 'debug', message: string) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const loadConfigurations = () => {
    try {
      const savedImpressora = localStorage.getItem('qz_tray_impressora');
      const savedAutomatica = localStorage.getItem('qz_tray_automatica');
      const savedLargura = localStorage.getItem('qz_tray_largura');
      const savedHeader = localStorage.getItem('qz_tray_header');
      const savedFooter = localStorage.getItem('qz_tray_footer');
      
      if (savedImpressora) setImpressoraSelecionada(savedImpressora);
      if (savedAutomatica) setImpressaoAutomatica(savedAutomatica === 'true');
      if (savedLargura) setLarguraPapel(parseInt(savedLargura));
      if (savedHeader) setTextoHeader(savedHeader);
      if (savedFooter) setTextoFooter(savedFooter);
      
      addLog('info', 'Configurações carregadas do localStorage');
    } catch (error) {
      addLog('error', 'Erro ao carregar configurações');
    }
  };

  const saveConfigurations = () => {
    try {
      localStorage.setItem('qz_tray_impressora', impressoraSelecionada);
      localStorage.setItem('qz_tray_automatica', impressaoAutomatica.toString());
      localStorage.setItem('qz_tray_largura', larguraPapel.toString());
      localStorage.setItem('qz_tray_header', textoHeader);
      localStorage.setItem('qz_tray_footer', textoFooter);
      
      toast.success('Configurações salvas com sucesso!');
      addLog('success', 'Configurações salvas');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
      addLog('error', 'Erro ao salvar configurações');
    }
  };

  // Funções do QZ Tray
  const checkQZTray = async () => {
    console.log('🔍 Verificando QZ Tray...');
    
    // Aguardar carregamento do script
    let attempts = 0;
    const maxAttempts = 10;
    
    while (typeof window.qz === 'undefined' && attempts < maxAttempts) {
      console.log(`🔄 Tentativa ${attempts + 1}: Aguardando carregamento do QZ...`);
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    
    if (typeof window.qz === 'undefined') {
      addLog('error', 'QZ Tray não carregou. Verifique se o QZ Tray está instalado e rodando.');
      toast.error('QZ Tray não carregou. Verifique se está instalado e rodando.');
      return;
    }

    console.log('✅ Objeto QZ encontrado:', window.qz);
    console.log('🔗 Versão QZ:', window.qz.version);
    
    setLoading(true);
    addLog('info', 'Conectando ao QZ Tray...');
    
    try {
      // Verificar se WebSocket já está ativo
      if (!window.qz.websocket.isActive()) {
        console.log('🔗 Conectando WebSocket...');
        addLog('info', 'Estabelecendo conexão WebSocket...');
        try {
          // Configuração de desenvolvimento: certificados e assinatura simples
          window.qz.security.setCertificatePromise(() => Promise.resolve(''));
          window.qz.security.setSignaturePromise((toSign: string) => Promise.resolve(btoa(toSign)));
          addLog('info', 'Segurança QZ configurada (dev)');
        } catch (e) {
          addLog('debug', 'Falha ao configurar segurança QZ: ' + e);
        }
        // Forçar modo seguro em páginas HTTPS e inseguro em HTTP
        const usingSecure = window.location.protocol === 'https:';
        const options = {
          host: ['localhost', 'localhost.qz.io'],
          usingSecure,
          port: {
            secure: [8182, 8282, 8382, 8482],
            insecure: [8181, 8281, 8381, 8481]
          }
        } as any;
        await window.qz.websocket.connect(options);
      }
      console.log('✅ WebSocket conectado!');
      const version = window.qz.version;
      
      setQzVersion(version);
      setIsConnected(true);
      addLog('success', `Conectado ao QZ Tray versão ${version}`);
      toast.success(`Conectado ao QZ Tray v${version}`);
      
      // Carregar impressoras automaticamente
      await carregarImpressoras();
    } catch (error: any) {
      console.error('❌ Erro ao conectar:', error);
      setIsConnected(false);
      const errMsg = String(error?.message || error);
      addLog('error', `Erro ao conectar: ${errMsg}`);
      // Dica específica para certificado/mixed content
      if (/SECURITY|CERT|certificate|Mixed|insecure WebSocket|SSL/i.test(errMsg)) {
        addLog('info', 'Dica: Abra https://localhost:8182 e aceite o certificado do QZ Tray.');
        toast.error('Falha de segurança/certificado. Abra https://localhost:8182 e aceite o certificado.');
      } else {
        toast.error(`Falha na conexão: ${errMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const carregarImpressoras = async () => {
    if (!window.qz?.websocket?.isActive()) {
      addLog('error', 'QZ Tray não está conectado');
      return;
    }

    setLoading(true);
    try {
      // Reafirmar segurança em dev antes de listar (evita erros de assinatura)
      try {
        window.qz.security.setCertificatePromise(() => Promise.resolve(''));
        window.qz.security.setSignaturePromise((toSign: string) => Promise.resolve(btoa(toSign)));
      } catch {}

      // Timeout de 10s para evitar travas
      const withTimeout = <T,>(p: Promise<T>, ms = 10000) => new Promise<T>((resolve, reject) => {
        const id = setTimeout(() => reject(new Error('Timeout ao buscar impressoras')), ms);
        p.then((v) => { clearTimeout(id); resolve(v); }).catch((e) => { clearTimeout(id); reject(e); });
      });

      const printers: string[] = await withTimeout(window.qz.printers.find());

      // Fallback: tentar impressora padrão se lista vier vazia
      if (printers.length === 0) {
        let def: string | null = null;
        try { def = await window.qz.printers.getDefault(); } catch {}
        if (def) {
          setImpressoras([{ name: def }]);
          toast.success('Usando impressora padrão do sistema');
          addLog('success', `Impressora padrão detectada: ${def}`);
          return;
        }
      }

      setImpressoras(printers.map((name: string) => ({ name })));
      if (printers.length === 0) {
        toast.warning('Nenhuma impressora encontrada');
        addLog('info', 'Lista de impressoras vazia');
      } else {
        toast.success(`${printers.length} impressoras encontradas`);
        addLog('success', `${printers.length} impressoras carregadas`);
      }
    } catch (error: any) {
      const errMsg = String(error?.message || error);
      toast.error(`Erro ao carregar impressoras: ${errMsg}`);
      addLog('error', `Erro ao carregar impressoras: ${errMsg}`);
      if (/sign|certificate|trust|permission|SECURITY/i.test(errMsg)) {
        addLog('info', 'Dica: abra https://localhost:8182 e aceite o certificado do QZ Tray.');
      }
    } finally {
      setLoading(false);
    }
  };

  const gerarComandosESCPOS = (pedido: PedidoTeste): string => {
    let commands = '';
    
    // Inicializar impressora
    commands += '\x1B\x40'; // ESC @ - Reset printer
    
    // Centralizar e imprimir header
    if (textoHeader) {
      commands += '\x1B\x61\x01'; // ESC a 1 - Center align
      commands += '\x1B\x21\x30'; // ESC ! 48 - Double height and width
      commands += textoHeader + '\n';
      commands += '\x1B\x21\x00'; // ESC ! 0 - Normal text
      commands += '\x1B\x61\x00'; // ESC a 0 - Left align
      commands += '\n';
    }
    
    // Informações do pedido
    commands += 'PEDIDO: ' + pedido.number + '\n';
    commands += 'CLIENTE: ' + pedido.customer + '\n';
    commands += 'DATA: ' + new Date().toLocaleString('pt-BR') + '\n';
    commands += '\n';
    
    // Linha separadora
    commands += '-'.repeat(larguraPapel) + '\n';
    
    // Itens do pedido
    commands += 'ITENS:\n';
    commands += '-'.repeat(larguraPapel) + '\n';
    
    pedido.items.forEach(item => {
      commands += `${item.quantity}x ${item.name}\n`;
      if (item.observations) {
        commands += `  Obs: ${item.observations}\n`;
      }
      const subtotal = item.quantity * item.price;
      const priceStr = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
      const spaces = larguraPapel - priceStr.length;
      commands += ' '.repeat(Math.max(0, spaces)) + priceStr + '\n';
      commands += '\n';
    });
    
    // Total
    commands += '-'.repeat(larguraPapel) + '\n';
    commands += '\x1B\x21\x10'; // ESC ! 16 - Double width
    const totalStr = `TOTAL: R$ ${pedido.total.toFixed(2).replace('.', ',')}`;
    const totalSpaces = larguraPapel - totalStr.length;
    commands += ' '.repeat(Math.max(0, totalSpaces)) + totalStr + '\n';
    commands += '\x1B\x21\x00'; // ESC ! 0 - Normal text
    
    // Informações de entrega
    if (pedido.delivery.address) {
      commands += '\n';
      commands += '-'.repeat(larguraPapel) + '\n';
      commands += 'ENTREGA:\n';
      commands += pedido.delivery.address + '\n';
      if (pedido.delivery.phone) {
        commands += 'Telefone: ' + pedido.delivery.phone + '\n';
      }
    }
    
    // Observações
    if (pedido.observations) {
      commands += '\n';
      commands += 'OBSERVAÇÕES:\n';
      commands += pedido.observations + '\n';
    }
    
    // Footer
    if (textoFooter) {
      commands += '\n';
      commands += '-'.repeat(larguraPapel) + '\n';
      commands += '\x1B\x61\x01'; // ESC a 1 - Center align
      commands += textoFooter + '\n';
      commands += '\x1B\x61\x00'; // ESC a 0 - Left align
    }
    
    // Cortar papel e ejetar
    commands += '\n\n\n';
    commands += '\x1D\x56\x41\x10'; // GS V A 16 - Partial cut
    
    return commands;
  };

  const testarImpressora = async (impressoraNome?: string) => {
    const printer = impressoraNome || impressoraSelecionada;
    if (!printer) {
      toast.error('Selecione uma impressora primeiro');
      addLog('error', 'Nenhuma impressora selecionada para teste');
      return;
    }

    // Verificar conexão com QZ Tray
    if (!window.qz) {
      toast.error('QZ Tray não está carregado');
      addLog('error', 'Objeto QZ não encontrado - QZ Tray não carregado');
      return;
    }

    if (!window.qz.websocket?.isActive()) {
      toast.error('QZ Tray não está conectado');
      addLog('error', 'WebSocket do QZ Tray não está ativo');
      
      // Tentar conectar automaticamente
      try {
        addLog('info', 'Tentando conectar automaticamente...');
        await window.qz.websocket.connect();
        addLog('success', 'Conexão estabelecida automaticamente');
      } catch (connectError) {
        addLog('error', `Falha na conexão automática: ${connectError}`);
        return;
      }
    }

    setLoading(true);
    addLog('info', `Iniciando teste de impressão na impressora: ${printer}`);
    
    try {
      // Verificar se a impressora existe na lista
      const availablePrinters = await window.qz.printers.find();
      if (!availablePrinters.includes(printer)) {
        throw new Error(`Impressora '${printer}' não encontrada. Impressoras disponíveis: ${availablePrinters.join(', ')}`);
      }
      
      addLog('info', 'Impressora encontrada, gerando comandos de teste...');
      
      // Comandos de teste mais robustos
      const testCommands = 
        '\x1B\x40' +                    // ESC @ - Reset printer
        '\x1B\x61\x01' +               // ESC a 1 - Center align
        '\x1B\x21\x30' +               // ESC ! 48 - Double height and width
        '=== TESTE QZ TRAY ===\n' +
        '\x1B\x21\x00' +               // ESC ! 0 - Normal text
        '\x1B\x61\x00' +               // ESC a 0 - Left align
        '\n' +
        'Impressora: ' + printer + '\n' +
        'Data/Hora: ' + new Date().toLocaleString('pt-BR') + '\n' +
        'Status: ✅ FUNCIONANDO!\n' +
        '\n' +
        'Este é um teste de impressão\n' +
        'para verificar se a impressora\n' +
        'está respondendo corretamente.\n' +
        '\n' +
        '================================\n' +
        '\x1B\x61\x01' +               // Center align
        'Teste realizado com sucesso!\n' +
        '\x1B\x61\x00' +               // Left align
        '\n\n\n' +
        '\x1D\x56\x41\x10';            // GS V A 16 - Partial cut

      addLog('info', 'Criando configuração de impressão...');
      const config = window.qz.configs.create(printer);
      
      addLog('info', 'Preparando dados para impressão...');
      const data = [{ 
        type: 'raw', 
        format: 'plain', 
        data: testCommands 
      }];
      
      addLog('info', 'Enviando comando de impressão...');
      await window.qz.print(config, data);
      
      toast.success('✅ Teste de impressão enviado com sucesso!');
      addLog('success', `Teste enviado para impressora '${printer}' - Verifique se o papel foi impresso`);
      
    } catch (error: any) {
      console.error('Erro no teste de impressão:', error);
      
      let errorMessage = 'Erro desconhecido no teste de impressão';
      
      if (error.message?.includes('not found')) {
        errorMessage = `Impressora '${printer}' não encontrada`;
      } else if (error.message?.includes('offline')) {
        errorMessage = `Impressora '${printer}' está offline`;
      } else if (error.message?.includes('permission')) {
        errorMessage = 'Sem permissão para imprimir - Verifique as configurações do QZ Tray';
      } else if (error.message?.includes('certificate')) {
        errorMessage = 'Problema com certificados - Configure os certificados de segurança';
      } else {
        errorMessage = `Erro na impressão: ${error.message || error}`;
      }
      
      toast.error(errorMessage);
      addLog('error', `Falha no teste: ${errorMessage}`);
      addLog('debug', `Detalhes do erro: ${JSON.stringify(error, null, 2)}`);
      
    } finally {
      setLoading(false);
    }
  };

  const enviarPedidoTeste = async () => {
    if (!impressoraSelecionada) {
      toast.error('Selecione uma impressora primeiro');
      return;
    }

    if (!window.qz?.websocket?.isActive()) {
      toast.error('QZ Tray não está conectado');
      return;
    }

    setLoading(true);
    try {
      const commands = gerarComandosESCPOS(pedidoTeste);
      
      const config = window.qz.configs.create(impressoraSelecionada);
      const data = [{ type: 'raw', format: 'plain', data: commands }];
      
      await window.qz.print(config, data);
      
      toast.success('Pedido de teste enviado para impressão!');
      addLog('success', `Pedido ${pedidoTeste.number} enviado para impressão`);
    } catch (error) {
      toast.error('Erro ao enviar pedido');
      addLog('error', `Erro ao enviar pedido: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testeRapido = async () => {
    if (!impressoraSelecionada) {
      toast.error('Selecione uma impressora primeiro');
      return;
    }
    await testarImpressora(impressoraSelecionada);
  };

  const limparLogs = () => {
    setLogs([]);
    addLog('info', 'Logs limpos');
  };

  const testarConexaoLocal = async () => {
    console.log('🌐 Testando conexão local com QZ Tray...');
    addLog('info', 'Testando conexão local (HTTP 8181 e HTTPS 8182)...');
    const tests = [
      { url: 'http://localhost:8181', label: 'HTTP 8181' },
      { url: 'https://localhost:8182', label: 'HTTPS 8182' }
    ];
    for (const t of tests) {
      try {
        await fetch(t.url, { method: 'GET', mode: 'no-cors' });
        addLog('success', `QZ Tray encontrado em ${t.label}`);
        toast.success(`QZ Tray detectado em ${t.label}!`);
        return;
      } catch (err) {
        console.warn(`Falha em ${t.label}`, err);
      }
    }
    addLog('error', 'QZ Tray não respondendo nas portas padrão (8181/8182)');
    toast.error('QZ Tray não encontrado nas portas 8181/8182. Certifique-se de que está rodando.');
  };

  const abrirCertificadoHTTPS = () => {
    addLog('info', 'Abrindo página de certificado HTTPS (8182)...');
    window.open('https://localhost:8182', '_blank', 'noopener,noreferrer');
  };

  const forcarReconexaoQZ = async () => {
    console.log('🔄 Forçando reconexão com QZ Tray...');
    addLog('info', 'Tentando forçar reconexão...');
    // Remover script antigo
    const oldScript = document.querySelector('script[src*="qz-tray"]');
    if (oldScript) {
      oldScript.remove();
      console.log('🗑️ Script antigo removido');
    }
    // Adicionar novo script
    const script = document.createElement('script');
    // Lista de CDNs para tentar
    const cdnUrls = [
      'https://unpkg.com/qz-tray@2.2.5',
      'https://cdn.jsdelivr.net/npm/qz-tray@2.2.5',
      'https://unpkg.com/qz-tray@2.2.4',
      'https://cdn.jsdelivr.net/npm/qz-tray@2.2.4'
    ];
    script.src = cdnUrls[0]; // Usar o primeiro CDN
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      console.log('✅ Script QZ recarregado');
      setTimeout(() => {
        console.log('🔄 Tentando conectar após recarga...');
        checkQZTray();
      }, 2000);
    };
    script.onerror = () => {
      console.error('❌ Erro ao recarregar script QZ');
      addLog('error', 'Erro ao recarregar script QZ');
    };
    document.head.appendChild(script);
    addLog('info', 'Script QZ recarregado, aguardando conexão...');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Printer className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">🖨️ QZ Tray - Impressão Térmica</h1>
          <p className="text-muted-foreground">Configure e teste o sistema de impressão usando QZ Tray</p>
        </div>
      </div>

      {/* Seção de Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            🔗 Conexão com QZ Tray
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {isConnected ? '● Conectado' : '● Desconectado'}
            </div>
            {qzVersion && (
              <Badge variant="outline">
                Versão: {qzVersion}
              </Badge>
            )}
          </div>
          
          <div className="space-y-3">
            {/* Linha 1: Botão principal */}
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  console.log('🔘 Botão Conectar clicado!');
                  checkQZTray();
                }} 
                disabled={loading}
                size="lg"
                className="w-full max-w-md"
              >
                <Activity className="h-4 w-4 mr-2" />
                {loading ? 'Conectando...' : 'Conectar QZ Tray'}
              </Button>
            </div>
            
            {/* Linha 2: Botões secundários */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Button 
                variant="secondary" 
                onClick={testarConexaoLocal}
                size="sm"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Testar Porta 8181
              </Button>
              <Button 
                variant="secondary" 
                onClick={abrirCertificadoHTTPS}
                size="sm"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Abrir Certificado (HTTPS 8182)
              </Button>
              <Button 
                variant="secondary" 
                onClick={forcarReconexaoQZ}
                disabled={loading}
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Forçar Reconexão
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => window.open('https://qz.io/download/', '_blank')}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download QZ Tray
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Impressoras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            🖨️ Impressoras Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {impressoras.length} impressora(s) encontrada(s)
            </p>
            <Button onClick={carregarImpressoras} variant="outline" size="sm" disabled={loading || !isConnected}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Lista
            </Button>
          </div>
          
          {impressoras.length > 0 ? (
            <div className="space-y-3">
              {impressoras.map((impressora, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Printer className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{impressora.name}</p>
                      {impressora.description && (
                        <p className="text-sm text-muted-foreground">{impressora.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">
                      Online
                    </Badge>
                    <Button
                      onClick={() => testarImpressora(impressora.name)}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                    >
                      <TestTube className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {isConnected ? 'Nenhuma impressora encontrada. Clique em "Atualizar Lista" para carregar.' : 'Conecte ao QZ Tray primeiro.'}
            </p>
          )}
          
          <div>
            <Label htmlFor="impressoraDefault">Impressora Padrão</Label>
            <Select value={impressoraSelecionada} onValueChange={setImpressoraSelecionada}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecionar impressora" />
              </SelectTrigger>
              <SelectContent>
                {impressoras.map((impressora, index) => (
                  <SelectItem key={index} value={impressora.name}>
                    {impressora.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            ⚙️ Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="impressaoAutomatica">Impressão Automática</Label>
              <p className="text-sm text-muted-foreground">
                Enviar pedidos automaticamente para impressão
              </p>
            </div>
            <Switch
              id="impressaoAutomatica"
              checked={impressaoAutomatica}
              onCheckedChange={setImpressaoAutomatica}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="larguraPapel">Largura do Papel (colunas)</Label>
              <Select value={larguraPapel.toString()} onValueChange={(value) => setLarguraPapel(parseInt(value))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="32">32 colunas</SelectItem>
                  <SelectItem value="42">42 colunas</SelectItem>
                  <SelectItem value="48">48 colunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="textoHeader">Texto do Cabeçalho</Label>
              <Input
                id="textoHeader"
                value={textoHeader}
                onChange={(e) => setTextoHeader(e.target.value)}
                placeholder="Texto do cabeçalho"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="textoFooter">Texto do Rodapé</Label>
              <Input
                id="textoFooter"
                value={textoFooter}
                onChange={(e) => setTextoFooter(e.target.value)}
                placeholder="Texto do rodapé"
                className="mt-1"
              />
            </div>
          </div>
          
          <Button onClick={saveConfigurations}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configuração
          </Button>
        </CardContent>
      </Card>

      {/* Seção de Teste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            🧪 Teste de Impressão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerTest">Cliente</Label>
              <Input
                id="customerTest"
                value={pedidoTeste.customer}
                onChange={(e) => setPedidoTeste(prev => ({ ...prev, customer: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="numberTest">Número do Pedido</Label>
              <Input
                id="numberTest"
                value={pedidoTeste.number}
                onChange={(e) => setPedidoTeste(prev => ({ ...prev, number: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={enviarPedidoTeste} disabled={loading || !isConnected}>
              <Play className="h-4 w-4 mr-2" />
              Enviar Pedido de Teste
            </Button>
            <Button onClick={testeRapido} variant="outline" disabled={loading || !impressoraSelecionada || !isConnected}>
              <Zap className="h-4 w-4 mr-2" />
              Teste Rápido
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            📋 Log de Atividades
          </CardTitle>
          <CardDescription>
            Histórico de operações e eventos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              {logs.length} entrada(s) no log
            </p>
            <Button onClick={limparLogs} variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Log
            </Button>
          </div>
          
          <div className="max-h-64 overflow-y-auto space-y-2">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 p-2 text-sm border-l-2 border-l-gray-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-muted-foreground font-mono">
                      {log.timestamp}
                    </span>
                    <Badge 
                      variant={log.type === 'success' ? 'default' : log.type === 'error' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {log.type}
                    </Badge>
                  </div>
                  <p className="flex-1">{log.message}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma atividade registrada ainda.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instruções para Produção HTTPS - SEMPRE VISÍVEL PARA TESTE */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-semibold mb-2">🔧 Configuração para Produção HTTPS:</p>
                <div className="space-y-2 text-xs">
                  <p><strong>Chrome:</strong></p>
                  <p>1. Clique no ícone 🔒 na barra de endereços</p>
                  <p>2. Selecione "Site settings"</p>
                  <p>3. Em "Insecure content" → "Allow"</p>
                  <p>4. Recarregue a página</p>
                  
                  <p><strong>Edge:</strong></p>
                  <p>Settings → Cookies and site permissions → Insecure content → Allow</p>
                  
                  <p><strong>Depois de configurar:</strong></p>
                  <p>• Certifique-se que o QZ Tray está rodando</p>
                  <p>• Clique em "Conectar QZ Tray"</p>
                  <p>• O sistema tentará múltiplas estratégias de conexão</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Aviso de Configuração */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">📞 Informações sobre QZ Tray:</p>
              <ul className="space-y-1 text-xs">
                <li>• Baixe e instale o QZ Tray em: <a href="https://qz.io/download/" target="_blank" rel="noopener noreferrer" className="underline">qz.io/download</a></li>
                <li>• Certifique-se de que o QZ Tray está rodando na bandeja do sistema</li>
                <li>• O QZ Tray funciona com impressoras térmicas ESC/POS</li>
                <li>• Para produção HTTPS, habilite "conteúdo misto" no navegador</li>
                <li>• Documentação oficial: <a href="https://qz.io/docs/" target="_blank" rel="noopener noreferrer" className="underline">qz.io/docs</a></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default ImpressaoQZTrayConfig;