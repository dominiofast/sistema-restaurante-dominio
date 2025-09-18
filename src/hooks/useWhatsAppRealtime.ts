import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { supabase } from '@/integrations/supabase/client'; // DESABILITADO - Sistema migrado para PostgreSQL
import { toast } from 'sonner';
import { whatsappFallback } from '@/services/whatsappFallbackSystem';
import { whatsappConnectionManager } from '@/services/whatsappConnectionManager';

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isFromMe: boolean;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'audio' | 'document';
  messageId?: string;
}

interface Chat {
  id: string;
  chatId: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  phoneNumber: string;
  messages: Message[];
}

interface UseWhatsAppRealtimeProps {
  companyId: string | undefined;
  onNewMessage?: (message: any) => void;
  onChatUpdate?: (chat: any) => void;
}

interface ConnectionStatus {
  isConnected: boolean;
  isReconnecting: boolean;
  lastConnected: Date | null;
  retryCount: number;
  quality: 'excellent' | 'good' | 'poor' | 'critical';
  latency: number;
}

interface RealtimeDiagnostics {
  messagesReceived: number;
  messagesLost: number;
  reconnections: number;
  averageLatency: number;
  lastError: string | null;
}

export const useWhatsAppRealtime = ({ 
  companyId, 
  onNewMessage,
  onChatUpdate 
}: UseWhatsAppRealtimeProps) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isReconnecting: false,
    lastConnected: null,
    retryCount: 0,
    quality: 'critical',
    latency: 0
  });

  const [diagnostics, setDiagnostics] = useState<RealtimeDiagnostics>({
    messagesReceived: 0,
    messagesLost: 0,
    reconnections: 0,
    averageLatency: 0,
    lastError: null
  });

  const channelsRef = useRef<any[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const noActivityWatchdogRef = useRef<NodeJS.Timeout>();
  const pollingIntervalRef = useRef<NodeJS.Timeout>();
  const gapWatcherIntervalRef = useRef<NodeJS.Timeout>();
  const isUnmountedRef = useRef(false);
  const lastMessageTimestamp = useRef<string>();
  const messageQueueRef = useRef<any[]>([]);
  const realtimeWorkingRef = useRef(false);
  const fallbackInitialized = useRef(false);
  const connectionManagerInitialized = useRef(false);
  const processedIdsRef = useRef<Set<string>>(new Set());
  const broadcastChannelRef = useRef<any>(null);
  
  // Debounce otimizado para evitar processamento duplicado
  const debouncedMessageHandler = useMemo(
    () => {
      let timeout: NodeJS.Timeout;
      return (message: any) => {
        if (isUnmountedRef.current) return;
        
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const messageId = message.message_id || message.id;
          const alreadyProcessed = messageQueueRef.current.some(m => m.id === messageId);
          
          if (!alreadyProcessed) {
            messageQueueRef.current.push({ id: messageId, timestamp: Date.now() });
            
            // Limpar queue antiga (manter apenas últimas 100 mensagens)
            if (messageQueueRef.current.length > 100) {
              messageQueueRef.current = messageQueueRef.current.slice(-50);
            }
            
            lastMessageTimestamp.current = message.timestamp;
            onNewMessage?.(message);
            
            setDiagnostics(prev => ({
              ...prev,
              messagesReceived: prev.messagesReceived + 1
            }));
          }
        }, 100);
      };
    },
    [onNewMessage]
  );

  // Cleanup de todos os timeouts
  const cleanupTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);

  // Cleanup de canais
  const cleanupChannels = useCallback(() => {
    channelsRef.current.forEach(channel => {
      try {
        // supabase. // DESABILITADO - removeChannel(channel);
      } catch (error) {
        console.warn('Erro ao remover canal:', error);
      }
    });
    channelsRef.current = [];
  }, []);

  // Inicializar sistema de fallback
  const initializeFallback = useCallback(() => {
    if (!companyId || fallbackInitialized.current) return;
    
    try {
      whatsappFallback.initialize(companyId);
      fallbackInitialized.current = true;
      console.log('🔧 Sistema de fallback inicializado para company:', companyId);
    } catch (error) {
      console.error('Erro ao inicializar fallback:', error);
    }
  }, [companyId]);

  // Inicializar gerenciador de conexões
  const initializeConnectionManager = useCallback(() => {
    if (!companyId || connectionManagerInitialized.current) return;
    
    whatsappConnectionManager.initialize(companyId);
    
    // Configurar callbacks do gerenciador
    whatsappConnectionManager.setCallbacks({
      onConnectionChange: (connected) => {
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: connected,
          lastConnected: connected ? new Date() : prev.lastConnected
        }));
      },
      onQualityChange: (quality) => {
        setConnectionStatus(prev => ({
          ...prev,
          quality: quality.level,
          latency: whatsappConnectionManager.getMetrics().latency
        }));
      },
      onAlert: (alert) => {
        console.log(`🚨 Alerta de conexão: ${alert.message}`);
        if (alert.type === 'critical') {
          toast.error(`Conexão crítica: ${alert.message}`, { duration: 5000 });
        }
      },
      onMetricsUpdate: (metrics) => {
        setDiagnostics(prev => ({
          ...prev,
          messagesReceived: metrics.messagesReceived,
          reconnections: metrics.reconnections,
          averageLatency: metrics.latency,
          lastError: metrics.lastError
        }));
      }
    });
    
    connectionManagerInitialized.current = true;
    console.log('🔗 Gerenciador de conexões inicializado');
  }, [companyId]);

  // Processar mensagens do sistema de fallback
  const processQueuedMessages = useCallback(() => {
    const processed = whatsappFallback.processAllPendingMessages((message, source) => {
      console.log(`📨 Processando mensagem de ${source}:`, {
        id: message.message_id || message.id,
        content: message.message_content?.substring(0, 30)
      });
      
      lastMessageTimestamp.current = message.timestamp;
      onNewMessage?.(message);
      
      setDiagnostics(prev => ({
        ...prev,
        messagesReceived: prev.messagesReceived + 1
      }));
      
      // Toast para mensagens recebidas via fallback
      if (!message.is_from_me && source === 'polling') {
        const senderName = message.contact_name || 'Contato';
        toast.success(`📨 ${senderName} (via fallback)`, {
          duration: 3000,
          description: message.message_content?.substring(0, 50) || 'Nova mensagem'
        });
      }
    });
    
    if (processed > 0) {
      console.log(`✅ Processadas ${processed} mensagens da queue`);
    }
  }, [onNewMessage]);

  // Processar queue periodicamente
  useEffect(() => {
    if (!companyId) return;
    
    const interval = setInterval(processQueuedMessages, 1000);
    return () => clearInterval(interval);
  }, [companyId, processQueuedMessages]);

  // Reconexão com backoff exponencial inteligente
  const scheduleReconnection = useCallback((setupFn: () => Promise<void>) => {
    if (isUnmountedRef.current) return;
    
    const delay = Math.min(1000 * Math.pow(2, connectionStatus.retryCount), 30000); // Max 30s
    
    setConnectionStatus(prev => ({
      ...prev,
      isReconnecting: true,
      retryCount: prev.retryCount + 1
    }));
    
    setDiagnostics(prev => ({
      ...prev,
      reconnections: prev.reconnections + 1
    }));
    
    console.log(`🔄 Reagendando reconexão em ${delay}ms (tentativa ${connectionStatus.retryCount + 1})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isUnmountedRef.current) {
        setupFn();
      }
    }, delay);
  }, [connectionStatus.retryCount]);

  // Configurar subscriptions real-time otimizadas
  const setupRealtimeSubscriptions = useCallback(async () => {
    if (!companyId || isUnmountedRef.current) return;

    console.log('🔔 CONFIGURANDO REAL-TIME OTIMIZADO PARA COMPANY:', companyId);
    
    // Diagnóstico desabilitado
    console.log('🔍 Diagnóstico desabilitado');

    // Cleanup de canais anteriores
    cleanupChannels();
    
    const startTime = Date.now();

    // Canal para mensagens com configuração otimizada
    const messagesChannel = supabase
      // .channel( // DESABILITADO`whatsapp_messages_${companyId}`)
      // .on( // DESABILITADO
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `company_id=eq.${companyId}`
        },
        (payload) => {
          if (isUnmountedRef.current) return;
          
          const latency = Date.now() - startTime;
          
          if (payload.new) {
            console.log('🎯 NOVA MENSAGEM VIA REALTIME:', {
              id: payload.new.message_id,
              company: payload.new.company_id,
              content: payload.new.message_content?.substring(0, 30),
              latency: `${latency}ms`
            });
            
            realtimeWorkingRef.current = true;
            
            // Notificar sistema de fallback sobre mensagem realtime
            whatsappFallback.notifyRealtimeMessage(payload.new);
            
            // Notificar gerenciador de conexões sobre mensagem recebida
            whatsappConnectionManager.notifyMessageReceived(latency);
            
            const pid = payload.new.id || payload.new.message_id;
            if (pid) processedIdsRef.current.add(String(pid));

            // Injetar imediatamente na UI (além do fallback queue)
            debouncedMessageHandler(payload.new);

            // Notificação removida - agora é gerenciada pelo GlobalWhatsAppNotificationProvider
          }
        }
      // )
      // .on( // DESABILITADO
      //   'postgres_changes',
      //   {
      //     event: 'UPDATE',
      //     schema: 'public',
      //     table: 'whatsapp_messages'
      //   },
      //   (payload) => {
      //     if (isUnmountedRef.current) return;
      //     
      //     // Filtrar manualmente por company_id
      //     if (payload.new?.company_id === companyId) {
      //       console.log('⚡ ATUALIZAÇÃO DE MENSAGEM VIA REALTIME:', payload.new);
      //       debouncedMessageHandler(payload.new);
      //     }
      //   }
      // );

    // Canal para chats
    const chatsChannel = supabase
      // .channel( // DESABILITADO`whatsapp_chats_${companyId}`)
      // .on( // DESABILITADO
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_chats',
          filter: `company_id=eq.${companyId}`
        },
        (payload) => {
          if (isUnmountedRef.current) return;

          const chatData = payload.new || payload.old || {};
          
          // Filtrar manualmente por company_id
          if ((chatData as any)?.company_id === companyId) {
            console.log('💬 CHAT ATUALIZADO VIA REALTIME:', {
              chatId: (chatData as any)?.chat_id,
              event: payload.eventType
            });
            onChatUpdate?.(payload);
          }
        }
      );

    // Gerenciar status de conexão de forma inteligente
    const handleSubscriptionStatus = (status: string, channel: any) => {
      const now = new Date();
      
      console.log('🔔 STATUS SUBSCRIPTION:', {
        status,
        channel: channel.topic,
        timestamp: now.toISOString()
      });
      
      if (status === 'SUBSCRIBED') {
        realtimeWorkingRef.current = true;
        
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: true,
          isReconnecting: false,
          lastConnected: now,
          retryCount: 0,
          quality: 'excellent',
          latency: Date.now() - startTime
        }));
        
        // Notificar sistema de fallback que realtime está funcionando
        whatsappFallback.forceMode('realtime');
        
        // Notificar gerenciador de conexões sobre sucesso
        whatsappConnectionManager.notifyConnectionSuccess(Date.now() - startTime);
        
        console.log('✅ REALTIME CONECTADO COM SUCESSO!');

        // Parar polling agressivo se estiver ativo
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = undefined;
          console.log('⏹️ Polling agressivo parado');
        }

        // Watchdog: se não houver atividade em 5s mesmo SUBSCRIBED, iniciar polling
        if (noActivityWatchdogRef.current) {
          clearTimeout(noActivityWatchdogRef.current);
        }
        noActivityWatchdogRef.current = setTimeout(() => {
          if (!isUnmountedRef.current && !realtimeWorkingRef.current) {
            console.warn('⏱️ Sem atividade após SUBSCRIBED. Iniciando polling agressivo.');
            startPollingAggressive();
          }
        }, 5000);
        
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        realtimeWorkingRef.current = false;
        
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: false,
          quality: 'critical'
        }));
        
        setDiagnostics(prev => ({
          ...prev,
          lastError: `Connection error: ${status}`
        }));
        
        console.log('❌ ERRO NA CONEXÃO REALTIME:', status);
        
        // Notificar sistema de fallback sobre falha
        whatsappFallback.notifyRealtimeFailure(status);
        
        // Notificar gerenciador de conexões sobre falha
        whatsappConnectionManager.notifyConnectionFailure(status);

        // Iniciar polling agressivo
        startPollingAggressive();
      }
    };

    // Subscribe nos canais
    messagesChannel// .subscribe( // DESABILITADO(status) => handleSubscriptionStatus(status, messagesChannel));
    chatsChannel// .subscribe( // DESABILITADO(status) => handleSubscriptionStatus(status, chatsChannel));

    // Canal Broadcast: permite que o webhook notifique diretamente o frontend
    try {
      broadcastChannelRef.current = supabase
        // .channel( // DESABILITADO`whatsapp:${companyId}`, { config: { broadcast: { self: false } } })
        // .on( // DESABILITADO'broadcast', { event: 'new_message' }, (payload: any) => {
          const m = payload?.payload || payload;
          if (!m) return;
          const mid = m.id || m.message_id;
          if (mid && !processedIdsRef.current.has(String(mid))) {
            processedIdsRef.current.add(String(mid));
            debouncedMessageHandler(m);
          }
        })
        // .subscribe( // DESABILITADO(status: string) => {
          console.log('📡 Broadcast status:', status, `topic=whatsapp:${companyId}`);
          if (status === 'SUBSCRIBED') {
            // Se não houver atividade em 3s, puxa via polling
            setTimeout(() => {
              if (!isUnmountedRef.current && !realtimeWorkingRef.current) {
                console.warn('📡 Broadcast ativo, mas sem eventos. Iniciando polling garantido.');
                startPollingAggressive(true);
              }
            }, 3000);
          }
        });
      console.log('📡 Broadcast inscrito:', `whatsapp:${companyId}`);
    } catch (e) {
      console.warn('⚠️ Falha ao inscrever broadcast:', e);
    }

    // Armazenar referências dos canais
    channelsRef.current = [messagesChannel, chatsChannel];

    // Garantia: iniciar polling forçado para capturar mensagens em trânsito
    startPollingAggressive(true);
    const isLocalhost = typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname);
    if (!isLocalhost) {
      // Em produção, encerramos após 10s se realtime conectado
      setTimeout(() => {
        if (pollingIntervalRef.current && connectionStatus.isConnected) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = undefined;
          console.log('⏹️ Polling forçado inicial encerrado');
        }
      }, 10000);
    } else {
      console.log('🧪 Ambiente local detectado: mantendo polling garantido ativo');
    }

  }, [companyId, onNewMessage, onChatUpdate, debouncedMessageHandler]);

  // Polling agressivo (2s) como garantia quando realtime não está ativo
  const startPollingAggressive = useCallback((force = false) => {
    if (pollingIntervalRef.current || !companyId) return;
    pollingIntervalRef.current = setInterval(async () => {
      if (isUnmountedRef.current) return;
      // FORÇA POLLING SEMPRE no localhost, independente de conexão
      const isLocalhost = typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname);
      if (!force && !isLocalhost && connectionStatus.isConnected) return;
      
      try {
        const { data: recentMessages } = await supabase
          // .from( // DESABILITADO'whatsapp_messages')
          .select('*')
          .eq('company_id', companyId)
          .order('timestamp', { ascending: false })
          .limit(8);
          
        if (recentMessages?.length) {
          recentMessages.reverse().forEach((m: any) => {
            const mid = m.id || m.message_id;
            if (mid && !processedIdsRef.current.has(String(mid))) {
              processedIdsRef.current.add(String(mid));
              debouncedMessageHandler(m);
            }
          });
        }
      } catch (err) {
        console.warn('⚠️ Polling agressivo falhou:', err);
      }
    }, 2000);
  }, [companyId, connectionStatus.isConnected, debouncedMessageHandler]);

  // Função para forçar reconexão manual
  const forceReconnect = useCallback(() => {
    console.log('🔄 Forçando reconexão manual...');
    cleanupChannels();
    setConnectionStatus(prev => ({ ...prev, retryCount: 0 }));
    setupRealtimeSubscriptions();
  }, [cleanupChannels, setupRealtimeSubscriptions]);

  // Configurar subscriptions quando companyId muda - COM THROTTLE
  useEffect(() => {
    if (!companyId) return;

    // THROTTLE: evitar múltiplas execuções muito rápidas
    const setupTimeout = setTimeout(() => {
      if (isUnmountedRef.current) return;

      // CRÍTICO: resetar flag de unmount ao inicializar
      isUnmountedRef.current = false;

      initializeFallback();
      initializeConnectionManager();
      setupRealtimeSubscriptions();

      // Gap watcher: mesmo com realtime SUBSCRIBED, busca a cada 3s as 5 últimas mensagens
      if (!gapWatcherIntervalRef.current) {
        gapWatcherIntervalRef.current = setInterval(async () => {
          if (isUnmountedRef.current) return;
          try {
            const { data: recent } = await supabase
              // .from( // DESABILITADO'whatsapp_messages')
              .select('*')
              .eq('company_id', companyId)
              .order('timestamp', { ascending: false })
              .limit(5);
              
            if (recent?.length) {
              recent.reverse().forEach((m: any) => {
                const mid = m.id || m.message_id;
                if (mid && !processedIdsRef.current.has(String(mid))) {
                  processedIdsRef.current.add(String(mid));
                  debouncedMessageHandler(m);
                }
              });
            }
          } catch (err) {
            // silencioso
          }
        }, 3000);
      }

      // GARANTIA LOCALHOST: iniciar polling imediatamente
      setTimeout(() => {
        startPollingAggressive(true);
      }, 1000);

      // GARANTIA EXTRA: buscar mensagens imediatamente ao conectar
      setTimeout(async () => {
        try {
          const { data: existingMessages } = await supabase
            // .from( // DESABILITADO'whatsapp_messages')
            .select('*')
            .eq('company_id', companyId)
            .order('timestamp', { ascending: false })
            .limit(20);
          
          if (existingMessages?.length) {
            // Limpar IDs processados para forçar injeção inicial
            processedIdsRef.current.clear();
            
            existingMessages.reverse().forEach((m: any) => {
              const mid = m.id || m.message_id;
              processedIdsRef.current.add(String(mid));
              debouncedMessageHandler(m);
            });
          }
        } catch (error) {
          console.error('Erro ao carregar mensagens existentes:', error);
        }
      }, 2000);
    }, 500); // THROTTLE de 500ms

    return () => {
      // CRÍTICO: Evitar loop infinito
      console.log('🧹 Sistema de fallback destruído');
      console.log('🧹 Gerenciador de conexões destruído');
      
      clearTimeout(setupTimeout);
      isUnmountedRef.current = true;
      cleanupChannels();
      cleanupTimeouts();
      
      // Cleanup fallback
      if (fallbackInitialized.current) {
        whatsappFallback.destroy();
        fallbackInitialized.current = false;
      }
      
      // Cleanup connection manager
      if (connectionManagerInitialized.current) {
        whatsappConnectionManager.destroy();
        connectionManagerInitialized.current = false;
      }
      
      if (broadcastChannelRef.current) {
        try { 
          // supabase. // DESABILITADO - removeChannel(broadcastChannelRef.current);
          broadcastChannelRef.current = null;
        } catch {}
      }
      if (gapWatcherIntervalRef.current) {
        clearInterval(gapWatcherIntervalRef.current);
        gapWatcherIntervalRef.current = undefined;
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = undefined;
      }
    };
  }, [companyId, initializeFallback, initializeConnectionManager, setupRealtimeSubscriptions, cleanupChannels, cleanupTimeouts, debouncedMessageHandler, startPollingAggressive]);

  // Cleanup geral no unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      cleanupChannels();
      cleanupTimeouts();
    };
  }, [cleanupChannels, cleanupTimeouts]);

  // Executar diagnóstico manual (desabilitado)
  const runDiagnostic = useCallback(async () => {
    return { status: 'disabled' };
  }, []);

  // Obter estado do sistema de fallback
  const getFallbackState = useCallback(() => {
    return whatsappFallback.getState();
  }, []);

  // Forçar modo de fallback
  const forceFallbackMode = useCallback((mode: 'realtime' | 'polling') => {
    whatsappFallback.forceMode(mode);
    
    if (mode === 'realtime') {
      // Tentar reconectar realtime
      forceReconnect();
    }
  }, []);

  // Obter métricas de conexão
  const getConnectionMetrics = useCallback(() => {
    return whatsappConnectionManager.getMetrics();
  }, []);

  // Obter qualidade de conexão
  const getConnectionQuality = useCallback(() => {
    return whatsappConnectionManager.getQuality();
  }, []);

  // Obter alertas de conexão
  const getConnectionAlerts = useCallback((unresolvedOnly = false) => {
    return whatsappConnectionManager.getAlerts(unresolvedOnly);
  }, []);

  // Resolver alerta
  const resolveAlert = useCallback((alertId: string) => {
    whatsappConnectionManager.resolveAlert(alertId);
  }, []);

  // Forçar reconexão via gerenciador
  const forceReconnectAdvanced = useCallback(() => {
    console.log('🔄 Forçando reconexão avançada...');
    whatsappConnectionManager.forceReconnection();
    forceReconnect();
  }, []);

  return {
    connectionStatus,
    diagnostics,
    forceReconnect,
    forceReconnectAdvanced,
    runDiagnostic,
    getFallbackState,
    forceFallbackMode,
    getConnectionMetrics,
    getConnectionQuality,
    getConnectionAlerts,
    resolveAlert,
    isConnected: connectionStatus.isConnected,
    isReconnecting: connectionStatus.isReconnecting,
    retryCount: connectionStatus.retryCount,
    quality: connectionStatus.quality,
    latency: connectionStatus.latency
  };
};