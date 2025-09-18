import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
// SUPABASE REMOVIDO
import { MessageSquare, Play, RefreshCw, X, Trash2, CheckCircle } from 'lucide-react';

import type { WhatsappIntegration } from '@/types/whatsapp';

interface WhatsappStatus {
  connected: boolean;
  phone_number?: string;
  profile_name?: string;
  profile_picture?: string;
}

export const WhatsappConnect: React.FC = () => {
  const { currentCompany } = useAuth();
  const [integration, setIntegration] = useState<WhatsappIntegration | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsappStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<Array<{timestamp: string, level: string, message: string}>>([]);
  const [selectedPurpose, setSelectedPurpose] = useState<'primary' | 'marketing'>(() => {
    try {
      const saved = localStorage.getItem('wa:selectedPurpose');
      if (saved === 'primary' || saved === 'marketing') return saved as 'primary' | 'marketing';
    } catch {}
    return 'primary';
  });
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [credentialsWarning, setCredentialsWarning] = useState<string | null>(null);
  const [otherIntegration, setOtherIntegration] = useState<Partial<WhatsappIntegration> | null>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Adicionar log
  const addLog = (level: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const newLog = { timestamp, level, message };
    setLogs(prev => [...prev, newLog]);
    
    // Auto scroll para o final
    setTimeout(() => {
      if (logsContainerRef.current) {
        logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'Logs limpos');
  };

  useEffect(() => {
    const fetchIntegration = async () => {
      if (!currentCompany?.id) {
        setError('Nenhuma empresa selecionada.');
        setLoading(false);
        setIntegration(null);
        return;
      }
      addLog('info', 'Sistema iniciado');
      addLog('info', 'Carregando configuração WhatsApp...');
      setLoading(true);
      setError(null);
      // Evita estado antigo de outra instância
      setIntegration(null);
      setQrCodeUrl(null);
      setWhatsappStatus({ connected: false });
      
const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'whatsapp_integrations')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'company_id', currentCompany.id)
        /* .eq\( REMOVIDO */ ; //'purpose', selectedPurpose)
        /* .order\( REMOVIDO */ ; //'updated_at', { ascending: false })
        /* .limit\( REMOVIDO */ ; //1)
        /* .maybeSingle\( REMOVIDO */ ; //);
      if (error) {
        addLog('error', `Erro ao buscar integração (${selectedPurpose}): ${error.message || 'desconhecido'}`);
      }
      if (!data) {
        setError(`Configuração de integração WhatsApp (${selectedPurpose === 'primary' ? 'Agente IA' : 'Marketing'}) não encontrada para esta loja.`);
        addLog('error', 'Configuração não encontrada');
        setLoading(false);
        setIntegration(null); // Garante que não usamos a integração anterior
        return;
      }
      setIntegration(data as WhatsappIntegration);
      
      // Verificar se a outra instância usa a mesma instance_key (o que faria conectar o mesmo número)
      const otherPurpose = selectedPurpose === 'primary' ? 'marketing' : 'primary';
      const { data: other } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'whatsapp_integrations')
        /* .select\( REMOVIDO */ ; //'instance_key, host, token, control_id, purpose')
        /* .eq\( REMOVIDO */ ; //'company_id', currentCompany.id)
        /* .eq\( REMOVIDO */ ; //'purpose', otherPurpose)
        /* .maybeSingle\( REMOVIDO */ ; //);

      setOtherIntegration(other as any);

      if (other?.instance_key && other.instance_key === (data as any).instance_key) {
        setDuplicateWarning('Atenção: as instâncias Agente IA e Marketing estão usando a MESMA Instance Key. Cada QR conectará o mesmo número. Configure chaves diferentes para números separados.');
        addLog('warn', 'Instance Key duplicada entre Agente IA e Marketing');
      } else {
        setDuplicateWarning(null);
      }

      if (other && (other as any).host === (data as any).host && (other as any).token === (data as any).token) {
        setCredentialsWarning('As duas instâncias usam o MESMO Host e Token (mesma conta/servidor). Isso pode causar conexão espelhada ao escanear um QR. Recomenda-se usar tokens diferentes para cada instância.');
        addLog('warn', 'Host+Token idênticos entre instâncias');
      } else {
        setCredentialsWarning(null);
      }

      addLog('success', 'Configuração carregada com sucesso');
      setLoading(false);
    };
    fetchIntegration();
  }, [currentCompany, selectedPurpose]);

  // Ao trocar a instância, limpar estado visual para evitar confusão entre instâncias
  useEffect(() => {
    setQrCodeUrl(null);
    setWhatsappStatus({ connected: false });
    setIntegration(null);
    setError(null);
    addLog('info', `Instância selecionada: ${selectedPurpose === 'primary' ? 'Agente IA' : 'Marketing'}`);
  }, [selectedPurpose]);

  // Persistir seleção da instância entre recarregamentos
  useEffect(() => {
    try {
      localStorage.setItem('wa:selectedPurpose', selectedPurpose);
    } catch {}
  }, [selectedPurpose]);

  useEffect(() => {
    if (integration) {
      checkWhatsappStatus();
    }
  }, [integration]);

  const checkWhatsappStatus = async () => {
    if (!integration) return;
    
    addLog('info', 'Verificando status da conexão...');
    
    try {
      // Endpoint correto conforme documentação da Mega API
      const url = `https://${integration.host}/rest/instance/${integration.instance_key}`;
      console.log('🔍 Verificando status no endpoint:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${integration.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Status da resposta:', response.status, response.statusText);
      
      if (response.ok) {
        const res = await response.json();
        console.log('📋 Resposta completa da API:', JSON.stringify(res, null, 2));
        
        // Garantir que a resposta pertence à instância solicitada
        const instanceKeyFromResponse = String(res?.instance?.key || res?.instance?.instance_key || '');
        if (instanceKeyFromResponse && instanceKeyFromResponse !== integration.instance_key) {
          console.warn('⚠️ Instância divergente na resposta', {
            requested: integration.instance_key,
            received: instanceKeyFromResponse,
          });
          addLog('warn', 'Resposta de status pertence a outra instância. Ignorando.');
          setWhatsappStatus({ connected: false });
          return;
        }
        
        // Conforme documentação: conectado somente quando há usuário e status indica conexão
        const user = res?.instance?.user;
        const userId = user?.id || user?.wid || null;
        const status = String(res?.instance?.status || '').toLowerCase();
        const isConnected = !!userId && (status === 'open' || status === 'connected');
        
        console.log('🔍 Análise do status:', {
          hasUser: !!user,
          userId,
          status,
          isConnected,
          instanceKeyFromResponse: instanceKeyFromResponse || '(vazio)',
          requestedInstanceKey: integration.instance_key,
          fullInstance: res?.instance
        });
        
        if (isConnected) {
          const phoneNumber = userId || res.instance.key || 'Número não disponível';
          const profileName = user?.name || user?.pushName || 'Nome não disponível';
          
          console.log('✅ WhatsApp CONECTADO:', {
            phone: phoneNumber,
            name: profileName
          });
          
          setWhatsappStatus({
            connected: true,
            phone_number: phoneNumber,
            profile_name: profileName,
            profile_picture: user?.profilePicture
          });
          addLog('success', 'WhatsApp conectado com sucesso');
          addLog('info', 'Sincronização concluída');
        } else {
          console.log('❌ WhatsApp DESCONECTADO:', {
            hasUser: !!user,
            status: status,
            reason: !userId ? 'Sem usuário' : 'Status não indica conexão'
          });
          setWhatsappStatus({ connected: false });
          addLog('info', `Status atual: desconectado`);
        }
      } else {
        const errorText = await response.text();
        console.log('❌ Erro ao verificar status:', response.status, response.statusText, errorText);
        setWhatsappStatus({ connected: false });
        addLog('info', `Status atual: desconectado`);
      }
    } catch (err) {
      console.error('💥 Erro ao verificar status:', err);
      setWhatsappStatus({ connected: false });
      addLog('info', `Status atual: desconectado`);
    }
  };

  const generateQrCode = async () => {
    if (!integration) return;
    // Segurança: garantir que a integração corresponde ao propósito selecionado
    if (integration.purpose && integration.purpose !== selectedPurpose) {
      addLog('warn', 'Integração carregada não corresponde à instância selecionada. Abortando.');
      setError('A integração carregada não corresponde à instância selecionada.');
      return;
    }
    setConnecting(true);
    setQrCodeUrl(null);
    setError(null);
    
    addLog('info', 'Iniciando processo de conexão...');
    
    const endpoints = [
      `/rest/instance/qrcode/${integration.instance_key}`,
      `/rest/instance/qrcode_base64/${integration.instance_key}`
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Tentando endpoint: https://${integration.host}${endpoint}`);
        
        const url = `https://${integration.host}${endpoint}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${integration.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`Status da resposta: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          console.log(`Endpoint ${endpoint} falhou com status ${response.status}`);
          continue;
        }
        
        const res = await response.json();
        console.log('Resposta da API:', res);
        
        let qrCodeData = null;
        
        if (typeof res === 'string' && res.startsWith('data:image')) {
          qrCodeData = res;
        } else if (res?.qrcode) {
          qrCodeData = res.qrcode;
        } else if (res?.qr_code) {
          qrCodeData = res.qr_code;
        } else if (res?.qr) {
          qrCodeData = res.qr;
        } else if (res?.base64) {
          qrCodeData = `data:image/png;base64,${res.base64}`;
        } else if (res?.data) {
          qrCodeData = res.data;
        }
        
        if (qrCodeData) {
          console.log('QR Code encontrado:', qrCodeData.substring(0, 50) + '...');
          setQrCodeUrl(qrCodeData);
          addLog('success', 'QR Code gerado com sucesso');
          addLog('info', 'Aguardando escaneamento...');
          setConnecting(false);
          return;
        }
        
      } catch (err: any) {
        console.error(`Erro no endpoint ${endpoint}:`, err);
        continue;
      }
    }
    
    setError('Não foi possível gerar o QR Code. Isso pode acontecer se o WhatsApp já estiver conectado ou se houver um problema temporário.');
    addLog('error', 'Erro ao gerar QR Code');
    setConnecting(false);
  };

  const disconnectWhatsapp = async () => {
    if (!integration) return;
    setDisconnecting(true);
    setError(null);
    
    addLog('info', 'Desconectando WhatsApp...');
    
    try {
      // Endpoint correto conforme documentação da Mega API
      const url = `https://${integration.host}/rest/instance/${integration.instance_key}/logout`;
      console.log('🔌 Desconectando WhatsApp no endpoint:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${integration.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Status da desconexão:', response.status, response.statusText);
      
      if (response.ok) {
        const res = await response.json();
        console.log('✅ Resposta da desconexão:', res);
        
        setWhatsappStatus({ connected: false });
        setQrCodeUrl(null);
        addLog('info', 'WhatsApp desconectado');
        console.log('✅ WhatsApp desconectado com sucesso');
      } else {
        const errorText = await response.text();
        console.log('❌ Erro ao desconectar:', response.status, response.statusText, errorText);
        addLog('error', `Erro ao desconectar: ${response.status}`);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error('💥 Erro ao desconectar:', err);
      setError(`Erro ao desconectar: ${err.message}`);
      addLog('error', `Erro: ${err.message}`);
    }
    
    setDisconnecting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="bg-white border-b border-border px-6 h-18 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-semibold text-foreground">WhatsApp Business API</span>
              <span className="text-sm text-muted-foreground ml-2">v2.1.4</span>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mr-3"></div>
              <span className="text-muted-foreground">Carregando configuração WhatsApp...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !integration) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="bg-white border-b border-border px-6 h-18 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-semibold text-foreground">WhatsApp Business API</span>
              <span className="text-sm text-muted-foreground ml-2">v2.1.4</span>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-center py-12">
              <div className="text-destructive mb-4">❌ {error}</div>
              <div className="flex items-center justify-center gap-3">
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Tentar Novamente
                </button>
                <button
                  onClick={() => setSelectedPurpose(selectedPurpose === 'primary' ? 'marketing' : 'primary')}
                  className="px-4 py-2 border border-border text-foreground bg-background rounded-lg hover:bg-muted transition-colors"
                >
                  Trocar para {selectedPurpose === 'primary' ? 'Marketing' : 'Agente IA'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-white border-b border-border px-6 h-18 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-lg font-semibold text-foreground">WhatsApp Business API</span>
            <span className="text-sm text-muted-foreground ml-2">v2.1.4</span>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">Gerenciamento de Conexão</h1>
            <p className="text-muted-foreground">Configure e monitore a conexão da sua instância WhatsApp Business</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">Instância:</label>
            <select
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value as 'primary' | 'marketing')}
              className="h-9 rounded-md border border-border bg-background px-3"
            >
              <option value="primary">Agente IA</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>
        </div>

        {duplicateWarning && (
          <div className="mb-4 p-4 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-800">
            {duplicateWarning}
          </div>
        )}
        {credentialsWarning && (
          <div className="mb-6 p-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-800">
            {credentialsWarning}
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
              <h2 className="text-lg font-semibold text-foreground mb-1">Status da Conexão</h2>
              <p className="text-sm text-muted-foreground">Monitore o estado atual da sua instância WhatsApp</p>
            </div>
            
            <div className="p-6">
              {/* Status Card */}
              {whatsappStatus.connected ? (
                <>
                  <div className="flex items-center gap-4 p-5 bg-green-50 border border-green-200 rounded-lg mb-6">
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_0_4px_rgba(34,197,94,0.1)]"></div>
                    <div>
                      <h3 className="font-semibold text-green-800">WhatsApp Conectado</h3>
                      <p className="text-sm text-green-700">Seu WhatsApp está online e operacional. Pronto para receber mensagens.</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="font-medium text-green-800 mb-2">Status:</div>
                    <div className="text-sm text-green-700">Conectado e funcionando corretamente.</div>
                  </div>

                  <div className="bg-muted/30 border border-border rounded-lg p-5 mb-6">
                    {whatsappStatus.phone_number && (
                      <div className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
                        <span className="text-sm font-medium text-foreground">Número Conectado</span>
                        <span className="text-sm text-muted-foreground font-mono">{whatsappStatus.phone_number}</span>
                      </div>
                    )}
                    {whatsappStatus.profile_name && (
                      <div className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
                        <span className="text-sm font-medium text-foreground">Nome do Perfil</span>
                        <span className="text-sm text-muted-foreground font-mono">{whatsappStatus.profile_name}</span>
                      </div>
                    )}
                    {integration?.instance_key && (
                      <div className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
                        <span className="text-sm font-medium text-foreground">Instance Key</span>
                        <span className="text-sm text-muted-foreground font-mono">{integration.instance_key}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm font-medium text-foreground">Última Sincronização</span>
                      <span className="text-sm text-muted-foreground font-mono">{new Date().toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={disconnectWhatsapp}
                      disabled={disconnecting || !integration}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                    >
                      {disconnecting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          Desconectando...
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Desconectar
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={checkWhatsappStatus}
                      disabled={!integration}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-muted disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Atualizar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 p-5 bg-muted/30 border border-border rounded-lg mb-6">
                    <div className="w-3 h-3 bg-destructive rounded-full shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"></div>
                    <div>
                      <h3 className="font-semibold text-foreground">WhatsApp Desconectado</h3>
                      <p className="text-sm text-muted-foreground">Seu WhatsApp não está conectado. Inicie o processo de conexão para começar.</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="font-medium text-blue-800 mb-1">Próximo passo:</div>
                    <div className="text-sm text-blue-700">Clique em "Iniciar Conexão" para gerar um QR Code e conectar sua conta WhatsApp.</div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={generateQrCode}
                      disabled={connecting || !integration}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                    >
                      {connecting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          Conectando...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Iniciar Conexão
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={checkWhatsappStatus}
                      disabled={!integration}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-muted disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Verificar Status
                    </button>
                  </div>
                </>
              )}

              {/* Error Alert */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-6">
                  <div className="text-destructive text-sm">{error}</div>
                </div>
              )}

            </div>
          </div>

          {/* Sidebar Panel */}
          <div className="bg-card border border-border rounded-xl overflow-hidden h-fit">
            <div className="p-6 border-b border-border bg-muted/30">
              <h3 className="text-lg font-semibold text-foreground mb-1">QR Code de Conexão</h3>
              <p className="text-sm text-muted-foreground">Escaneie para conectar</p>
            </div>
            
            <div className="p-6 text-center">
              {qrCodeUrl && !whatsappStatus.connected ? (
                <>
                  <h4 className="text-base font-semibold text-foreground mb-2">QR Code Gerado</h4>
                  <p className="text-sm text-muted-foreground mb-6">Escaneie com seu WhatsApp</p>
                  
                  <div className="bg-white border-2 border-border rounded-lg p-6 mb-4 mx-auto w-60 h-60 flex items-center justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code WhatsApp" 
                      className="w-48 h-48" 
                    />
                  </div>
                  
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    1. Abra o WhatsApp no seu celular<br/>
                    2. Vá em Configurações → Dispositivos conectados<br/>
                    3. Toque em "Conectar dispositivo"<br/>
                    4. Escaneie este QR Code
                  </div>
                </>
              ) : whatsappStatus.connected ? (
                <>
                  <h4 className="text-base font-semibold text-foreground mb-2">Dispositivo Conectado</h4>
                  <p className="text-sm text-muted-foreground mb-6">WhatsApp está sincronizado</p>
                  
                  <div className="py-10">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  </div>
                  
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    Sua conta WhatsApp foi conectada com sucesso e está pronta para uso.
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-base font-semibold text-foreground mb-2">Aguardando conexão...</h4>
                  <p className="text-sm text-muted-foreground mb-6">Clique em "Iniciar Conexão" para gerar o QR Code</p>
                  
                  <div className="bg-muted/30 border border-border rounded-lg p-6 mb-4 mx-auto w-60 h-60 flex items-center justify-center">
                    <div className="text-muted-foreground">QR Code será exibido aqui</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsappConnect;